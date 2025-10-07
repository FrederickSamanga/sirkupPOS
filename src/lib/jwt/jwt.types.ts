export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'cashier' | 'manager';
  permissions?: string[];
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'cashier' | 'manager';
  permissions: string[];
}

export interface SessionData {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}