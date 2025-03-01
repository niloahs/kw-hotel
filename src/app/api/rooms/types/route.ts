import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const result = await db.queryRows(`
      SELECT room_type_id, type_name, base_rate
      FROM room_type
      ORDER BY base_rate
    `);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching room types:', error);
        return NextResponse.json(
            { message: 'An error occurred while fetching room types' },
            { status: 500 }
        );
    }
}