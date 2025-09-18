import { NextResponse } from "next/server"

interface Params {
  params: { roomId: string }
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { roomId } = params
    const response = await fetch(`http://localhost:8080/api/reservation/${roomId}`, { cache: "no-store" })
    if (!response.ok) {
      throw new Error("Failed to fetch reservations by room")
    }
    const data = await response.json()
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("Error fetching reservations by room:", error)
    return NextResponse.json(
      { error: "예약 현황을 가져오는데 실패했습니다." },
      { status: 500 }
    )
  }
}


