"use client"
import { format } from "date-fns"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { Reservation, TimeBlock } from "@/lib/types"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

const phoneRegex = /^(01[016789])-\d{3,4}-\d{4}$/

const formSchema = z.object({
  nickname: z.string().min(2, "닉네임은 2자 이상이어야 합니다."),
  studentName: z.string().min(2, "학생 이름은 필수 항목입니다."),
  studentId: z.string().min(6, "유효한 학번을 입력해주세요.").regex(/^\d+$/, "학번은 숫자만 포함해야 합니다."),
  phoneNumber: z.string().regex(phoneRegex, "전화번호 형식을 확인해 주세요."),
  purpose: z.string().min(4, "사용 목적을 4자 이상 입력해주세요."),
})

interface ReservationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date
  selectedBlocks: TimeBlock[]
  timeBlocks: TimeBlock[]
  existingReservations: Reservation[]
  onReservation: (reservation: Reservation) => void
  onReservationUpdate: () => void
  selectedRoomId?: string
}

export default function ReservationDialog({
  open,
  onOpenChange,
  selectedDate,
  selectedBlocks,
  timeBlocks,
  existingReservations,
  onReservation,
  onReservationUpdate,
  selectedRoomId,
}: ReservationDialogProps) {
  const { toast } = useToast()
  const dateString = format(selectedDate, "yyyy-MM-dd")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverMessage, setServerMessage] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: "",
      studentName: "",
      studentId: "",
      phoneNumber: "",
      purpose: "",
    },
  })

  // Reset form when dialog opens with new selected time blocks
  useEffect(() => {
    if (open && selectedBlocks.length > 0) {
      form.reset({
        nickname: "",
        studentName: "",
        studentId: "",
        phoneNumber: "",
        purpose: "",
      })
      setServerMessage("")
    }
  }, [open, selectedBlocks, form])

  // Convert time string (HH:MM) to UTC ISO-8601 datetime
  const timeToISOString = (dateStr: string, timeStr: string): string => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const [hours, minutes] = timeStr.split(":").map(Number);
    
    // UTC 시간으로 Date 객체 생성
    const date = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    return date.toISOString();
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedRoomId) {
      toast({
        title: "세미나실 미선택",
        description: "세미나실을 먼저 선택해주세요.",
        variant: "destructive",
      })
      return
    }
    if (selectedBlocks.length === 0) {
      toast({
        title: "시간 선택 오류",
        description: "유효한 시간 범위를 선택해 주세요.",
        variant: "destructive",
      })
      return
    }

    let startTime: string
    let endTime: string

    if (selectedBlocks.length === 1) {
      const block = selectedBlocks[0]
      const blockIndex = timeBlocks.findIndex((b) => b.time === block.time)
      const nextBlockIndex = blockIndex + 1

      startTime = block.time
      endTime = nextBlockIndex < timeBlocks.length ? timeBlocks[nextBlockIndex].time : "24:00"
    } else {
      const block1Index = timeBlocks.findIndex((block) => block.time === selectedBlocks[0].time)
      const block2Index = timeBlocks.findIndex((block) => block.time === selectedBlocks[1].time)

      const startIndex = Math.min(block1Index, block2Index)
      const endIndex = Math.max(block1Index, block2Index)

      startTime = timeBlocks[startIndex].time
      const nextBlockIndex = endIndex + 1
      endTime = nextBlockIndex < timeBlocks.length ? timeBlocks[nextBlockIndex].time : "24:00"
    }

    // Handle 24:00 case
    const endTimeForISO = endTime === "24:00" ? "00:00" : endTime
    const endDateForISO =
      endTime === "24:00" ? format(new Date(selectedDate.getTime() + 86400000), "yyyy-MM-dd") : dateString

    // Format phone number
    const formattedPhoneNumber = values.phoneNumber.replace(/\s+/g, "")

    // Create reservation data for API
    const reservationData = {
      roomId: selectedRoomId,
      nickname: values.nickname,
      studentName: values.studentName,
      studentId: Number.parseInt(values.studentId, 10),
      phoneNumber: formattedPhoneNumber,
      purpose: values.purpose,
      startTime: timeToISOString(dateString, startTime),
      endTime: timeToISOString(endDateForISO, endTimeForISO)
    }

    try {
      setIsSubmitting(true)

      const response = await fetch("/api/reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      })

      if (response.ok) {
        const message = await response.text()
        setServerMessage(message)

        // Create new reservation for local state
        const newReservation: Reservation = {
          id: `${Date.now()}`,
          date: dateString,
          nickname: values.nickname,
          studentName: values.studentName,
          studentId: values.studentId,
          phoneNumber: formattedPhoneNumber,
          purpose: values.purpose,
          startTime: startTime,
          endTime: endTime,
        }

        // Update local state
        onReservation(newReservation)

        // Fetch updated reservations
        onReservationUpdate()
      } else {
        const errorText = await response.text()
        toast({
          title: "예약 실패",
          description: errorText || "예약에 실패했습니다. 다시 시도해 주세요.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "예약을 처리하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTimeRangeLabel = () => {
    if (selectedBlocks.length < 2) return ""

    const block1Index = timeBlocks.findIndex((block) => block.time === selectedBlocks[0].time)
    const block2Index = timeBlocks.findIndex((block) => block.time === selectedBlocks[1].time)

    const startIndex = Math.min(block1Index, block2Index)
    const endIndex = Math.max(block1Index, block2Index)

    const startBlock = timeBlocks[startIndex]

    // Calculate the end time (which is the time of the block after the last selected block)
    const nextBlockIndex = endIndex + 1
    const endTime = nextBlockIndex < timeBlocks.length ? timeBlocks[nextBlockIndex].time : "24:00" // Use 24:00 instead of 00:00

    return `${startBlock.time} - ${endTime}`
  }

  // If we have a server message, show the success UI
  if (serverMessage) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reservation Successful</DialogTitle>
          </DialogHeader>

          <div className="py-6 text-center">
            <div className="mb-4 text-green-600 bg-green-50 p-4 rounded-md">{serverMessage}</div>
            <p className="text-muted-foreground">
              Your reservation has been confirmed for {format(selectedDate, "MMMM d, yyyy")}
            </p>
            <p className="font-medium mt-2">
              {selectedBlocks.length === 1 ? selectedBlocks[0].label : getTimeRangeLabel()}
            </p>
          </div>

          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>예약 정보 입력</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>닉네임</FormLabel>
                    <FormDescription>닉네임을 입력해주세요.</FormDescription>
                    <FormControl>
                      <Input placeholder="춤추는 부리또" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>연락처</FormLabel>
                    <FormDescription>연락처를 입력해주세요.</FormDescription>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="010-1234-5678"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '')
                          let formatted = ''

                          if (value.length > 0) {
                            if (value.length <= 3) {
                              formatted = value
                            } else if (value.length <= 7) {
                              formatted = `${value.slice(0, 3)}-${value.slice(3)}`
                            } else {
                              formatted = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`
                            }
                          }

                          field.onChange(formatted)
                        }}
                        maxLength={13}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="studentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름</FormLabel>
                    <FormDescription>
                        <p>이름을 입력해주세요.</p>
                        <p>예약 취소에 사용됩니다.</p>
                    </FormDescription>
                    <FormControl>
                      <Input placeholder="김데이비드" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>학번</FormLabel>
                    <FormDescription>
                        <p>학번을 입력해주세요.</p>
                        <p>예약 취소에 사용됩니다.</p>
                    </FormDescription>
                    <FormControl>
                      <Input placeholder="123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>목적</FormLabel>
                  <FormDescription>사용 목적을 입력해주세요.</FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="동아리 발전을 위한 회의 진행"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  예약 시간
                </label>
                <div className="p-2 border rounded-md bg-muted">
                  {selectedBlocks.length === 1
                    ? selectedBlocks[0].label
                    : selectedBlocks.length === 2
                      ? getTimeRangeLabel()
                      : "Not selected"}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      처리 중...
                  </>
                ) : (
                  "예약하기"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
