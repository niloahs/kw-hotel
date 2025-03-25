'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { CreditCard, Info, User } from 'lucide-react';

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GuestDetailsFormData, guestDetailsSchema } from "@/lib/validation-schemas";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function GuestDetailsForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const {user, isAuthenticated, login} = useAuth();

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
            password: '',
            paymentCard: '',
            cardMonth: '',
            cardYear: '',
            CVV: '',
        }
    });

    // Pre-fill form with user data if logged in
    useEffect(() => {
        if (isAuthenticated && user) {
            form.setValue('firstName', user.firstName);
            form.setValue('lastName', user.lastName);
            form.setValue('email', user.email);

            // Add phone number pre-filling if available
            if (user.phone) {
                form.setValue('phone', user.phone);
            }

            form.setValue('createAccount', false);
        }
    }, [isAuthenticated, user, form]);

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
                    // Use form data values
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phone: data.phone,

                    // Don't need account creation if already logged in
                    createAccount: isAuthenticated ? false : data.createAccount,
                    password: (!isAuthenticated && data.createAccount) ? data.password : undefined,
                },
                // Add flag for authenticated users
                userAuthenticated: isAuthenticated
            });

            // If account was created, login the user
            if (!isAuthenticated && data.createAccount && data.password) {
                await login(data.email, data.password, 'guest');
            }

            // Redirect to confirmation page
            router.push(`/reservations/services?id=${response.data.reservationId}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || 'An error occurred while creating your reservation');
            } else {
                setError('An unexpected error occurred while creating your reservation');
            }
            setIsSubmitting(false);
        }
    }

    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="text-2xl">Complete Your Reservation</CardTitle>
                <CardDescription>
                    {isAuthenticated
                        ? "Confirm your details and payment information"
                        : "Enter your details to complete your reservation"}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                {isAuthenticated && (
                    <Alert className="bg-blue-50 border-blue-200 mb-6">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-600 text-sm">
                            Fields are pre-filled from your account information.
                        </AlertDescription>
                    </Alert>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {/* Guest Information Section */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <User className="h-5 w-5 text-gray-500" />
                                <h3 className="text-lg font-medium">Guest Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="John"
                                                    {...field}
                                                    disabled={isSubmitting}
                                                    className={isAuthenticated ? "border-blue-200 bg-blue-50/30" : ""}
                                                />
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
                                                <Input
                                                    placeholder="Doe"
                                                    {...field}
                                                    disabled={isSubmitting}
                                                    className={isAuthenticated ? "border-blue-200 bg-blue-50/30" : ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                    disabled={isSubmitting}
                                                    className={isAuthenticated ? "border-blue-200 bg-blue-50/30" : ""}
                                                />
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
                                                <Input
                                                    placeholder="123-456-7890"
                                                    {...field}
                                                    disabled={isSubmitting}
                                                    className={isAuthenticated ? "border-blue-200 bg-blue-50/30" : ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Payment Information Section */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCard className="h-5 w-5 text-gray-500" />
                                <h3 className="text-lg font-medium">Payment Information</h3>
                            </div>

                            <FormField
                                control={form.control}
                                name="paymentCard"
                                render={({field}) => (
                                    <FormItem className="mb-4">
                                        <FormLabel>Card Number</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="0000 0000 0000 0000"
                                                {...field}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="col-span-1">
                                    <div className="space-y-2">
                                        <FormLabel>Expiration Date</FormLabel>
                                        <div className="grid grid-cols-2 gap-2">
                                            <FormField
                                                control={form.control}
                                                name="cardMonth"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Select
                                                                onValueChange={field.onChange}
                                                                value={field.value}
                                                                disabled={isSubmitting}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue
                                                                        placeholder="Month" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                                                                        <SelectItem key={num}
                                                                                    value={num.toString()}>
                                                                            {num < 10 ? "0" : ""}
                                                                            {num}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="cardYear"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Select
                                                                onValueChange={field.onChange}
                                                                value={field.value}
                                                                disabled={isSubmitting}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue
                                                                        placeholder="Year" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {[2025, 2026, 2027, 2028, 2029, 2030].map((num) => (
                                                                        <SelectItem key={num}
                                                                                    value={num.toString()}>
                                                                            {num}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-1">
                                    <FormField
                                        control={form.control}
                                        name="CVV"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>CVV</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="123"
                                                        maxLength={3}
                                                        {...field}
                                                        disabled={isSubmitting}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {!isAuthenticated && (
                            <>
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
                                                    Create an account to easily manage your
                                                    reservations and
                                                    receive special offers
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        {!isAuthenticated && createAccount && (
                            <FormField
                                control={form.control}
                                name="password"
                                render={({field}) => (
                                    <FormItem className="max-w-md">
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

                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full py-6 text-lg"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Processing...' : 'Complete Reservation'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}