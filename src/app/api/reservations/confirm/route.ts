import { NextResponse } from "next/server";
import db from "@/lib/db";

// Make sure this is exported correctly
export async function POST(req: Request): Promise<NextResponse> {
    const { reservationId } = await req.json();
    console.log('Received reservation:', reservationId);

    const changeTypeResult = await db.query(
        `SELECT change_type FROM reservation_change WHERE reservation_id = $1`,
        [reservationId]
    );
    const changeType = changeTypeResult.rows[0]?.change_type;

    if (changeType === 'Cancellation') {
        try {
            // Delete the reservation from the reservation table
            await db.query(
                `DELETE FROM reservation WHERE reservation_id = $1`,
                [reservationId]
            );

            // Update the request status in the reservation change table to "Approved"
            await db.query(
                `UPDATE reservation_change SET request_status = $1 WHERE reservation_id = $2`,
                ["Approved", reservationId]
            );

            return NextResponse.json({ message: "Reservation cancelled successfully" }, { status: 200 });
        } catch (error) {
            console.error(error);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    } else {
        try {
            console.log('Received reservation:', reservationId);

            // Retrieve the new check-in date from the reservation_change table
            const newCheckInDateResult = await db.query(
                `SELECT new_check_in_date FROM reservation_change WHERE reservation_id = $1`,
                [reservationId]
            );
            console.log('newCheckInDateResult:', newCheckInDateResult);
            const new_check_in_date = newCheckInDateResult.rows[0]?.new_check_in_date;

            // Retrieve the new check-out date from the reservation_change table
            const newCheckOutDateResult = await db.query(
                `SELECT new_check_out_date FROM reservation_change WHERE reservation_id = $1`,
                [reservationId]
            );
            console.log('newCheckOutDateResult:', newCheckOutDateResult);
            const new_check_out_date = newCheckOutDateResult.rows[0]?.new_check_out_date;

            if (!new_check_in_date || !new_check_out_date) {
                console.log('Reservation change not found');
                return NextResponse.json({ error: "Reservation change not found" }, { status: 404 });
            }

            // Update the reservation table with the changes
            await db.query(
                `UPDATE reservation SET check_in_date = $1, check_out_date = $2 WHERE reservation_id = $3`,
                [new_check_in_date, new_check_out_date, reservationId]
            );

            // Update the request status in the reservation change table to "Approved"
            await db.query(
                `UPDATE reservation_change SET request_status = $1 WHERE reservation_id = $2`,
                ["Approved", reservationId]
            );

            return NextResponse.json({ message: "Reservation updated successfully" }, { status: 200 });
        } catch (error) {
            console.error(error);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    }
}