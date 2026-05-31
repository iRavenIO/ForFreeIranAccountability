import { NextResponse } from 'next/server';
import { getHealth, initPublicMemoryDb, isMemoryDbReady } from '@/lib/public-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Trigger lazy init if needed
    if (!isMemoryDbReady()) {
      await initPublicMemoryDb();
    }

    const health = getHealth();
    return NextResponse.json(health, {
      status: health.status === 'ok' ? 200 : 503,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { status: 'error', memoryDbReady: false, error: msg },
      { status: 503 }
    );
  }
}
