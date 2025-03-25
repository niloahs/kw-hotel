'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useAuth() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const isLoading = status === "loading";

    const login = async (email: string, password: string) => {
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.ok) {
            router.refresh();
        }

        return result;
    };

    const logout = async () => {
        await signOut({ redirect: false });
        router.refresh();
    };

    return {
        user: session?.user,
        isAuthenticated: status === "authenticated",
        isLoading,
        isStaff: session?.user?.userType === 'staff',
        isGuest: session?.user?.userType === 'guest',
        login,
        logout,
        update,
    };
}