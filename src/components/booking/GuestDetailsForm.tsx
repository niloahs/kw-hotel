'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Info } from 'lucide-react';

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
import { GuestDetailsFormData, guestDetailsSchema } from "@/lib/validation-schemas";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function GuestDetailsForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const {isAuthenticated, user, setUserAndToken} = useAuth();

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
            CardName: '',
            paymentCard: '',
            cardMonth: '',
            cardYear: '',
            CVV: '',
            BPC: ''
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
                    // paymentStatus: "Paid"
                },
                // Add flag for authenticated users
                userAuthenticated: isAuthenticated
            });

            // If token and user data are returned (user created an account), set in auth context
            if (!isAuthenticated && data.createAccount && response.data.token && response.data.user) {
                // Use the destructured function from the top of the component
                setUserAndToken(response.data.user, response.data.token);
            }

            // Redirect to confirmation page
            router.push(`/reservations/confirmation?id=${response.data.reservationId}`);
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
        <Card>
            <CardHeader>
                <CardTitle>Guest Information</CardTitle>
                <CardDescription>
                    {isAuthenticated
                        ? "Confirm your details to complete your reservation"
                        : "Enter your details to complete your reservation"}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                {isAuthenticated && (
                    <Card className="bg-blue-50 border-blue-200 py-2 mb-6">
                        <CardContent className="flex items-center space-x-2 pb-1 px-4">
                            <Info className="text-blue-600" />
                            <p className="text-blue-600 text-sm text-left">
                                Fields are pre-filled from your account information.
                            </p>
                        </CardContent>
                    </Card>
                )}

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

                        {/* In GuestDetailsForm.tsx */}
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
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                Payment method
                                </CardTitle>
                                <CardDescription>
                                    Enter Your card information to proceed
                                </CardDescription>
                                
                            </CardHeader>
                            <CardContent className="p-4 pt-0">

                            <FormField
                                        control={form.control}
                                        name="CardName"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Name on Card</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="John Doe"
                                                        {...field}
                                                        disabled={isSubmitting}
                                                        // className={isAuthenticated ? "border-blue-200 bg-blue-50/30" : ""}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                            <FormField
                                    control={form.control}
                                    name="paymentCard"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Debit/Credit card number</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="0000 0000 0000 0000"
                                                    {...field}
                                                    disabled={isSubmitting}
                                                    // className={isAuthenticated ? "border-blue-200 bg-blue-50/30" : ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />


                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Card Month Field */}   
                                <FormField 
                                control={form.control}
                                name="cardMonth"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Expiration date</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Month" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12].map((num) => (
                                                        <SelectItem key={num} value={num.toString()}>
                                                            {num < 10 ? "0" : ""}
                                                            {num}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage className="mt-1 text-sm" />
                                    </FormItem>
                                )}
                            />

                            {/* Card Year Field */}
                            <FormField
                                control={form.control}
                                name="cardYear"
                                render={({ field }) => (
                                    <FormItem className="w-full mt-8">
                                        <FormControl>
                                            <Select onValueChange={field.onChange}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Year" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[2025, 2026, 2027, 2028, 2029, 2030].map((num) => (
                                                        <SelectItem key={num} value={num.toString()}>
                                                            {num}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage className="mt-1 text-sm text-red-500" />
                                    </FormItem>
                                )}
                            />
                        </div>

                                <div className="grid grid-cols-1">
                                            <FormField
                                        control={form.control}
                                        name="CVV"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>CVV</FormLabel>
                                                <FormControl>
                                                    <Input className='form-control form-control-sm w-16'
                                                        placeholder=" 123"
                                                        maxLength={3}
                                                        pattern="\d{3}"
                                                        {...field}
                                                        disabled={isSubmitting}
                                                        // className={isAuthenticated ? "border-blue-200 bg-blue-50/30" : ""}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="BPC"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Billing postal code</FormLabel>
                                                <FormControl>
                                                    <Input className='w-24'
                                                        placeholder=" M5V 2T6"
                                                        maxLength={6}
                                                        // pattern="/^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i"
                                                        {...field}
                                                        disabled={isSubmitting}
                                                        // className={isAuthenticated ? "border-blue-200 bg-blue-50/30" : ""}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    </div>

                            </CardContent>
                        </Card>

                        {/* Only show account creation for non-authenticated users */}
                        {!isAuthenticated && (
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
                                                Create an account to easily manage your reservations
                                                and
                                                receive special offers
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Only show password field for account creation and non-authenticated users */}
                        {!isAuthenticated && createAccount && (
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