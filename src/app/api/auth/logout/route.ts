import { NextResponse } from 'next/server';
import auth from '@/lib/auth';

export async function POST() {
    await auth.clearAuthCookie();
    return NextResponse.json({ message: 'Logged out successfully' });
}