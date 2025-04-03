import { NextResponse } from "next/server";
import { updateReservationStatuses } from "@/lib/db-helpers";
import db from "@/lib/db";

export async function POST() {
    try {
        await updateReservationStatuses();
        const dateInfo = await getNowInfo();

        return NextResponse.json({
            success: true,
            message: "Reservation statuses updated",
            dateInfo
        });
    } catch (error) {
        console.error('Error updating reservations:', error);
        return NextResponse.json(
            {message: 'Failed to update reservations'},
            {status: 500}
        );
    }
}

async function getNowInfo() {
    const result = await db.query(`
        SELECT 
            CURRENT_TIMESTAMP as timestamp,
            CURRENT_DATE as date,
            current_setting('TIMEZONE') as timezone
    `);
    return result.rows[0];
}