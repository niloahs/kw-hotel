import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    // Protect account pages
    if (request.nextUrl.pathname.startsWith('/account')) {
        if (!token) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // Protect staff pages
    if (request.nextUrl.pathname.startsWith('/allreservations')) {
        if (!token || token.userType !== 'staff') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/account/:path*', '/allreservations/:path*'],
};