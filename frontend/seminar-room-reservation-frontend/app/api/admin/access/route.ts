import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const response = await fetch("http://localhost:8080/api/admin/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    if (!response.ok) {
      const text = await response.text()
      return new Response(text || "관리자 인증에 실패했습니다.", { status: response.status })
    }

    const data = await response.text()
    return new Response(data || "OK", { status: 200, headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("Admin access error:", error)
    return new Response("관리자 인증 처리 중 오류가 발생했습니다.", { status: 500 })
  }
}


