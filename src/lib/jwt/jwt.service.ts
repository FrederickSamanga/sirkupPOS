import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import type { JWTPayload, TokenPair, RefreshTokenPayload } from './jwt.types';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || randomBytes(64).toString('hex');
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || randomBytes(64).toString('hex');
const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export class JWTService {
  static generateTokenPair(payload: Omit<JWTPayload, 'iat' | 'exp'>): TokenPair {
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

    const refreshPayload: RefreshTokenPayload = {
      userId: payload.userId,
      tokenId: randomBytes(16).toString('hex'),
    };

    const refreshToken = jwt.sign(refreshPayload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60 * 1000, // 15 minutes in milliseconds
    };
  }

  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, ACCESS_TOKEN_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  static verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return jwt.verify(token, REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }

  static refreshAccessToken(refreshToken: string, userPayload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    // Verify refresh token first
    this.verifyRefreshToken(refreshToken);

    // Generate new access token only
    const accessToken = jwt.sign(userPayload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

    return accessToken;
  }

  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      return parts[1];
    }

    return null;
  }
}