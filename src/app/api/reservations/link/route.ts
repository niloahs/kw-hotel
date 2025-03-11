import { NextResponse } from "next/server";
import db from "@/lib/db";
import auth from "@/lib/auth";
import { createApiError, handleApiError } from "@/lib/api-utils";

export async function POST(request: Request) {
    try {
        const {reservationId, email} = await request.json();

        if (!reservationId || !email) {
            throw createApiError('Reservation ID and email are required', 400);
        }

        // Get current authenticated user
        const user = await auth.getCurrentUser();
        if (!user) {
            throw createApiError('You must be logged in to link a reservation', 401);
        }

        // Verify reservation exists and email matches
        const reservationResult = await db.query(`
            SELECT r.reservation_id, r.guest_id, g.email
            FROM reservation r
                     JOIN guest g ON r.guest_id = g.guest_id
            WHERE r.reservation_id = $1
        `, [reservationId]);

        if (reservationResult.rowCount === 0) {
            throw createApiError('Reservation not found', 404);
        }

        const reservation = reservationResult.rows[0];

        if (reservation.email !== email) {
            throw createApiError('The email address does not match the reservation', 400);
        }

        // Update the reservation to point to the authenticated user
        await db.query(`
            UPDATE reservation
            SET guest_id = $1
            WHERE reservation_id = $2
        `, [user.id, reservationId]);

        return NextResponse.json({
            success: true,
            message: 'Reservation successfully linked to your account'
        });
    } catch (error) {
        return handleApiError(error);
    }
}