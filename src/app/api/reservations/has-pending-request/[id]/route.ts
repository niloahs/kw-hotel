import { NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: Request, {params}: { params: { id: string } }) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({message: 'Authentication required'}, {status: 401});
        }

        const reservationId = parseInt(params.id);
        if (isNaN(reservationId)) {
            return NextResponse.json({message: 'Invalid reservation ID'}, {status: 400});
        }

        // Check if the reservation belongs to the current user
        const reservationCheck = await db.query(
            `SELECT *
             FROM reservation
             WHERE reservation_id = $1
               AND guest_id = $2`,
            [reservationId, session.user.id]
        );

        if (reservationCheck.rowCount === 0) {
            return NextResponse.json({message: 'Reservation not found'}, {status: 404});
        }

        // Check if there's a pending request for this reservation
        const pendingRequestCheck = await db.query(
            `SELECT *
             FROM reservation_change
             WHERE reservation_id = $1
               AND request_status = 'Pending'`,
            [reservationId]
        );

        return NextResponse.json({
            hasPendingRequest: pendingRequestCheck.rowCount! > 0
        });
    } catch (error) {
        console.error('Error checking pending request:', error);
        return NextResponse.json(
            {message: 'An error occurred while checking request status'},
            {status: 500}
        );
    }
}