'use client';

import { Suspense } from "react"
import ReservationCalendar from "@/components/reservation-calendar"
import { CalendarSkeleton } from "@/components/skeletons"

export default function HomePage() {
  return (
    <main className="container mx-auto py-8 px-4">
      <Suspense fallback={<CalendarSkeleton />}>
        <ReservationCalendar />
      </Suspense>
    </main>
  )
}
