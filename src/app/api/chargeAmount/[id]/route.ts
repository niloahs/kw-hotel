import { NextResponse } from "next/server";
import { getServiceCharge } from "@/lib/db-helpers";
import { createApiError, handleApiError } from "@/lib/api-utils";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            throw createApiError('Invalid reservation ID', 400);
        }

        const serviceCharge = await getServiceCharge(id);

     

        return NextResponse.json(serviceCharge);
    } catch (error) {
        return handleApiError(error);
    }
}


