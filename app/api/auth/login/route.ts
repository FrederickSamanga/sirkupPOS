import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../src/core/services/AuthService';
import { ErrorHandler } from '../../../../src/lib/errors/error-handler';
import { ValidationError } from '../../../../src/lib/errors/app-error';

export const POST = ErrorHandler.wrap(async (request: NextRequest) => {
    const body = await request.json();
    const { email, pin } = body;

    if (!email || !pin) {
      throw new ValidationError('Email and PIN are required');
    }

    const { user, tokens } = await AuthService.login(email, pin);

    // Set refresh token as httpOnly cookie
    const response = NextResponse.json({
      success: true,
      user,
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
    });

    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
});