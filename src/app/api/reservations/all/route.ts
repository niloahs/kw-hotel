import { NextResponse } from "next/server";
import { getAllReservations } from "@/lib/db-helpers";
import { handleApiError } from "@/lib/api-utils";

export async function GET() {
    try {
        const reservations = await getAllReservations();
        return NextResponse.json(reservations);
    } catch (error) {
        console.error('Error fetching reservations', error);
        return handleApiError(error);
    }
}



        // if (!user) {
        //     return NextResponse.json(
        //         {message: 'Authentication required'},
        //         {status: 401}
        //     );