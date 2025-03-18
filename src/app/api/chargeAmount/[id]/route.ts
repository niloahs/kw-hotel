import { NextResponse } from "next/server";
import { getServiceCharge } from "@/lib/db-helpers";
import { createApiError, handleApiError } from "@/lib/api-utils";


export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            throw createApiError('Invalid reservation ID', 400);
        }

        const totalCharge = await getServiceCharge(id);
        return NextResponse.json({ totalCharge });
    } catch (error) {
        return handleApiError(error);
    }
}



