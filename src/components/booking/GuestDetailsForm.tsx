'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { setCookie } from 'cookies-next';

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { GuestDetailsFormData, guestDetailsSchema } from "@/lib/validation-schemas";

export default function GuestDetailsForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const roomId = searchParams.get('roomId');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const form = useForm<GuestDetailsFormData>({
        resolver: zodResolver(guestDetailsSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            createAccount: false,
            password: ''
        }
    });

    const createAccount = form.watch('createAccount');

    const onSubmit = async (data: GuestDetailsFormData) => {
        if (!checkIn || !checkOut || !roomId) {
            setError('Missing booking information');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            // Single API call for reservation
            const response = await axios.post('/api/reservations/create', {
                checkInDate: checkIn,
                checkOutDate: checkOut,
                roomId: parseInt(roomId),
                guestDetails: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phone: data.phone,
                    createAccount: data.createAccount,
                    password: data.createAccount ? data.password : undefined
                }
            });

            // If token is returned (user created an account), store it
            if (data.createAccount && response.data.token) {
                setCookie('kw_auth_token', response.data.token);
            }

            // Redirect to confirmation page
            router.push(`/reservations/confirmation?id=${response.data.reservationId}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || 'An error occurred while creating your reservation');
            } else {
                setError('An unexpected error occurred while creating your reservation');
            }
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Guest Information</CardTitle>
                <CardDescription>
                    Enter your details to complete your reservation
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John" {...field}
                                                   disabled={isSubmitting} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Doe" {...field}
                                                   disabled={isSubmitting} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="email"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="your@email.com" {...field}
                                               disabled={isSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="XXX-XXX-XXXX" {...field}
                                               disabled={isSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator />

                        <FormField
                            control={form.control}
                            name="createAccount"
                            render={({field}) => (
                                <FormItem
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Create an account</FormLabel>
                                        <FormDescription>
                                            Create an account to easily manage your reservations and
                                            receive special offers
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {createAccount && (
                            <FormField
                                control={form.control}
                                name="password"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Choose a password"
                                                {...field}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Must be at least 6 characters
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <CardFooter className="px-0">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Processing...' : 'Complete Reservation'}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}