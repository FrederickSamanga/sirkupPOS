import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '../../../../src/core/middleware/auth.middleware';

async function handler(request: AuthenticatedRequest) {
  // User is authenticated and available in request.user
  const user = request.user;

  return NextResponse.json({
    success: true,
    user: {
      id: user?.id,
      email: user?.email,
      role: user?.role,
      permissions: user?.permissions,
    },
  });
}

export async function GET(request: NextRequest) {
  return withAuth(request, handler);
}