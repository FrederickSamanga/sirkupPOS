import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from '../../lib/jwt/jwt.service';
import { AuthService } from '../services/AuthService';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Extract token from Authorization header
    const token = JWTService.extractTokenFromHeader(
      request.headers.get('Authorization') || undefined
    );

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = JWTService.verifyAccessToken(token);

    // Validate user still exists and is active
    const user = await AuthService.validateUser(payload.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      );
    }

    // Add user to request
    (request as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    };

    // Call handler with authenticated request
    return handler(request as AuthenticatedRequest);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}

export function requirePermission(permission: string) {
  return (
    request: AuthenticatedRequest,
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    const user = request.user;

    if (!user) {
      return Promise.resolve(
        NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      );
    }

    // Check for wildcard permission (admin)
    if (user.permissions.includes('*')) {
      return handler(request);
    }

    // Check specific permission
    if (!user.permissions.includes(permission)) {
      return Promise.resolve(
        NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      );
    }

    return handler(request);
  };
}

export function requireRole(roles: string | string[]) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (
    request: AuthenticatedRequest,
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    const user = request.user;

    if (!user) {
      return Promise.resolve(
        NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      );
    }

    if (!allowedRoles.includes(user.role)) {
      return Promise.resolve(
        NextResponse.json(
          { error: 'Insufficient role privileges' },
          { status: 403 }
        )
      );
    }

    return handler(request);
  };
}