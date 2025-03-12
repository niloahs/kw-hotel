import { NextResponse } from 'next/server';
import auth from '@/lib/auth';
import { handleApiError } from '@/lib/api-utils';

export async function GET() {
    try {
        const user = await auth.getCurrentUser();

        if (!user) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        return handleApiError(error);
    }
}