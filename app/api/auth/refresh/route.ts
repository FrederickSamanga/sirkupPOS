import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../src/core/services/AuthService';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie or body
    const refreshToken = request.cookies.get('refreshToken')?.value ||
                        (await request.json()).refreshToken;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token required' },
        { status: 400 }
      );
    }

    const { accessToken, user } = await AuthService.refreshToken(refreshToken);

    return NextResponse.json({
      success: true,
      accessToken,
      user,
      expiresIn: 15 * 60 * 1000, // 15 minutes
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Token refresh failed' },
      { status: 401 }
    );
  }
}