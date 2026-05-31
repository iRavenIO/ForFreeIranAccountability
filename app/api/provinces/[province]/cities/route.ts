import { NextRequest, NextResponse } from 'next/server';
import { initPublicMemoryDb, getCitiesByProvince } from '@/lib/public-db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { province: string } }
) {
  try {
    await initPublicMemoryDb();
  } catch (err) {
    return NextResponse.json(
      { error: 'Public database is not ready' },
      { status: 503 }
    );
  }

  const province = params.province;

  try {
    const data = getCitiesByProvince(province);
    return NextResponse.json({ data });
  } catch (err) {
    console.error('Error fetching cities:', err);
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
  }
}
