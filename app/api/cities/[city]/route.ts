import { NextRequest, NextResponse } from 'next/server';
import { initPublicMemoryDb, getPeopleByCity } from '@/lib/public-db';

export const dynamic = 'force-dynamic';
export const revalidate = 120;

export async function GET(
  request: NextRequest,
  { params }: { params: { city: string } }
) {
  try {
    await initPublicMemoryDb();
  } catch (err) {
    return NextResponse.json(
      { error: 'Public database is not ready' },
      { status: 503 }
    );
  }

  const cityName = params.city;
  const { searchParams } = new URL(request.url);
  const province = searchParams.get('province') || undefined;
  const q = searchParams.get('q') || undefined;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));

  try {
    const result = getPeopleByCity(cityName, province, q, page, limit);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Error fetching city people:', err);
    return NextResponse.json({ error: 'Failed to fetch city data' }, { status: 500 });
  }
}
