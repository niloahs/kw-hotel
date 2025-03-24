import { NextResponse } from "next/server";
import { getAllServices } from "@/lib/db-helpers";
import { handleApiError } from "@/lib/api-utils";

export async function GET() {
    try {
        const services = await getAllServices();
        return NextResponse.json(services);
    } catch (error) {
        console.error('Error fetching reservations', error);
        return handleApiError(error);
    }
}


