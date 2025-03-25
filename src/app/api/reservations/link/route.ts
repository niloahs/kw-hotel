import { NextResponse } from "next/server";
import db from "@/lib/db";
import { createApiError, handleApiError } from "@/lib/api-utils";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const {confirmationCode, email} = await request.json();

        if (!confirmationCode || !email) {
            throw createApiError('Confirmation code and email are required', 400);
        }

        // Get current authenticated user
        const session = await auth();
        if (!session) {
            throw createApiError('You must be logged in to link a reservation', 401);
        }

        // Verify reservation exists and email matches
        const reservationResult = await db.query(`
            SELECT r.reservation_id,
                   r.guest_id,
                   r.is_claimed,
                   g.email,
                   g.is_account_created as guest_is_registered
            FROM reservation r
                     JOIN guest g ON r.guest_id = g.guest_id
            WHERE r.confirmation_code = $1
        `, [confirmationCode]);

        if (reservationResult.rowCount === 0) {
            throw createApiError('Reservation not found', 404);
        }

        const reservation = reservationResult.rows[0];

        if (reservation.email !== email) {
            throw createApiError('The email address does not match the reservation', 400);
        }

        // Check if reservation is already linked to this user
        if (reservation.guest_id === session.user.id) {
            // If it's linked but not claimed, update it to claimed
            if (!reservation.is_claimed) {
                await db.query(`
                    UPDATE reservation
                    SET is_claimed = TRUE
                    WHERE reservation_id = $1
                `, [reservation.reservation_id]);

                return NextResponse.json({
                    success: true,
                    message: 'Reservation successfully linked to your account'
                });
            }

            // If already claimed and linked, just return success
            return NextResponse.json({
                success: true,
                message: 'This reservation is already linked to your account'
            });
        }

        // Check if reservation is already linked to another registered user
        if (reservation.guest_id !== session.user.id && reservation.guest_is_registered) {
            throw createApiError('This reservation has already been linked to another account', 400);
        }

        // Update the reservation to point to the authenticated user and mark as claimed
        await db.transaction(async (client) => {
            await client.query(`
                UPDATE reservation
                SET guest_id   = $1,
                    is_claimed = TRUE
                WHERE reservation_id = $2
            `, [session.user.id, reservation.reservation_id]);
        });

        return NextResponse.json({
            success: true,
            message: 'Reservation successfully linked to your account'
        });
    } catch (error) {
        return handleApiError(error);
    }
}