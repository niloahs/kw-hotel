import { NextResponse } from "next/server";
import db from "@/lib/db";
import { createApiError, handleApiError } from "@/lib/api-utils";
import { auth } from "@/lib/auth";
import { Reservation, ServiceCharge } from "@/types";

interface ReservationBillDetails extends Partial<Reservation> {
    baseRate: number | string;
    rateMultiplier: number | string;
}

export async function GET(request: Request, {params}: { params: { id: string } }) {
    try {
        const session = await auth();
        if (!session) {
            throw createApiError('Authentication required', 401);
        }

        const id = parseInt(params.id);
        if (isNaN(id)) {
            throw createApiError('Invalid reservation ID', 400);
        }

        // Check if it's the user's reservation or if user is staff
        if (session.user.userType !== 'staff') {
            const reservationOwnerCheck = await db.query(
                `SELECT 1
                 FROM reservation
                 WHERE reservation_id = $1
                   AND guest_id = $2`,
                [id, session.user.id]
            );

            if (reservationOwnerCheck.rowCount === 0) {
                throw createApiError('You do not have permission to view this bill', 403);
            }
        }

        // Fetch reservation details
        const reservationResult = await db.queryRows<ReservationBillDetails>(`
            SELECT r.reservation_id,
                   r.check_in_date,
                   r.check_out_date,
                   r.total_amount,
                   r.payment_status,
                   r.confirmation_code,
                   rm.room_number,
                   rt.type_name                       as room_type,
                   rt.base_rate,
                   COALESCE(sr.rate_multiplier, 1)    as rate_multiplier,
                   g.first_name || ' ' || g.last_name as guest_name
            FROM reservation r
                     JOIN room rm ON r.room_id = rm.room_id
                     JOIN room_type rt ON rm.room_type_id = rt.room_type_id
                     JOIN guest g ON r.guest_id = g.guest_id
                     LEFT JOIN seasonal_rate sr ON rt.room_type_id = sr.room_type_id
                AND r.check_in_date BETWEEN sr.start_date AND sr.end_date
            WHERE r.reservation_id = $1
        `, [id]);

        if (reservationResult.length === 0) {
            throw createApiError('Reservation not found', 404);
        }

        if (!reservationResult[0].checkInDate || !reservationResult[0].checkOutDate) {
            throw createApiError('Reservation has invalid dates', 400);
        }

        const checkIn = new Date(reservationResult[0].checkInDate);
        const checkOut = new Date(reservationResult[0].checkOutDate);
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));


        // Fetch service charges and convert amounts
        const serviceChargesResult = await db.queryRows<ServiceCharge>(`
            SELECT sc.service_charge_id as "serviceChargeId",
                   sc.service_id        as "serviceId",
                   sc.reservation_id    as "reservationId",
                   sc.charged_amount    as "chargedAmount",
                   sc.quantity,
                   sc.charge_date       as "chargeDate",
                   s.service_name       as "serviceName"
            FROM service_charge sc
                     JOIN service s ON sc.service_id = s.service_id
            WHERE sc.reservation_id = $1
            ORDER BY sc.charge_date
        `, [id]);

        // Convert string amounts to numbers
        const serviceCharges = serviceChargesResult.map(charge => ({
            ...charge,
            chargedAmount: Number(charge.chargedAmount),
        }));

        // Calculate service total
        const serviceChargeTotal = serviceCharges.reduce(
            (sum, charge) => sum + charge.chargedAmount,
            0
        );

        // Convert room rates to numbers
        const baseRate = Number(reservationResult[0].baseRate) || 0;
        const rateMultiplier = Number(reservationResult[0].rateMultiplier) || 1;
        const nightlyRate = baseRate * rateMultiplier;
        const roomTotal = nightlyRate * nights;

        return NextResponse.json({
            reservation: reservationResult[0],
            nights,
            nightlyRate,
            roomTotal,
            serviceCharges: serviceCharges,
            serviceChargeTotal,
            billTotal: roomTotal + serviceChargeTotal
        });
    } catch (error) {
        return handleApiError(error);
    }
}