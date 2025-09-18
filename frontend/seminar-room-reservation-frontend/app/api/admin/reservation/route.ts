import { NextResponse } from "next/server"

export async function GET() {
  try {
    const res = await fetch("http://localhost:8080/api/admin/reservation", { cache: "no-store" })
    if (!res.ok) throw new Error("Failed to fetch admin reservations")
    const data = await res.json()
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "예약 목록을 가져오지 못했습니다." }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const res = await fetch("http://localhost:8080/api/admin/reservation", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const text = await res.text()
    return new Response(text || (res.ok ? "OK" : ""), { status: res.status })
  } catch (e) {
    console.error(e)
    return new Response("예약 취소 처리 중 오류가 발생했습니다.", { status: 500 })
  }
}


