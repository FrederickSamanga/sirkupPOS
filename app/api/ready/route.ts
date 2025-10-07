import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    // Check critical dependencies
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ready: true,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json({
      ready: false,
      error: error instanceof Error ? error.message : 'Not ready',
    }, { status: 503 });
  }
}