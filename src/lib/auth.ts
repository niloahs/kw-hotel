import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { getServerSession } from "next-auth/next";
import db from "@/lib/db";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: {label: "Email", type: "email"},
                password: {label: "Password", type: "password"},
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const {email, password} = credentials;

                // First check if user exists in staff table
                let result = await db.query(
                    `SELECT staff_id as id, first_name, last_name, email, password_hash
                     FROM staff
                     WHERE email = $1`,
                    [email]
                );

                if (result.rowCount === 0) {
                    // If not in staff table, check guest table
                    result = await db.query(
                        `SELECT guest_id as id, first_name, last_name, email, phone, password_hash
                         FROM guest
                         WHERE email = $1
                           AND is_account_created = TRUE`,
                        [email]
                    );

                    if (result.rowCount === 0) {
                        return null; // Not found in either table
                    }
                }

                const user = result.rows[0];

                // Verify password
                if (!user.password_hash) {
                    return null;
                }

                const isPasswordValid = await compare(password, user.password_hash);

                if (!isPasswordValid) {
                    return null;
                }

                // Determine user type based on which table had the match
                const userType = 'phone' in user ? "guest" : "staff";

                // Return the user data
                return {
                    id: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                    phone: user.phone || '',
                    userType,
                } as User;
            },
        }),
    ],
    callbacks: {
        async jwt({token, user}) {
            if (user) {
                token.id = Number(user.id);
                token.firstName = user.firstName;
                token.lastName = user.lastName;
                token.email = user.email;
                token.phone = user.phone;
                token.userType = user.userType;
            }
            return token;
        },
        async session({session, token}) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.firstName = token.firstName;
                session.user.lastName = token.lastName;
                session.user.email = token.email;
                session.user.phone = token.phone;
                session.user.userType = token.userType;
            }
            return session;
        },
    },
    pages: {
        signIn: '/', // We'll handle with our modal
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
};

// Helper function to use getServerSession with authOptions
export function auth() {
    return getServerSession(authOptions);
}