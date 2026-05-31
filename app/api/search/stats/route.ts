import { NextRequest, NextResponse } from 'next/server';
import { initPublicMemoryDb, getCitySourceBreakdown } from '@/lib/public-db';

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
  const city = searchParams.get('city');
  const province = searchParams.get('province');

  if (!city) {
    return NextResponse.json({ error: 'City parameter is required' }, { status: 400 });
  }

  try {
    const data = getCitySourceBreakdown(city, province);
    return NextResponse.json({ data });
  } catch (err) {
    console.error('Error fetching source breakdown:', err);
    return NextResponse.json({ error: 'Failed to fetch source breakdown' }, { status: 500 });
  }
}
