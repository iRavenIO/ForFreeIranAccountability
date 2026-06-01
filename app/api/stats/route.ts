import { NextResponse } from 'next/server';
import { initPublicMemoryDb, getPublicDb } from '@/lib/public-db';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 600;

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
    const db = getPublicDb();

    const totalRecords = (
      db.prepare('SELECT COUNT(*) as cnt FROM public_people').get() as { cnt: number }
    ).cnt;
    const cityCount = (
      db.prepare('SELECT COUNT(*) as cnt FROM public_city_points').get() as { cnt: number }
    ).cnt;
    const provinceCount = (
      db
        .prepare('SELECT COUNT(DISTINCT province) as cnt FROM public_people WHERE province IS NOT NULL')
        .get() as { cnt: number }
    ).cnt;
    const sourceBreakdown = db
      .prepare(
        `SELECT sourceFile, COUNT(*) as count
         FROM public_people
         WHERE sourceFile IS NOT NULL
         GROUP BY sourceFile`
      )
      .all() as { sourceFile: string; count: number }[];

    // ImportLog still uses Prisma (only in disk database)
    const importLogs = await prisma.importLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      totalRecords,
      totalCities: cityCount,
      totalProvinces: provinceCount,
      sourceBreakdown: sourceBreakdown.map((s) => ({
        source: s.sourceFile,
        count: s.count,
      })),
      lastUpdated: importLogs[0]?.createdAt || null,
      recentImports: importLogs.map((log: typeof importLogs[number]) => ({
        fileName: log.fileName,
        rowsImported: log.rowsImported,
        rowsTotal: log.rowsTotal,
        createdAt: log.createdAt,
      })),
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
