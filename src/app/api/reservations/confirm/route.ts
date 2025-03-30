import { NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: Request): Promise<NextResponse> {
    // Check staff permissions
    const session = await auth();
    if (!session || session.user.userType !== 'staff') {
        return NextResponse.json(
            {message: 'Staff authentication required'},
            {status: 401}
        );
    }

    const {reservationId} = await req.json();
    console.log('Processing reservation:', reservationId);

    try {
        // Get the change type first
        const changeTypeResult = await db.query(
            `SELECT change_type, reservation_change_id
             FROM reservation_change
             WHERE reservation_id = $1
               AND request_status = 'Pending'
             ORDER BY reservation_change_id DESC
             LIMIT 1`,
            [reservationId]
        );

        if (changeTypeResult.rowCount === 0) {
            return NextResponse.json({message: "No pending request found"}, {status: 404});
        }

        const changeType = changeTypeResult.rows[0]?.change_type;
        const changeId = changeTypeResult.rows[0]?.reservation_change_id;

        if (changeType === 'Cancellation') {
            // Get room ID before deleting reservation
            const roomResult = await db.query(
                `SELECT room_id
                 FROM reservation
                 WHERE reservation_id = $1`,
                [reservationId]
            );

            const roomId = roomResult.rows[0]?.room_id;

            // Delete the reservation
            await db.query(
                `DELETE
                 FROM reservation
                 WHERE reservation_id = $1`,
                [reservationId]
            );

            // Make sure the room is available again
            if (roomId) {
                await db.query(
                    `UPDATE room
                     SET status = 'Available'
                     WHERE room_id = $1`,
                    [roomId]
                );
            }

            // Delete the change request
            await db.query(
                `DELETE
                 FROM reservation_change
                 WHERE reservation_change_id = $1`,
                [changeId]
            );

            return NextResponse.json({message: "Reservation cancelled successfully"}, {status: 200});
        } else if (changeType === 'DateChange') {
            // Get the new dates
            const dateResult = await db.query(
                `SELECT new_check_in_date, new_check_out_date
                 FROM reservation_change
                 WHERE reservation_change_id = $1`,
                [changeId]
            );

            if (dateResult.rowCount === 0) {
                return NextResponse.json({message: "Date change details not found"}, {status: 404});
            }

            const newCheckInDate = dateResult.rows[0].new_check_in_date;
            const newCheckOutDate = dateResult.rows[0].new_check_out_date;

            // Update the reservation with new dates
            await db.query(
                `UPDATE reservation
                 SET check_in_date  = $1,
                     check_out_date = $2
                 WHERE reservation_id = $3`,
                [newCheckInDate, newCheckOutDate, reservationId]
            );

            // Delete the change request after approval
            await db.query(
                `DELETE
                 FROM reservation_change
                 WHERE reservation_change_id = $1`,
                [changeId]
            );

            return NextResponse.json({message: "Reservation dates updated successfully"}, {status: 200});
        } else {
            return NextResponse.json({message: "Invalid change type"}, {status: 400});
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}