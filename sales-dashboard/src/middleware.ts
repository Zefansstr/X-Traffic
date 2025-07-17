import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/login'];

// Routes that require specific roles
const roleBasedRoutes = {
  '/setting/operator': ['administrator'],
  '/reports/commission': ['administrator', 'manager', 'operator', 'user', 'viewer'],
  '/setting': ['administrator', 'manager'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Normalize pathname - remove trailing slash for consistency
  const normalizedPath = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
  
  console.log('🔒 Middleware checking:', pathname, 'normalized:', normalizedPath);
  
  // Skip middleware for specific paths that should never be processed
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('favicon') ||
    pathname.includes('.') && !pathname.endsWith('/')
  ) {
    console.log('⏭️ Skipping middleware for static/API route:', pathname);
    return NextResponse.next();
  }

  // Allow access to public routes - check both original and normalized paths
  if (publicRoutes.includes(pathname) || publicRoutes.includes(normalizedPath)) {
    console.log('✅ Public route allowed:', pathname);
    return NextResponse.next();
  }

  // For all other routes, check authentication
  console.log('🔒 Checking authentication for protected route:', pathname);
  
  // Check for authentication token
  const authTokenFromCookie = request.cookies.get('authToken')?.value;
  const authTokenFromHeader = request.headers.get('authorization')?.replace('Bearer ', '');
  const authToken = authTokenFromCookie || authTokenFromHeader;

  console.log('🔍 Auth token found:', !!authToken);

  if (!authToken) {
    console.log('❌ No auth token, redirecting to login from:', pathname);
    // Only redirect if not already on login page to prevent loops
    if (normalizedPath !== '/login') {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Simple token validation
  try {
    // For now, we'll trust the token exists
    // In production, decode and validate JWT token here
    
    // Check role-based access
    for (const [route, allowedRoles] of Object.entries(roleBasedRoutes)) {
      if (pathname.startsWith(route)) {
        // For now, allow access if token exists
        break;
      }
    }

    console.log('✅ Auth check passed for:', pathname);
    return NextResponse.next();
  } catch (error) {
    console.log('❌ Token validation failed, redirecting to login');
    // Only redirect if not already on login page
    if (normalizedPath !== '/login') {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}; 