import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch("http://localhost:8080/api/room", { cache: "no-store" })
    if (!response.ok) {
      throw new Error("Failed to fetch rooms")
    }
    const data = await response.json()
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("Error fetching rooms:", error)
    return NextResponse.json(
      { error: "세미나실 목록을 가져오는데 실패했습니다." },
      { status: 500 }
    )
  }
}


