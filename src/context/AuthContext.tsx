'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    type: 'guest' | 'staff';
}

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

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    isStaff: false,
    isGuest: false,
    login: async () => {},
    logout: async () => {},
    setUserAndToken: () => {},
});

export function AuthProvider({children}: { children: ReactNode }) {
    // localStorage to persist user between page navigations
    const [user, setUser] = useState<User | null>(() => {
        if (typeof window !== 'undefined') {
            const savedUser = localStorage.getItem('kw_user');
            return savedUser ? JSON.parse(savedUser) : null;
        }
        return null;
    });
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Derived state
    const isAuthenticated = !!user;
    const isStaff = user?.type === 'staff';
    const isGuest = user?.type === 'guest';

    // Check auth once on initial load
    useEffect(() => {
        const setupAuth = async () => {
            try {
                const token = getCookie('kw_auth_token');

                // Already loaded from localStorage, just verify token exists
                if (user && token) {
                    // Set the header for future requests
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    setIsLoading(false);
                    return;
                }

                // No token, no auth
                if (!token) {
                    setUser(null);
                    localStorage.removeItem('kw_user');
                    setIsLoading(false);
                    return;
                }

                // Set header for auth check
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Check if token is valid
                const response = await axios.get('/api/auth/me');
                if (response.data.user) {
                    setUser(response.data.user);
                    localStorage.setItem('kw_user', JSON.stringify(response.data.user));
                } else {
                    // Invalid or expired token
                    deleteCookie('kw_auth_token');
                    localStorage.removeItem('kw_user');
                    setUser(null);
                }
            } catch (error) {
                console.error('Auth setup failed:', error);
                deleteCookie('kw_auth_token');
                localStorage.removeItem('kw_user');
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        setupAuth();
    }, []);

    // Login function
    const login = async (email: string, password: string, userType: 'guest' | 'staff') => {
        const response = await axios.post('/api/auth/login', {
            email,
            password,
            userType
        });

        const token = response.data.token;
        const userData = response.data.user;

        // Save in cookie
        setCookie('kw_auth_token', token, {
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        // Save in localStorage for persistence
        localStorage.setItem('kw_user', JSON.stringify(userData));

        // Set for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setUser(userData);
    };

    // Logout function
    const logout = async () => {
        await axios.post('/api/auth/logout');
        deleteCookie('kw_auth_token');
        localStorage.removeItem('kw_user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        router.refresh();
    };

    // Set user and token directly function
    const setUserAndToken = (newUser: User, token: string) => {
        setCookie('kw_auth_token', token, {
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        // Save in localStorage for persistence
        localStorage.setItem('kw_user', JSON.stringify(newUser));

        // Set for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

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