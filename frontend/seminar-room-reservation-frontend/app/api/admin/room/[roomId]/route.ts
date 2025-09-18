interface Params { params: { roomId: string } }

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const res = await fetch(`http://localhost:8080/api/admin/room/${params.roomId}`, { method: "DELETE" })
    const text = await res.text()
    return new Response(text || (res.ok ? "OK" : ""), { status: res.status })
  } catch (e) {
    console.error(e)
    return new Response("방 삭제 처리 중 오류가 발생했습니다.", { status: 500 })
  }
}


