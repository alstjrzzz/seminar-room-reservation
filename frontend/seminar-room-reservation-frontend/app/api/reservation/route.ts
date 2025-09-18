// This is a mock API route for demonstration purposes
// In a real application, this would connect to a database

import type { ApiReservationResponse } from "@/lib/types"
import { NextResponse } from 'next/server';

// Sample data for the mock API
const mockReservations: ApiReservationResponse = {
  reservationList: [
    {
      nickname: "Study Group A",
      reservationId: 1,
      purpose: "Group Study",
      startTime: "2025-05-01T10:00:00",
      endTime: "2025-05-01T12:00:00",
    },
    {
      nickname: "CS Club",
      reservationId: 2,
      purpose: "Club Meeting",
      startTime: "2025-05-01T14:00:00",
      endTime: "2025-05-01T16:00:00",
    },
    {
      nickname: "Project Team",
      reservationId: 3,
      purpose: "Project Discussion",
      startTime: "2025-05-02T09:00:00",
      endTime: "2025-05-02T11:00:00",
    },
  ],
}

export async function GET() {
  try {
    const response = await fetch('http://localhost:8080/api/reservation');
    if (!response.ok) {
      throw new Error('Failed to fetch reservations');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: '예약 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // 시간 형식을 백엔드 형식에 맞게 조정
    const adjustedData = {
      ...data,
      startTime: new Date(data.startTime).toISOString(),
      endTime: new Date(data.endTime).toISOString()
    };

    const response = await fetch('http://localhost:8080/api/reservation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adjustedData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(errorText, { status: response.status });
    }

    return new Response('예약이 완료되었습니다.', { status: 200 });
  } catch (error) {
    console.error('Error processing reservation:', error);
    return new Response('예약 처리 중 오류가 발생했습니다.', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const data = await request.json();
    const response = await fetch('http://localhost:8080/api/reservation', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(errorText, { status: response.status });
    }

    return new Response('예약이 취소되었습니다.', { status: 200 });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    return new Response('예약 취소 중 오류가 발생했습니다.', { status: 500 });
  }
}

const timeToISOString = (dateStr: string, timeStr: string): string => {
    const [year, month, day] = dateStr.split("-").map(Number)
    const [hours, minutes] = timeStr.split(":").map(Number)
    
    // JavaScript months are 0-indexed
    const date = new Date(year, month - 1, day, hours, minutes)
    return date.toISOString()
}

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
