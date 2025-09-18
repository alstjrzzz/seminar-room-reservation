import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 백엔드에서 로그 파일 가져오기
    const response = await fetch('http://localhost:8080/api/admin/log', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch log from backend');
    }

    // 백엔드에서 받은 byte[] 데이터를 그대로 전달
    const logData = await response.arrayBuffer();

    // 백엔드의 응답 헤더에서 Content-Type과 Content-Disposition 가져오기
    const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
    const contentDisposition = response.headers.get('Content-Disposition') || 'attachment; filename="log.xlsx"';

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', contentDisposition);

    return new NextResponse(logData, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Log fetch error:', error);
    return NextResponse.json(
      { error: '로그 파일을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}