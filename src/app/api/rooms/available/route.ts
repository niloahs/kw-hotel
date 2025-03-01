import { NextResponse } from "next/server";
import { getAvailableRooms } from "@/lib/db-helpers";
import { handleApiError, createApiError } from "@/lib/api-utils";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const checkIn = searchParams.get('checkIn');
        const checkOut = searchParams.get('checkOut');

        if (!checkIn || !checkOut) {
            throw createApiError('Check-in and check-out dates are required', 400);
        }

        const rooms = await getAvailableRooms(checkIn, checkOut);
        return NextResponse.json(rooms);
    } catch (error) {
        return handleApiError(error);
    }
}