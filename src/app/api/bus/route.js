import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.BUS_API_KEY;
  const lineId = '5200203000';
  
  const apiUrl = `http://apis.data.go.kr/6260000/BusanBIMS/busInfoByRouteId?serviceKey=${apiKey}&lineid=${lineId}`;

  try {
    const response = await fetch(apiUrl, { cache: 'no-store' });
    const xmlText = await response.text();

    return new Response(xmlText, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  } catch (error) {
    console.error('Bus API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch bus data' }, { status: 500 });
  }
}