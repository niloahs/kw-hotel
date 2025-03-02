import { NextResponse } from 'next/server';
import auth, { UserType } from '@/lib/auth';
import { handleApiError, createApiError } from '@/lib/api-utils';

interface LoginRequest {
    email: string;
    password: string;
    userType: UserType;
}

export async function POST(request: Request) {
    try {
        const body = await request.json() as LoginRequest;
        const { email, password, userType } = body;

        if (!email || !password || !userType) {
            throw createApiError('Email, password, and user type are required', 400);
        }

        if (userType !== 'guest' && userType !== 'staff') {
            throw createApiError('Invalid user type', 400);
        }

        const user = await auth.loginUser(email, password, userType);

        if (!user) {
            throw createApiError('Invalid email or password', 401);
        }

        // Generate token
        const token = auth.generateToken(user);

        // Set cookie in server response
        await auth.setAuthCookie(token);

        return NextResponse.json({
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                type: user.type
            }
        });
    } catch (error) {
        return handleApiError(error);
    }
}