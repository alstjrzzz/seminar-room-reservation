"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Reservation } from "@/lib/types"

const formSchema = z.object({
  studentName: z.string().min(2, "이름은 필수 항목입니다."),
  studentId: z.string().min(6, "유효한 학번을 입력해주세요.").regex(/^\d+$/, "학번은 숫자만 포함해야 합니다."),
})

interface CancellationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedReservation: Reservation | null
  onCancel: (success: boolean) => void
}

export default function CancellationDialog({
  open,
  onOpenChange,
  selectedReservation,
  onCancel,
}: CancellationDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: "",
      studentId: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedReservation) {
      toast({
        title: "Error",
        description: "취소할 예약이 선택되지 않았습니다.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Prepare the request body according to the backend DTO requirements
      const requestBody = {
        reservationId: Number.parseInt(selectedReservation.id, 10),
        studentName: values.studentName,
        studentId: Number.parseInt(values.studentId, 10),
      }

      // Send DELETE request to the API endpoint
      const response = await fetch("/api/reservation", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        toast({
          title: "예약이 취소되었습니다.",
          description: "예약이 성공적으로 취소되었습니다.",
        })
        onOpenChange(false)
        onCancel(true)
      } else {
        const errorText = await response.text()
        toast({
          title: "예약 취소에 실패했습니다.",
          description: errorText || "예약 취소에 실패했습니다. 정보를 확인하고 다시 시도해주세요.",
          variant: "destructive",
        })
        onCancel(false)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "예약 취소 중 오류가 발생했습니다.",
        variant: "destructive",
      })
      console.error("Cancellation error:", error)
      onCancel(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>예약 취소</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {selectedReservation && (
              <div className="p-3 bg-muted rounded-md mb-4 max-h-40 overflow-y-auto">
                <p className="font-medium">{selectedReservation.nickname}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedReservation.date} • {selectedReservation.startTime} - {selectedReservation.endTime}
                </p>
                <p className="text-sm text-muted-foreground mt-1 break-words whitespace-pre-wrap break-all">
                  {selectedReservation.purpose}
                </p>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              예약을 취소하려면 예약 시 입력한 정보를 입력해주세요.
            </p>

            <FormField
              control={form.control}
              name="studentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름</FormLabel>
                  <FormControl>
                    <Input placeholder="이름을 입력해주세요." {...field} />
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
                  <FormControl>
                    <Input placeholder="학번을 입력해주세요." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" variant="destructive" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    취소 중...
                  </>
                ) : (
                  "예약 취소하기"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
