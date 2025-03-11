import { NextResponse } from "next/server";
import { getUserReservations } from "@/lib/db-helpers";
import auth from "@/lib/auth";
import { handleApiError } from "@/lib/api-utils";

export async function GET() {
    try {
        const user = await auth.getCurrentUser();

        if (!user) {
            return NextResponse.json(
                {message: 'Authentication required'},
                {status: 401}
            );
        }

        const reservations = await getUserReservations(user.id);

        return NextResponse.json(reservations);
    } catch (error) {
        return handleApiError(error);
    }
}