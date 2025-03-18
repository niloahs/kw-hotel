import { NextResponse } from "next/server";
import db from "@/lib/db";
import auth from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const {reservationId, requestType, checkInDate, checkOutDate} = await request.json();

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

        // Create change request with pending status
        if (requestType === 'DateChange') {
            await db.query(
                `INSERT INTO reservation_change
                 (reservation_id, staff_id, change_type, old_check_in_date, old_check_out_date,
                  new_check_in_date, new_check_out_date, request_status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending')`,
                [
                    reservationId,
                    1, // Default staff_id
                    requestType,
                    reservation.check_in_date,
                    reservation.check_out_date,
                    checkInDate || reservation.check_in_date,
                    checkOutDate || reservation.check_out_date
                ]
            );
        } else if (requestType === 'Cancellation') {
            await db.query(
                `INSERT INTO reservation_change
                 (reservation_id, staff_id, change_type, old_check_in_date, old_check_out_date,
                  request_status)
                 VALUES ($1, $2, $3, $4, $5, 'Pending')`,
                [
                    reservationId,
                    1,
                    requestType,
                    reservation.check_in_date,
                    reservation.check_out_date
                ]
            );
        }

        return NextResponse.json({success: true});
    } catch (error) {
        console.error('Error submitting modification request:', error);
        return NextResponse.json(
            {message: 'Failed to submit request'},
            {status: 500}
        );
    }
}