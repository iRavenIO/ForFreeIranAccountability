import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { reloadPublicMemoryDb, initPublicMemoryDb } from '@/lib/public-db';

export const dynamic = 'force-dynamic';

/**
 * Reload the in-memory public database from the disk database.
 * Guarded by INTERNAL_ADMIN_TOKEN.
 */
export async function POST(request: NextRequest) {
  // Verify admin token
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token || token !== config.internalAdminToken) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const result = await reloadPublicMemoryDb();
    console.log(`[reload] Reload complete: ${result.peopleCount} people, ${result.cityPointCount} city points in ${result.elapsedMs}ms`);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[reload] Failed: ${msg}`);
    return NextResponse.json(
      { error: 'Reload failed', details: msg },
      { status: 500 }
    );
  }
}
