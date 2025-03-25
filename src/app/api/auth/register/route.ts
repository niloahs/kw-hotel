import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import db from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {firstName, lastName, email, password, phone, reservationId} = body;

        // Convert reservationId to number if provided
        const reservationIdNum = reservationId ? parseInt(String(reservationId), 10) : null;

        console.log(`Registration attempt: email=${email}, reservationId=${reservationId}`);

        if (!firstName || !lastName || !email || !password) {
            return NextResponse.json(
                {message: 'All fields are required'},
                {status: 400}
            );
        }

        // Check if a guest record already exists with this email
        const existingGuest = await db.query(
            'SELECT guest_id, is_account_created FROM guest WHERE email = $1',
            [email]
        );

        let guestId;
        const passwordHash = await hash(password, 10);

        if (existingGuest.rowCount! > 0) {
            // If already has an account, return error
            if (existingGuest.rows[0].is_account_created) {
                return NextResponse.json(
                    {message: 'An account with this email already exists'},
                    {status: 400}
                );
            }

            // Otherwise, update the existing guest record to create an account
            guestId = existingGuest.rows[0].guest_id;

            await db.query(
                `UPDATE guest
                 SET first_name         = $1,
                     last_name          = $2,
                     phone              = $3,
                     password_hash      = $4,
                     is_account_created = TRUE
                 WHERE guest_id = $5`,
                [firstName, lastName, phone || null, passwordHash, guestId]
            );

            // ONLY claim the specific reservation if provided via reservationId
            if (reservationIdNum !== null && !isNaN(reservationIdNum)) {
                // Verify the reservation belongs to this guest
                const reservationCheck = await db.query(
                    `SELECT r.reservation_id
                     FROM reservation r
                     WHERE r.reservation_id = $1
                       AND r.guest_id = $2`,
                    [reservationIdNum, guestId]
                );

                if (reservationCheck.rowCount! > 0) {
                    await db.query(
                        `UPDATE reservation
                         SET is_claimed = TRUE
                         WHERE reservation_id = $1`,
                        [reservationIdNum]
                    );
                }
            }
        } else {
            // No existing guest, create a new one with account
            const newAccount = await db.query(
                `INSERT INTO guest (first_name, last_name, email, phone, password_hash,
                                    is_account_created)
                 VALUES ($1, $2, $3, $4, $5, TRUE)
                 RETURNING guest_id`,
                [firstName, lastName, email, phone || null, passwordHash]
            );

            guestId = newAccount.rows[0].guest_id;

            // If a specific reservation ID was provided, we should require a code
            // but for simplicity, we'll just check if the reservation exists
            if (reservationIdNum !== null && !isNaN(reservationIdNum)) {
                const reservationResult = await db.query(
                    `SELECT r.reservation_id, r.guest_id
                     FROM reservation r
                     WHERE r.reservation_id = $1`,
                    [reservationIdNum]
                );

                if (reservationResult.rowCount! > 0) {
                    await db.query(
                        `UPDATE reservation
                         SET guest_id   = $1,
                             is_claimed = TRUE
                         WHERE reservation_id = $2`,
                        [guestId, reservationIdNum]
                    );
                }
            }
        }

        // Return success - with NextAuth, signing in will happen client-side
        return NextResponse.json({
            success: true,
            message: 'Account created successfully'
        });
    } catch (error) {
        console.error('Registration error:', error);

        // Check for Postgres duplicate key error
        if (typeof error === 'object'
            && error !== null
            && 'code' in error
            && error.code === '23505') {
            return NextResponse.json(
                {message: 'An account with this email already exists'},
                {status: 400}
            );
        }

        return NextResponse.json(
            {message: 'An error occurred during registration'},
            {status: 500}
        );
    }
}