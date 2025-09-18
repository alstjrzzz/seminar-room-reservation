import { NextResponse } from "next/server"

export async function GET() {
  try {
    const res = await fetch("http://localhost:8080/api/admin/room", { cache: "no-store" })
    if (!res.ok) throw new Error("Failed to fetch rooms")
    const data = await res.json()
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "방 목록을 가져오지 못했습니다." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || ""
    let body: BodyInit
    let headers: HeadersInit

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      body = formData
      headers = {}
    } else {
      const json = await request.json()
      body = JSON.stringify(json)
      headers = { "Content-Type": "application/json" }
    }

    const res = await fetch("http://localhost:8080/api/admin/room", { method: "POST", body, headers })
    const text = await res.text()
    return new Response(text || (res.ok ? "OK" : ""), { status: res.status })
  } catch (e) {
    console.error(e)
    return new Response("방 생성 처리 중 오류가 발생했습니다.", { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || ""
    let body: BodyInit
    let headers: HeadersInit

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      body = formData
      headers = {}
    } else {
      const json = await request.json()
      body = JSON.stringify(json)
      headers = { "Content-Type": "application/json" }
    }

    const res = await fetch("http://localhost:8080/api/admin/room", { method: "PATCH", body, headers })
    const text = await res.text()
    return new Response(text || (res.ok ? "OK" : ""), { status: res.status })
  } catch (e) {
    console.error(e)
    return new Response("방 수정 처리 중 오류가 발생했습니다.", { status: 500 })
  }
}


