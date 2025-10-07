import bcrypt from 'bcryptjs';
import { prisma } from '../../../lib/prisma';
import { JWTService } from '../../lib/jwt/jwt.service';
import type { AuthUser, TokenPair } from '../../lib/jwt/jwt.types';
import { AuthenticationError } from '../../lib/errors/app-error';
import { authLogger, AuditLogger } from '../../lib/logger/logger';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email(),
  pin: z.string().min(6),
});

const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export class AuthService {
  private static refreshTokenStore = new Map<string, { userId: string; expiresAt: Date }>();

  static async login(email: string, pin: string): Promise<{ user: AuthUser; tokens: TokenPair }> {
    // Validate input
    const validated = LoginSchema.parse({ email, pin });

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (!user || !user.active) {
      authLogger.warn({ msg: 'Login failed - user not found or inactive', email });
      AuditLogger.logAuth('failed_login', { email }, { reason: 'user_not_found' });
      throw new AuthenticationError('Invalid credentials');
    }

    // Verify PIN
    const isValidPin = await bcrypt.compare(validated.pin, user.pin);
    if (!isValidPin) {
      authLogger.warn({ msg: 'Login failed - invalid PIN', email, userId: user.id });
      AuditLogger.logAuth('failed_login', user, { reason: 'invalid_pin' });
      throw new AuthenticationError('Invalid credentials');
    }

    // Create auth user object
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.toLowerCase() as 'admin' | 'cashier' | 'manager',
      permissions: this.getRolePermissions(user.role.toLowerCase()),
    };

    // Generate tokens
    const tokens = JWTService.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role.toLowerCase() as 'admin' | 'cashier' | 'manager',
      permissions: authUser.permissions,
    });

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    this.refreshTokenStore.set(tokens.refreshToken, {
      userId: user.id,
      expiresAt,
    });

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    // Log successful login
    authLogger.info({ msg: 'User logged in successfully', userId: user.id, email: user.email, role: user.role });
    AuditLogger.logAuth('login', authUser);

    return { user: authUser, tokens };
  }

  static async refreshToken(refreshToken: string): Promise<{ accessToken: string; user: AuthUser }> {
    const validated = RefreshTokenSchema.parse({ refreshToken });

    // Verify refresh token
    const payload = JWTService.verifyRefreshToken(validated.refreshToken);

    // Check if token is in store
    const storedToken = this.refreshTokenStore.get(validated.refreshToken);
    if (!storedToken || storedToken.userId !== payload.userId) {
      throw new Error('Invalid refresh token');
    }

    // Check expiration
    if (storedToken.expiresAt < new Date()) {
      this.refreshTokenStore.delete(validated.refreshToken);
      throw new Error('Refresh token expired');
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.active) {
      throw new Error('User not found or inactive');
    }

    // Create auth user
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.toLowerCase() as 'admin' | 'cashier' | 'manager',
      permissions: this.getRolePermissions(user.role.toLowerCase()),
    };

    // Generate new access token
    const accessToken = JWTService.refreshAccessToken(validated.refreshToken, {
      userId: user.id,
      email: user.email,
      role: user.role.toLowerCase() as 'admin' | 'cashier' | 'manager',
      permissions: authUser.permissions,
    });

    return { accessToken, user: authUser };
  }

  static async logout(refreshToken: string): Promise<void> {
    const tokenData = this.refreshTokenStore.get(refreshToken);
    this.refreshTokenStore.delete(refreshToken);

    if (tokenData) {
      authLogger.info({ msg: 'User logged out', userId: tokenData.userId });
      AuditLogger.logAuth('logout', { id: tokenData.userId });
    }
  }

  static async validateUser(userId: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId, active: true },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.toLowerCase() as 'admin' | 'cashier' | 'manager',
      permissions: this.getRolePermissions(user.role.toLowerCase()),
    };
  }

  private static getRolePermissions(role: string): string[] {
    const permissions: Record<string, string[]> = {
      admin: ['*'],
      manager: [
        'pos.access',
        'inventory.read',
        'inventory.write',
        'reports.read',
        'employees.read',
        'employees.write',
      ],
      cashier: ['pos.access', 'inventory.read', 'reports.read'],
    };

    return permissions[role] || [];
  }

  // Clean up expired tokens periodically
  static cleanupExpiredTokens(): void {
    const now = new Date();
    for (const [token, data] of this.refreshTokenStore.entries()) {
      if (data.expiresAt < now) {
        this.refreshTokenStore.delete(token);
      }
    }
  }
}