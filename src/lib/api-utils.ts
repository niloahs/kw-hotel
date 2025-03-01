import { NextResponse } from 'next/server';

export type ApiError = {
    message: string;
    status: number;
};

export function handleApiError(error: unknown): NextResponse {
    console.error('API error:', error);

    // If it's already an ApiError, use it
    if (typeof error === 'object' && error !== null && 'message' in error && 'status' in error) {
        const apiError = error as ApiError;
        return NextResponse.json(
            { message: apiError.message },
            { status: apiError.status }
        );
    }

    // Otherwise, create a generic server error
    return NextResponse.json(
        { message: 'An unexpected error occurred' },
        { status: 500 }
    );
}

export function createApiError(message: string, status: number): ApiError {
    return { message, status };
}