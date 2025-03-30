import { NextResponse } from "next/server";
import { getUserReservations } from "@/lib/db-helpers";
import { auth } from "@/lib/auth";

export async function GET() {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                {message: 'Authentication required'},
                {status: 401}
            );
        }

        const reservations = await getUserReservations(session.user.id);

        return NextResponse.json(reservations);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        return NextResponse.json(
            {message: 'An error occurred while fetching reservations'},
            {status: 500}
        );
    }
}