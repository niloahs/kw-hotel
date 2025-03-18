import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const roomId = parseInt(params.id);

        if (isNaN(roomId)) {
            return NextResponse.json({message: 'Invalid room ID'}, {status: 400});
        }

        const result = await db.query(`
            SELECT r.*, rt.room_type_id
            FROM room r
                     JOIN room_type rt ON r.room_type_id = rt.room_type_id
            WHERE r.room_id = $1
        `, [roomId]);

        if (result.rowCount === 0) {
            return NextResponse.json({message: 'Room not found'}, {status: 404});
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching room:', error);
        return NextResponse.json(
            {message: 'An error occurred while fetching room details'},
            {status: 500}
        );
    }
}