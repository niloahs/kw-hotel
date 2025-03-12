// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import auth from '@/lib/auth';
import { hash } from 'bcryptjs';
import db from '@/lib/db';

// Type guard for PostgreSQL errors
function isPostgresError(error: unknown): error is { code: string } {
    return error !== null && typeof error === 'object' && 'code' in error;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {firstName, lastName, email, password, phone, reservationId} = body;

        // Convert reservationId to number if provided
        const reservationIdNum = reservationId ? parseInt(String(reservationId), 10) : null;

        // Detailed logging
        console.log(`Registration attempt: email=${email}, 
            rawReservationId=${reservationId} (${typeof reservationId}), 
            parsed=${reservationIdNum}, 
            isValidNumber=${reservationIdNum !== null && !isNaN(reservationIdNum)}`);

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
        console.log(`Found existing guest: ${existingGuest.rowCount > 0}, isAccount=${existingGuest.rowCount > 0 ? existingGuest.rows[0].is_account_created : 'N/A'}`);

        let guestId;
        const passwordHash = await hash(password, 10);

        if (existingGuest.rowCount > 0) {
            // If already has an account, return error
            if (existingGuest.rows[0].is_account_created) {
                return NextResponse.json(
                    {message: 'An account with this email already exists'},
                    {status: 400}
                );
            }

            // Otherwise, update the existing guest record to create an account
            guestId = existingGuest.rows[0].guest_id;
            console.log(`Updating existing guest with ID: ${guestId}`);

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

            // Mark all reservations for this guest as claimed
            const claimResult = await db.query(
                `UPDATE reservation
                 SET is_claimed = TRUE
                 WHERE guest_id = $1
                 RETURNING reservation_id`,
                [guestId]
            );
            console.log(`Claimed ${claimResult.rowCount} existing reservations for guest ${guestId}`);

            // If a specific reservationId was provided, ensure it's claimed too
            if (reservationIdNum !== null && !isNaN(reservationIdNum)) {
                console.log(`Checking specific reservation ${reservationIdNum}`);

                // Check if the reservation exists
                const reservationCheck = await db.query(
                    `SELECT r.reservation_id
                     FROM reservation r
                     WHERE r.reservation_id = $1`,
                    [reservationIdNum]
                );

                if (reservationCheck.rowCount > 0) {
                    console.log(`Transferring reservation ${reservationIdNum} to guest ${guestId}`);

                    await db.query(
                        `UPDATE reservation
                         SET guest_id   = $1,
                             is_claimed = TRUE
                         WHERE reservation_id = $2`,
                        [guestId, reservationIdNum]
                    );
                } else {
                    console.log(`Reservation ${reservationIdNum} not found in database`);
                }
            } else if (reservationId) {
                console.log(`Invalid reservation ID format: ${reservationId}`);
            }
        } else {
            // No existing guest, create a new one with account
            console.log(`Creating new guest account with email ${email}`);
            const newAccount = await db.query(
                `INSERT INTO guest (first_name, last_name, email, phone, password_hash,
                                    is_account_created)
                 VALUES ($1, $2, $3, $4, $5, TRUE)
                 RETURNING guest_id`,
                [firstName, lastName, email, phone || null, passwordHash]
            );

            guestId = newAccount.rows[0].guest_id;
            console.log(`New guest created with ID: ${guestId}`);

            // If a specific reservation ID was provided, check if we need to transfer it
            if (reservationIdNum !== null && !isNaN(reservationIdNum)) {
                console.log(`Checking reservation ${reservationIdNum} for new account`);

                // Get the reservation
                const reservationResult = await db.query(
                    `SELECT r.reservation_id, r.guest_id
                     FROM reservation r
                     WHERE r.reservation_id = $1`,
                    [reservationIdNum]
                );

                if (reservationResult.rowCount > 0) {
                    console.log(`Found reservation ${reservationIdNum}. Transferring to new guest ${guestId}`);

                    // Transfer ownership unconditionally when coming from confirmation page
                    await db.query(
                        `UPDATE reservation
                         SET guest_id   = $1,
                             is_claimed = TRUE
                         WHERE reservation_id = $2`,
                        [guestId, reservationIdNum]
                    );
                } else {
                    console.log(`Reservation ${reservationIdNum} not found in database`);
                }
            } else if (reservationId) {
                console.log(`Invalid reservation ID format: ${reservationId}`);
            }
        }

        // Log in the user after successful registration/update
        console.log(`Attempting login for email ${email}`);
        const user = await auth.loginUser(email, password, 'guest');

        if (!user) {
            return NextResponse.json(
                {message: 'Account created but unable to log in automatically'},
                {status: 500}
            );
        }

        // Generate token
        const token = auth.generateToken(user);
        await auth.setAuthCookie(token);
        console.log(`Login successful, token generated for user ID ${user.id}`);

        return NextResponse.json({
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                type: user.type
            },
            message: 'Account created successfully'
        });
    } catch (error) {
        console.error('Registration error:', error);

        // Type-safe error handling
        if (isPostgresError(error) && error.code === '23505') {
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