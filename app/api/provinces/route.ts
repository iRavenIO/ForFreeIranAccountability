import { NextResponse } from 'next/server';
import { initPublicMemoryDb, getProvinces } from '@/lib/public-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initPublicMemoryDb();
  } catch (err) {
    return NextResponse.json(
      { error: 'Public database is not ready' },
      { status: 503 }
    );
  }

  try {
    const data = getProvinces();
    return NextResponse.json({ data });
  } catch (err) {
    console.error('Error fetching provinces:', err);
    return NextResponse.json({ error: 'Failed to fetch provinces' }, { status: 500 });
  }
}
