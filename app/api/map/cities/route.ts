import { NextRequest, NextResponse } from 'next/server';
import { initPublicMemoryDb, getMapMarkers } from '@/lib/public-db';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export async function GET(request: NextRequest) {
  try {
    await initPublicMemoryDb();
  } catch (err) {
    return NextResponse.json(
      { error: 'Public database is not ready' },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const province = searchParams.get('province') || undefined;
  const source = searchParams.get('source') || undefined;

  try {
    const data = getMapMarkers(province, source);
    return NextResponse.json({ data });
  } catch (err) {
    console.error('Error fetching map data:', err);
    return NextResponse.json({ error: 'Failed to fetch map data' }, { status: 500 });
  }
}
