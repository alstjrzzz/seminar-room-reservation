"use client"

import { useState, useEffect, useCallback } from "react"
import { addDays, format, isSameDay, startOfDay, endOfDay, parseISO } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import TimeBlockGrid from "@/components/time-block-grid"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Reservation } from "@/lib/types"

export default function ReservationCalendar() {
    const { toast } = useToast()
    const today = startOfDay(new Date())
    const maxDate = endOfDay(addDays(today, 6))
    const [selectedDate, setSelectedDate] = useState<Date>(today)
    const [reservations, setReservations] = useState<Reservation[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // 예약 데이터 가져오기
    const fetchReservations = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await fetch("/api/reservation")

            if (!response.ok) {
                throw new Error("Failed to fetch reservations")
            }

            const data = await response.json()
            const transformedReservations: Reservation[] = data.reservationList.map((item: any) => {
                const startDate = parseISO(item.startTime)
                const endDate = parseISO(item.endTime)

                return {
                    id: item.reservationId.toString(),
                    date: format(startDate, "yyyy-MM-dd"),
                    nickname: item.nickname,
                    purpose: item.purpose,
                    studentName: "",
                    studentId: "",
                    phoneNumber: "",
                    startTime: format(startDate, "HH:mm"),
                    endTime: format(endDate, "HH:mm"),
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

    // 초기 로딩 시에만 예약 데이터 가져오기
    useEffect(() => {
        const controller = new AbortController();
        
        fetchReservations();
        
        return () => {
            controller.abort();
        };
    }, []); // fetchReservations 의존성 제거

    // 날짜 이동 처리 - GET 요청 없음
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

    // 예약 업데이트 핸들러 - 의존성 배열에서 fetchReservations 제거
    const handleReservationUpdate = useCallback(() => {
        fetchReservations()
    }, []) // 의존성 배열을 비워서 함수가 다시 생성되지 않도록 함

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
                <Card className="md:w-80">
                    <CardHeader>
                        <CardTitle>Select Date</CardTitle>
                        <CardDescription>Choose a date to view or make reservations</CardDescription>
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
                                const dateStart = startOfDay(date)
                                const todayStart = startOfDay(today)
                                const maxStart = startOfDay(maxDate)
                                return dateStart < todayStart || dateStart > maxStart
                            }}
                            className="rounded-md border"
                        />
                        <div className="mt-4 text-sm text-muted-foreground">
                            <p>예약은 일주일 이내로만 가능합니다:</p>
                            <p>
                                {format(today, "MMM d, yyyy")} - {format(maxDate, "MMM d, yyyy")}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle></CardTitle>
                            <CardDescription>
                                {format(selectedDate, "EEEE, MMMM d, yyyy")}
                            </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => navigateDate("prev")}
                                disabled={isSameDay(selectedDate, today) || isLoading}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => navigateDate("next")}
                                disabled={isSameDay(selectedDate, maxDate) || isLoading}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={fetchReservations}
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
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}