"use client"

import { useState, useEffect, useCallback } from "react"
import { addDays, format, isSameDay, startOfDay, endOfDay, parseISO } from "date-fns"
import { ko } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import TimeBlockGrid from "@/components/time-block-grid"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Users, MapPin, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Reservation } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export default function ReservationCalendar() {
  const { toast } = useToast()
  const today = startOfDay(new Date()) // Use startOfDay to remove time component
  const maxDate = endOfDay(addDays(today, 6)) // Exactly 7 days (today + 6 more days)
  const [selectedDate, setSelectedDate] = useState<Date>(today)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  type Room = {
    id: string
    name: string
    roomNumber: string
    location: string
    capacity: number
    equipment: string[]
    description?: string
    photos: string[]
  }
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsRoom, setDetailsRoom] = useState<Room | null>(null)
  const [photoIndex, setPhotoIndex] = useState(0)

  const openRoomDetails = (room: Room) => {
    setDetailsRoom(room)
    setPhotoIndex(0)
    setDetailsOpen(true)
  }

  const showPrevPhoto = () => {
    if (!detailsRoom) return
    setPhotoIndex((prev) => (prev - 1 + detailsRoom.photos.length) % detailsRoom.photos.length)
  }

  const showNextPhoto = () => {
    if (!detailsRoom) return
    setPhotoIndex((prev) => (prev + 1) % detailsRoom.photos.length)
  }

  // Function to fetch reservations by selected room from the API
  const fetchReservations = useCallback(async (roomId?: string) => {
    try {
      if (!roomId) return
      setIsLoading(true)
      const response = await fetch(`/api/reservation/${roomId}`, { cache: "no-store" })

      if (!response.ok) {
        throw new Error("Failed to fetch reservations")
      }

      const data = await response.json()

      // Transform API response to our Reservation format
      const transformedReservations: Reservation[] = (data.reservationList || []).map((item: any) => {
        // Parse ISO dates
        const startDate = parseISO(item.startTime)
        const endDate = parseISO(item.endTime)

        const startDateStr = format(startDate, "yyyy-MM-dd")
        const endDateStr = format(endDate, "yyyy-MM-dd")
        const startTimeStr = format(startDate, "HH:mm")
        const rawEndTimeStr = format(endDate, "HH:mm")
        const endTimeStr = (startDateStr !== endDateStr && rawEndTimeStr === "00:00") ? "24:00" : rawEndTimeStr

        return {
          id: String(item.reservationId ?? item.id),
          date: startDateStr,
          nickname: item.nickname,
          purpose: item.purpose,
          // These fields aren't returned by the API but are required by our interface
          studentName: "",
          studentId: "",
          phoneNumber: "",
          startTime: startTimeStr,
          endTime: endTimeStr,
        }
      })

      setReservations(transformedReservations)
    } catch (error) {
      console.error("Error fetching reservations:", error)
      toast({
        title: "Error",
        description: "Failed to load reservations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Function to fetch rooms from the backend API
  const fetchRooms = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/room", { cache: "no-store" })
      if (!response.ok) {
        throw new Error("Failed to fetch rooms")
      }
      const data = await response.json()
      const mappedRooms: Room[] = (data.rooms || []).map((r: any) => ({
        id: String(r.id),
        name: r.name,
        // API에 별도 roomNumber가 없으므로 호실명과 동일하게 매핑
        roomNumber: r.name,
        location: r.location ?? "",
        capacity: Number(r.capacity) || 0,
        // 장비 문자열을 쉼표 기준으로 배열화
        equipment: typeof r.equipment === "string"
          ? r.equipment.split(",").map((s: string) => s.trim()).filter(Boolean)
          : Array.isArray(r.equipment) ? r.equipment : [],
        description: r.description ?? "",
        photos: Array.isArray(r.images) ? r.images : [],
      }))
      setRooms(mappedRooms)
      if (!selectedRoom && mappedRooms.length > 0) {
        setSelectedRoom(mappedRooms[0])
        // 기본 선택 방 예약 즉시 조회
        fetchReservations(mappedRooms[0].id)
      } else if (selectedRoom) {
        // 현재 선택된 방 유지 시에도 예약 재조회
        fetchReservations(selectedRoom.id)
      }
    } catch (error) {
      console.error("Error fetching rooms:", error)
      toast({
        title: "Error",
        description: "세미나실 목록을 불러오지 못했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [selectedRoom, toast, fetchReservations])

  // Initial load: fetch rooms
  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  // When selected room changes, fetch that room's reservations
  useEffect(() => {
    if (selectedRoom?.id) {
      fetchReservations(selectedRoom.id)
    } else {
      setReservations([])
    }
  }, [selectedRoom, fetchReservations])

  // Function to handle date navigation
  const navigateDate = (direction: "prev" | "next") => {
    if (direction === "prev") {
      const prevDay = addDays(selectedDate, -1)
      if (prevDay >= today) {
        setSelectedDate(prevDay)
      }
    } else {
      const nextDay = addDays(selectedDate, 1)
      if (nextDay <= maxDate) {
        setSelectedDate(nextDay)
      }
    }
  }

  // Handle reservation updates
  const handleReservationUpdate = useCallback(() => {
    if (selectedRoom?.id) {
      fetchReservations(selectedRoom.id)
    }
  }, [fetchReservations, selectedRoom])

  return (
    <div className="space-y-6">
      {(function renderRoomSection() {
        if (isLoading) {
          return (
            <Card>
              <CardHeader>
                <CardTitle>세미나실 선택</CardTitle>
                <CardDescription>사용하실 세미나실을 선택해주세요.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-20 w-full animate-pulse rounded-md bg-muted" />
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        }

        if (rooms.length === 0) {
          return (
            <Card>
              <CardHeader>
                <CardTitle>세미나실 선택</CardTitle>
                <CardDescription>사용하실 세미나실을 선택해주세요.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>현재 이용 가능한 방이 없습니다.</p>
                </div>
              </CardContent>
            </Card>
          )
        }

        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>세미나실 선택</CardTitle>
                <CardDescription>사용하실 세미나실을 선택해주세요.</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchRooms}
                  disabled={isLoading}
                  title="Refresh rooms"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`${isLoading ? "animate-spin" : ""}`}
                  >
                    <path d="M21 12a9 9 0 0 1-9 9c-4.97 0-9-4.03-9-9s4.03-9 9-9h9" />
                    <path d="M21 3v9h-9" />
                  </svg>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rooms.map((room) => (
                  <Button
                    key={room.id}
                    variant={selectedRoom?.id === room.id ? "default" : "outline"}
                    className={`h-auto p-4 justify-start ${selectedRoom?.id === room.id ? "border border-gray-200" : ""}`}
                    onClick={() => {
                      setSelectedRoom(room)
                      fetchReservations(room.id)
                    }}
                  >
                    <div className="flex flex-col items-start w-full">
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="font-medium">{room.name}</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`ml-2 inline-flex items-center rounded-md px-2 py-1 text-xs ${
                              selectedRoom?.id === room.id ? "bg-muted-foreground text-muted" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <Users className="h-2 w-2 mr-1" />
                            {room.capacity}
                          </span>
                          <span
                            role="button"
                            tabIndex={0}
                            aria-label="상세보기"
                            onClick={(e) => {
                              e.stopPropagation()
                              openRoomDetails(room)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                e.stopPropagation()
                                openRoomDetails(room)
                              }
                            }}
                            className={`h-6 w-4 inline-flex items-center justify-center rounded-md ${
                              selectedRoom?.id === room.id
                                ? "bg-muted-foreground text-muted"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <Info className="h-1 w-1" />
                          </span>
                        </div>
                      </div>
                      {room.description && (
                        <span className="text-sm text-muted-foreground text-left">{room.description}</span>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })()}
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="md:w-80">
          <CardHeader>
            <CardTitle>날짜 선택</CardTitle>
            <CardDescription>조회 또는 예약을 위한 날짜를 지정해주세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date)
                }
              }}
              disabled={(date) => {
                // Convert both dates to start of day for proper comparison
                const dateStart = startOfDay(date)
                const todayStart = startOfDay(today)
                const maxStart = startOfDay(maxDate)

                // Disable dates before today or after max date
                return dateStart < todayStart || dateStart > maxStart
              }}
              locale={ko}
              className="rounded-md border"
            />
            <div className="mt-4 text-sm text-muted-foreground">
              <p>예약은 일주일 이내로만 가능합니다:</p>
                <p>
                    {format(today, "yyyy년 M월 d일", { locale: ko })} - {format(maxDate, "yyyy년 M월 d일", { locale: ko })}
                </p>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="mb-1">시간 선택</CardTitle>
              <CardDescription>
                  {format(selectedDate, "yyyy년 M월 d일 (EEEE)", { locale: ko })}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigateDate("prev")
                }}
                disabled={isSameDay(selectedDate, today) || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigateDate("next")
                  // Fetch reservations when date changes
                  //fetchReservations()
                }}
                disabled={isSameDay(selectedDate, maxDate) || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => selectedRoom?.id && fetchReservations(selectedRoom.id)}
                disabled={isLoading}
                title="Refresh reservations"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`${isLoading ? "animate-spin" : ""}`}
                >
                  <path d="M21 12a9 9 0 0 1-9 9c-4.97 0-9-4.03-9-9s4.03-9 9-9h9" />
                  <path d="M21 3v9h-9" />
                </svg>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TimeBlockGrid
              selectedDate={selectedDate}
              reservations={reservations}
              onReservationUpdate={handleReservationUpdate}
              isLoading={isLoading}
              selectedRoom={selectedRoom?.id || ""}
            />
          </CardContent>
        </Card>
      </div>
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
          {detailsRoom && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>{detailsRoom.name}</DialogTitle>
                <DialogDescription>세미나실 상세 정보</DialogDescription>
              </DialogHeader>
              <div className="relative w-full aspect-[4/3] overflow-hidden rounded-md border bg-black/5">
                {detailsRoom.photos.length > 0 && (
                  <img
                    src={detailsRoom.photos[photoIndex]}
                    alt={`${detailsRoom.name} photo ${photoIndex + 1}`}
                    className="h-full w-full object-cover"
                  />
                )}
                {detailsRoom.photos.length > 1 && (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2"
                      onClick={showPrevPhoto}
                      aria-label="이전 사진"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={showNextPhoto}
                      aria-label="다음 사진"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-background/80 px-2 py-0.5 text-xs">
                      {photoIndex + 1} / {detailsRoom.photos.length}
                    </div>
                  </>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">호실</div>
                  <div className="font-medium">{detailsRoom.roomNumber}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">위치</div>
                  <div className="font-medium">{detailsRoom.location}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">수용인원</div>
                  <div className="font-medium">{detailsRoom.capacity}명</div>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <div className="text-sm text-muted-foreground">장비현황</div>
                  <div className="font-medium">{detailsRoom.equipment.join(", ")}</div>
                </div>
                {detailsRoom.description && (
                  <div className="space-y-1 sm:col-span-2">
                    <div className="text-sm text-muted-foreground">설명</div>
                    <div className="text-sm">{detailsRoom.description}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
