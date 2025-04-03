import db from './db';
import { Reservation, Room, RoomType, Service, UserReservation } from '@/types';

// Helper function to get available rooms
export async function getAvailableRooms(checkIn: string, checkOut: string): Promise<Room[]> {
    const result = await db.queryRows(`
        SELECT r.room_id,
               r.room_type_id,
               r.room_number,
               r.floor_number,
               r.status,
               rt.type_name,
               rt.base_rate,
               COALESCE(sr.rate_multiplier, 1)                           as rate_multiplier,
               COALESCE(rt.base_rate * sr.rate_multiplier, rt.base_rate) as adjusted_rate
        FROM room r
                 JOIN
             room_type rt ON r.room_type_id = rt.room_type_id
                 LEFT JOIN
             seasonal_rate sr ON
                 rt.room_type_id = sr.room_type_id AND
                 $1 BETWEEN sr.start_date AND sr.end_date
        WHERE r.status = 'Available'
          AND r.room_id NOT IN (SELECT res.room_id
                                FROM reservation res
                                WHERE res.status IN ('Upcoming', 'Active')
                                  AND (
                                    (res.check_in_date <= $1 AND res.check_out_date > $1)
                                        OR (res.check_in_date < $2 AND res.check_out_date >= $2)
                                        OR (res.check_in_date >= $1 AND res.check_out_date <= $2)
                                    ))
        ORDER BY rt.base_rate, r.room_number
    `, [checkIn, checkOut]);

    return result as Room[];
}

// Helper function to get room types
export async function getRoomTypes(): Promise<RoomType[]> {
    const result = await db.query(`
        SELECT room_type_id, type_name, base_rate
        FROM room_type
        ORDER BY base_rate
    `);

    return result.rows as RoomType[];
}

// Helper function to get a reservation by ID
export async function getReservationById(reservationId: number): Promise<Reservation | null> {
    const result = await db.queryRows<Reservation>(`
        SELECT r.reservation_id,
               r.guest_id,
               r.room_id,
               r.check_in_date,
               r.check_out_date,
               r.status,
               r.total_amount,
               r.payment_status,
               r.payment_method,
               r.confirmation_code,
               r.is_claimed,
               g.first_name || ' ' || g.last_name as guest_name,
               rm.room_number,
               rt.type_name                       as room_type
        FROM reservation r
                 JOIN
             guest g ON r.guest_id = g.guest_id
                 JOIN
             room rm ON r.room_id = rm.room_id
                 JOIN
             room_type rt ON rm.room_type_id = rt.room_type_id
        WHERE r.reservation_id = $1
    `, [reservationId]);

    if (result.length === 0) return null;
    return result[0];
}

export async function getUserReservations(userId: number): Promise<Reservation[]> {
    const result = await db.queryRows<Reservation>(`
        SELECT r.reservation_id,
               r.guest_id,
               r.room_id,
               r.check_in_date,
               r.check_out_date,
               r.status,
               r.total_amount,
               r.payment_status,
               r.payment_method,
               r.confirmation_code,
               rm.room_number,
               rt.type_name as room_type
        FROM reservation r
                 JOIN room rm ON r.room_id = rm.room_id
                 JOIN room_type rt ON rm.room_type_id = rt.room_type_id
        WHERE r.guest_id = $1
          AND r.is_claimed = TRUE
        ORDER BY r.check_in_date DESC
    `, [userId]);

    return result;
}

//z Helper function to get all reservations
export async function getAllReservations(): Promise<UserReservation[]> {
    const result = await db.queryRows<UserReservation>(`
        SELECT r.reservation_id,
               r.guest_id,
               r.room_id,
               r.staff_id,
               r.check_in_date,
               r.check_out_date,
               r.status,
               r.total_amount,
               r.payment_status,
               r.payment_method,
               r.confirmation_code,
               r.is_claimed,
               g.first_name || ' ' || g.last_name as guest_name,
               rm.room_number,
               rt.type_name                       as room_type,
               rc.request_status,
               rc.change_type                     as change_type
        FROM reservation r
                 JOIN guest g ON r.guest_id = g.guest_id
                 JOIN room rm ON r.room_id = rm.room_id
                 JOIN room_type rt ON rm.room_type_id = rt.room_type_id
                 LEFT JOIN reservation_change rc ON r.reservation_id = rc.reservation_id
        ORDER BY CASE WHEN rc.request_status = 'Pending' THEN 0 ELSE 1 END,
                 r.check_in_date DESC
    `);

    return result;
}


export async function updateReservationStatuses(): Promise<void> {
    try {
        // Update to Active when check-in date has arrived
        await db.query(`
            UPDATE reservation
            SET status = 'Active'
            WHERE check_in_date <= CURRENT_DATE
              AND check_out_date > CURRENT_DATE
              AND status = 'Upcoming'
        `);

        // Update to Completed when check-out date has passed
        await db.query(`
            UPDATE reservation
            SET status = 'Completed'
            WHERE check_out_date <= CURRENT_DATE
              AND status = 'Active'
        `);

        // Mark rooms as Available for completed reservations
        await db.query(`
            UPDATE room r
            SET status = 'Available'
            FROM reservation res
            WHERE r.room_id = res.room_id
              AND res.status = 'Completed'
              AND r.status = 'Occupied'
        `);
    } catch (error) {
        console.error(error);
    }
}


export async function getAllServices(): Promise<Service[]> {
    const result = await db.query(`
        SELECT service_id, service_name, base_price
        FROM service
        ORDER BY service_name
    `);

    return result.rows as Service[];
}


export async function getServiceCharge(reservationId: number): Promise<number> {
    const result = await db.queryRows<{ total: number }>(`
        SELECT COALESCE(SUM(charged_amount), 0) AS total
        FROM service_charge
        WHERE reservation_id = $1
    `, [reservationId]);

    return parseFloat((result[0]?.total || "0.00").toString());
}