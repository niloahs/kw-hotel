import { NextResponse } from "next/server";
import { getReservationById } from "@/lib/db-helpers";
import { createApiError, handleApiError } from "@/lib/api-utils";

export async function GET(
    request: Request,
    {params}: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            throw createApiError('Invalid reservation ID', 400);
        }

        const reservation = await getReservationById(id);

        if (!reservation) {
            throw createApiError('Reservation not found', 404);
        }

        return NextResponse.json(reservation);
    } catch (error) {
        return handleApiError(error);
    }
}