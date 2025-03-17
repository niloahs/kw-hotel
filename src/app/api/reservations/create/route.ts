import { NextResponse } from "next/server";
import db from "@/lib/db";
import { calculateNights, formatPhoneNumber } from "@/lib/utils";
import { hash } from "bcryptjs";
import auth, { generateToken, UserType } from "@/lib/auth";
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {checkInDate, checkOutDate, roomId, guestDetails, userAuthenticated} = body;

        // Validate required data
        if (!checkInDate || !checkOutDate || !roomId || !guestDetails) {
            return NextResponse.json(
                {message: 'Missing required reservation information'},
                {status: 400}
            );
        }

        const {firstName, lastName, email, phone, createAccount, password} = guestDetails;

        // Create or retrieve guest record
        let guestId;
        let token = null;
        let userData = null;

        // Handle authenticated users
        if (userAuthenticated) {
            // Get the current authenticated user from auth middleware
            const currentUser = await auth.getCurrentUser();
            if (!currentUser) {
                return NextResponse.json(
                    {message: 'Authentication required'},
                    {status: 401}
                );
            }

            // Use the authenticated user's ID directly
            guestId = currentUser.id;
        } else {
            // For non-authenticated users, follow the existing flow
            // Check if guest exists
            const existingGuest = await db.query(
                'SELECT guest_id, is_account_created FROM guest WHERE email = $1',
                [email]
            );

            if (existingGuest.rowCount! > 0) {
                // Use existing guest
                guestId = existingGuest.rows[0].guest_id;

                // If they want to create an account and don't have one yet
                if (createAccount && password && !existingGuest.rows[0].is_account_created) {
                    const passwordHash = await hash(password, 10);
                    await db.query(
                        'UPDATE guest SET password_hash = $1, is_account_created = TRUE WHERE guest_id = $2',
                        [passwordHash, guestId]
                    );

                    // Generate token for auto-login
                    userData = {
                        id: guestId,
                        firstName,
                        lastName,
                        email,
                        type: 'guest' as UserType
                    };
                    token = generateToken(userData);
                }
            } else {
                // Create new guest
                if (createAccount && password) {
                    // Create with account
                    const passwordHash = await hash(password, 10);
                    const newGuest = await db.query(
                        `INSERT INTO guest (first_name, last_name, email, phone, password_hash,
                                            is_account_created)
                         VALUES ($1, $2, $3, $4, $5, TRUE)
                         RETURNING guest_id`,
                        [firstName, lastName, email, phone || null, passwordHash]
                    );

                    guestId = newGuest.rows[0].guest_id;

                    // Generate token for auto-login
                    userData = {
                        id: guestId,
                        firstName,
                        lastName,
                        email,
                        type: 'guest' as UserType
                    };
                    token = generateToken(userData);
                } else {
                    // Create guest without account
                    const newGuest = await db.query(
                        `INSERT INTO guest (first_name, last_name, email, phone, is_account_created)
                         VALUES ($1, $2, $3, $4, FALSE)
                         RETURNING guest_id`,
                        [firstName, lastName, email, formatPhoneNumber(phone) || null]
                    );

                    guestId = newGuest.rows[0].guest_id;
                }
            }
        }

        // Calculate reservation cost
        const roomData = await db.query(`
            SELECT rt.base_rate, COALESCE(sr.rate_multiplier, 1) as rate_multiplier
            FROM room r
                     JOIN room_type rt ON r.room_type_id = rt.room_type_id
                     LEFT JOIN seasonal_rate sr ON
                rt.room_type_id = sr.room_type_id AND
                $1 BETWEEN sr.start_date AND sr.end_date
            WHERE r.room_id = $2
        `, [checkInDate, roomId]);

        if (roomData.rowCount === 0) {
            return NextResponse.json(
                {message: 'Room not found'},
                {status: 404}
            );
        }

        const baseRate = parseFloat(roomData.rows[0].base_rate);
        const rateMultiplier = parseFloat(roomData.rows[0].rate_multiplier);
        const adjustedRate = baseRate * rateMultiplier;
        const nights = calculateNights(checkInDate, checkOutDate);
        const totalAmount = adjustedRate * nights;

        // Generate a unique confirmation code
        const confirmationCode = randomUUID().substring(0, 8).toUpperCase();

        // Create reservation (using a default staff ID for now)
        const staffId = 1;

        const reservationResult = await db.query(`
            INSERT INTO reservation (guest_id, room_id, staff_id, check_in_date, check_out_date,
                                     status, total_amount, payment_status, payment_method,
                                     confirmation_code, is_claimed)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING reservation_id, confirmation_code
        `, [
            guestId, roomId, staffId, checkInDate, checkOutDate,
            'Confirmed', totalAmount, 'Paid', 'Credit Card', confirmationCode,
            // Auto-claim if authenticated or creating account
            userAuthenticated || createAccount
        ]);

        const reservationId = reservationResult.rows[0].reservation_id;

        // Update room status
        await db.query(`
            UPDATE room
            SET status = 'Occupied'
            WHERE room_id = $1
        `, [roomId]);

        return NextResponse.json({
            success: true,
            reservationId,
            // Only include confirmation code if not claimed
            confirmationCode: userAuthenticated || createAccount ? null : confirmationCode,
            totalAmount,
            token,
            user: userData
        });
    } catch (error) {
        console.error('Error creating reservation:', error);
        return NextResponse.json(
            {message: 'An error occurred while creating the reservation'},
            {status: 500}
        );
    }
}