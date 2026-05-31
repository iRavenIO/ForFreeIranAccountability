import { NextRequest, NextResponse } from 'next/server';
import { initPublicMemoryDb, searchPeople } from '@/lib/public-db';

export const dynamic = 'force-dynamic';
export const revalidate = 120;

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
  const q = searchParams.get('q') || undefined;
  const province = searchParams.get('province') || undefined;
  const city = searchParams.get('city') || undefined;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));

  if (!q && !province && !city) {
    return NextResponse.json({
      data: [],
      pagination: { page: 1, limit, total: 0, totalPages: 0 },
    });
  }

  try {
    const result = searchPeople(q, province, city, page, limit);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Error searching:', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
