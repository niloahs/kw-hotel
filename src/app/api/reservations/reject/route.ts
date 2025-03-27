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

    try {
        // Get change request ID
        const changeResult = await db.query(
            `SELECT reservation_change_id
             FROM reservation_change
             WHERE reservation_id = $1
               AND request_status = 'Pending'
             ORDER BY reservation_change_id DESC
             LIMIT 1`,
            [reservationId]
        );

        if (changeResult.rowCount === 0) {
            return NextResponse.json({message: "No pending request found"}, {status: 404});
        }

        const changeId = changeResult.rows[0]?.reservation_change_id;

        // Delete the change request
        await db.query(
            `DELETE
             FROM reservation_change
             WHERE reservation_change_id = $1`,
            [changeId]
        );

        return NextResponse.json({message: "Request rejected successfully"}, {status: 200});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}