'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { setCookie } from 'cookies-next';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { LoginFormData, loginSchema } from "@/lib/validation-schemas";

interface LoginFormProps {
    userType: 'guest' | 'staff';
    onSuccess?: () => void;
    onRegisterClick?: () => void;
}

export default function LoginForm({userType, onSuccess}: LoginFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post('/api/auth/login', {
                ...data,
                userType
            });

            // Store the token in a cookie for client-side access
            setCookie('kw_auth_token', response.data.token);

            // Call success callback
            onSuccess?.();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'An error occurred during login');
            } else {
                setError('An unexpected error occurred during login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="your@email.com"
                                    {...field}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="********"
                                    {...field}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
            </form>
        </Form>
    );
}