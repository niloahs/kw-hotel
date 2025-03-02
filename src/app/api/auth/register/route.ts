import { NextResponse } from 'next/server';
import auth from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { firstName, lastName, email, password, phone } = body;

        if (!firstName || !lastName || !email || !password) {
            return NextResponse.json(
                { message: 'All fields are required' },
                { status: 400 }
            );
        }

        const result = await auth.createOrUpdateGuestAccount(
            firstName,
            lastName,
            email,
            password,
            phone
        );

        if (!result.success) {
            return NextResponse.json(
                { message: result.message },
                { status: 400 }
            );
        }

        // Log in the user after successful registration
        const user = await auth.loginUser(email, password, 'guest');

        if (!user) {
            return NextResponse.json(
                { message: 'Account created but unable to log in automatically' },
                { status: 500 }
            );
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
            },
            message: 'Account created successfully'
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { message: 'An error occurred during registration' },
            { status: 500 }
        );
    }
}