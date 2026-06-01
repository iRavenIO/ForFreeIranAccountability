import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    publishAppData: process.env.PUBLISH_APP_DATA === 'true',
  });
}
