import { NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { createApiError, handleApiError } from "@/lib/api-utils";

export async function GET() {
    try {
        const session = await auth();

        if (!session || session.user.userType !== 'staff') {
            throw createApiError('Staff authentication required', 401);
        }

        // Get current date for calculations
        const today = new Date().toISOString().split('T')[0];

        // Current occupancy
        const occupancyResult = await db.query(`
            SELECT COUNT(DISTINCT r.room_id)   as occupied_rooms,
                   (SELECT COUNT(*) FROM room) as total_rooms
            FROM reservation res
                     JOIN room r ON res.room_id = r.room_id
            WHERE res.status IN ('Active')
              AND $1 BETWEEN res.check_in_date AND res.check_out_date
        `, [today]);

        const occupancy = occupancyResult.rows[0];
        const occupancyRate = Math.round((occupancy.occupied_rooms / occupancy.total_rooms) * 100);

        // Room type popularity (past 90 days)
        const past90Days = new Date();
        past90Days.setDate(past90Days.getDate() - 90);
        const past90DaysStr = past90Days.toISOString().split('T')[0];

        const roomTypeResult = await db.query(`
            SELECT rt.type_name              as "typeName",
                   COUNT(res.reservation_id) as bookings
            FROM reservation res
                     JOIN room r ON res.room_id = r.room_id
                     JOIN room_type rt ON r.room_type_id = rt.room_type_id
            WHERE res.check_in_date >= $1
            GROUP BY rt.type_name
            ORDER BY bookings DESC
        `, [past90DaysStr]);

        // Service popularity
        const serviceResult = await db.query(`
            SELECT s.service_name                               as "serviceName",
                   COUNT(sc.service_charge_id)                  as "usageCount",
                   COALESCE(SUM(sc.charged_amount), 0)::NUMERIC as "totalRevenue"
            FROM service_charge sc
                     JOIN service s ON sc.service_id = s.service_id
            WHERE sc.charge_date >= $1
            GROUP BY s.service_name
            ORDER BY "usageCount" DESC
        `, [past90DaysStr]);

        return NextResponse.json({
            occupancy: {
                occupiedRooms: occupancy.occupied_rooms,
                totalRooms: occupancy.total_rooms,
                occupancyRate
            },
            roomTypePopularity: roomTypeResult.rows,
            servicePopularity: serviceResult.rows,
        });
    } catch (error) {
        return handleApiError(error);
    }
}