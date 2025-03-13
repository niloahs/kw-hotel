'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// User type definition
export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    type: 'guest' | 'staff';
}

// Context type
interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isStaff: boolean;
    isGuest: boolean;
    login: (email: string, password: string, userType: 'guest' | 'staff') => Promise<void>;
    logout: () => Promise<void>;
    setUserAndToken: (user: User, token: string) => void;
}

// Create context
const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    isStaff: false,
    isGuest: false,
    login: async () => {
    },
    logout: async () => {
    },
    setUserAndToken: () => {
    },
});

// Provider component
export function AuthProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Derived state
    const isAuthenticated = !!user;
    const isStaff = user?.type === 'staff';
    const isGuest = user?.type === 'guest';

    // Check auth status on load
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = getCookie('kw_auth_token');
                if (!token) {
                    setUser(null);
                    setIsLoading(false);
                    return;
                }

                // Get current user data
                const response = await axios.get('/api/auth/me');
                setUser(response.data.user);
            } catch (error) {
                console.error('Auth check failed:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Login function
    const login = async (email: string, password: string, userType: 'guest' | 'staff') => {
        const response = await axios.post('/api/auth/login', {
            email,
            password,
            userType
        });

        setCookie('kw_auth_token', response.data.token);
        setUser(response.data.user);
    };

    // Logout function
    const logout = async () => {
        await axios.post('/api/auth/logout');
        deleteCookie('kw_auth_token');
        setUser(null);
        router.refresh();
    };

    // Set user and token directly function
    const setUserAndToken = (newUser: User, token: string) => {
        setCookie('kw_auth_token', token);
        setUser(newUser);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated,
                isStaff,
                isGuest,
                login,
                logout,
                setUserAndToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);