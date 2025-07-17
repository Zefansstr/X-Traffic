import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/api/auth/login', '/api/create-admin', '/'];

// Protected routes that definitely need authentication
const protectedRoutes = ['/setting', '/reports/commission', '/reports/kpi'];

// Routes that require specific roles
const roleBasedRoutes = {
  '/setting/operator': ['administrator'],
  '/reports/commission': ['administrator', 'manager', 'operator', 'user', 'viewer'],
  '/setting': ['administrator', 'manager'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('🔒 Middleware checking:', pathname);
  
  // Skip middleware for static files and API routes (except auth)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    (pathname.startsWith('/api') && !pathname.startsWith('/api/auth'))
  ) {
    return NextResponse.next();
  }

  // Allow access to public routes
  if (publicRoutes.includes(pathname)) {
    console.log('✅ Public route allowed:', pathname);
    return NextResponse.next();
  }

  // Check if this is a protected route that definitely needs auth
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    // Check for authentication - look in both cookies and headers
    const authTokenFromCookie = request.cookies.get('authToken')?.value;
    const authTokenFromHeader = request.headers.get('authorization')?.replace('Bearer ', '');
    const authToken = authTokenFromCookie || authTokenFromHeader;

    console.log('🔍 Auth token found for protected route:', !!authToken);

    if (!authToken) {
      console.log('❌ No auth token for protected route, redirecting to login');
      // Redirect to login if not authenticated
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Simple token validation (in production, use proper JWT validation)
    try {
      // For now, we'll trust the token exists
      // In production, decode and validate JWT token here
      
      // Check role-based access
      for (const [route, allowedRoles] of Object.entries(roleBasedRoutes)) {
        if (pathname.startsWith(route)) {
          // For now, allow access if token exists
          // In production: if (!allowedRoles.includes(userRole)) {
          //   return NextResponse.redirect(new URL('/', request.url));
          // }
          break;
        }
      }

      console.log('✅ Auth check passed for protected route:', pathname);
      return NextResponse.next();
    } catch (error) {
      console.log('❌ Token validation failed, redirecting to login');
      // Invalid token, redirect to login
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // For non-protected routes, allow access without auth
  console.log('✅ Non-protected route allowed:', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 