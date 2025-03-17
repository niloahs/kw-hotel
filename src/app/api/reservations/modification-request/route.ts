import { NextResponse } from "next/server";
import db from "@/lib/db";
import auth from "@/lib/auth";

// Make sure this is exported correctly
export async function POST(request: Request) {
    try {
        const {reservationId, requestType, checkInDate, checkOutDate, notes} = await request.json();

        // Get current user
        const user = await auth.getCurrentUser();
        if (!user) {
            return NextResponse.json({message: 'Authentication required'}, {status: 401});
        }

        // Verify reservation belongs to user
        const reservationCheck = await db.query(
            `SELECT *
             FROM reservation
             WHERE reservation_id = $1
               AND guest_id = $2`,
            [reservationId, user.id]
        );

        if (reservationCheck.rowCount === 0) {
            return NextResponse.json({message: 'Reservation not found'}, {status: 404});
        }

        const reservation = reservationCheck.rows[0];

        // Store current and requested values
        const oldValue = JSON.stringify({
            checkInDate: reservation.check_in_date,
            checkOutDate: reservation.check_out_date,
            roomId: reservation.room_id
        });

        const newValue = JSON.stringify({
            checkInDate: checkInDate || reservation.check_in_date,
            checkOutDate: checkOutDate || reservation.check_out_date,
            notes: notes || ''
        });

        // Create change request with pending status
        await db.query(
            `INSERT INTO reservation_change
             (reservation_id, staff_id, change_type, old_value, new_value, request_status)
             VALUES ($1, $2, $3, $4, $5, 'Pending')`,
            [reservationId, 1, requestType, oldValue, newValue]
        );

        return NextResponse.json({success: true});
    } catch (error) {
        console.error('Error submitting modification request:', error);
        return NextResponse.json(
            {message: 'Failed to submit request'},
            {status: 500}
        );
    }
}