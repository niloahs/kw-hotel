import { DefaultSession } from "next-auth";

declare module "next-auth" {
    /**
     * Extends the built-in session types
     */
    interface Session {
        user: {
            id: number;
            firstName: string;
            lastName: string;
            email: string;
            phone?: string;
            userType: "guest" | "staff";
        } & DefaultSession["user"];
    }

    /**
     * Extends the built-in user types
     */
    interface User {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        userType: "guest" | "staff";
    }
}

declare module "next-auth/jwt" {
    /**
     * Extends the built-in JWT types
     */
    interface JWT {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        userType: "guest" | "staff";
    }
}