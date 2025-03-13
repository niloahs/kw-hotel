import { compare, hash } from 'bcryptjs';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import db from './db';

// Type definitions
export type UserType = 'guest' | 'staff';

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    type: UserType;
}

interface TokenPayload extends JwtPayload {
    id: number;
    email: string;
    type: UserType;
}

const JWT_SECRET = process.env.JWT_SECRET || 'king-william-hotel-secret-key';
const COOKIE_NAME = 'kw_auth_token';

// Generate JWT token
export function generateToken(user: User): string {
    return sign(
        {
            id: user.id,
            email: user.email,
            type: user.type
        },
        JWT_SECRET,
        {expiresIn: '7d'}
    );
}

// Get current user from cookie
export async function getCurrentUser(): Promise<User | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;

        if (!token) return null;

        const decoded = verify(token, JWT_SECRET) as TokenPayload;

        const tableName = decoded.type === 'guest' ? 'guest' : 'staff';
        const idField = decoded.type === 'guest' ? 'guest_id' : 'staff_id';

        const result = await db.query(
            `SELECT ${idField}, first_name, last_name, email, phone
             FROM ${tableName}
             WHERE ${idField} = $1`,
            [decoded.id]
        );

        if (result.rowCount === 0) return null;

        const user = result.rows[0];

        return {
            id: user[idField],
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            phone: user.phone,
            type: decoded.type
        };
    } catch (error) {
        console.error('Auth error:', error);
        return null;
    }
}

// Login user
export async function loginUser(email: string, password: string, type: UserType): Promise<User | null> {
    try {
        const tableName = type === 'guest' ? 'guest' : 'staff';
        const idField = type === 'guest' ? 'guest_id' : 'staff_id';

        const result = await db.query(
            `SELECT ${idField}, first_name, last_name, email, phone, password_hash
             FROM ${tableName}
             WHERE email = $1`,
            [email]
        );

        if (result.rowCount === 0) return null;

        const user = result.rows[0];

        if (!user.password_hash) return null;

        const passwordValid = await compare(password, user.password_hash);
        if (!passwordValid) return null;

        return {
            id: user[idField],
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            phone: user.phone,
            type
        };
    } catch (error) {
        console.error('Login error:', error);
        return null;
    }
}

// Create or update guest account
export async function createOrUpdateGuestAccount(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phone?: string
): Promise<{ success: boolean; message: string; guestId?: number }> {
    try {
        // Check if the guest already exists
        const existingGuest = await db.query(
            'SELECT guest_id FROM guest WHERE email = $1',
            [email]
        );

        if (existingGuest.rowCount! > 0) {
            // Guest exists - update account
            return {
                success: false,
                message: 'A user with this email already exists'
            };
        }

        // Create new guest
        const passwordHash = await hash(password, 10);
        const result = await db.query(
            `INSERT INTO guest (first_name, last_name, email, phone, password_hash,
                                is_account_created)
             VALUES ($1, $2, $3, $4, $5, TRUE)
             RETURNING guest_id`,
            [firstName, lastName, email, phone || null, passwordHash]
        );

        return {
            success: true,
            message: 'Account created successfully',
            guestId: result.rows[0].guest_id
        };
    } catch (error) {
        console.error('Account creation error:', error);
        return {
            success: false,
            message: 'An error occurred during account creation'
        };
    }
}

// Cookie management functions
export async function setAuthCookie(token: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
    });
}

export async function clearAuthCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

export default {
    generateToken,
    getCurrentUser,
    loginUser,
    createOrUpdateGuestAccount,
    setAuthCookie,
    clearAuthCookie
};