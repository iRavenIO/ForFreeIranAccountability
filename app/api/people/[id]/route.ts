import { NextRequest, NextResponse } from 'next/server';
import { initPublicMemoryDb, getPersonById } from '@/lib/public-db';

export const dynamic = 'force-dynamic';
export const revalidate = 120;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initPublicMemoryDb();
  } catch (err) {
    return NextResponse.json(
      { error: 'Public database is not ready' },
      { status: 503 }
    );
  }

  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const person = getPersonById(id);

    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    return NextResponse.json({ data: person });
  } catch (err) {
    console.error('Error fetching person:', err);
    return NextResponse.json({ error: 'Failed to fetch person' }, { status: 500 });
  }
}
