import { NextResponse } from 'next/server';
import { updateReservationStatuses } from '@/lib/db-helpers';

export async function POST() {
    try {
        await updateReservationStatuses();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { success: false, error: "Failed to update reservations" },
            { status: 500 }
        );
    }
}