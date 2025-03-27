'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModificationRequest, modificationSchema } from "@/lib/validation-schemas";
import { Reservation } from '@/types';
import Navigation from '@/components/Navigation';
import { useToast } from "@/hooks/use-toast";

export default function ModifyReservationPage() {
    const params = useParams();
    const router = useRouter();
    const reservationId = params.id;
    const {toast} = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [reservation, setReservation] = useState<Reservation | null>(null);

    const form = useForm<ModificationRequest>({
        resolver: zodResolver(modificationSchema),
        defaultValues: {
            requestType: 'DateChange',
        }
    });

    const requestType = form.watch('requestType');

    // Fetch reservation details
    useEffect(() => {
        const fetchReservation = async () => {
            try {
                const response = await axios.get(`/api/reservations/${reservationId}`);
                setReservation(response.data);
            } catch (err) {
                console.error('Error fetching reservation:', err);
                setError('Failed to load reservation details');
            } finally {
                setIsLoading(false);
            }
        };

        if (reservationId) {
            fetchReservation();
        }
    }, [reservationId]);

    const onSubmit = async (data: ModificationRequest) => {
        setIsSubmitting(true);
        setError('');

        try {
            await axios.post('/api/reservations/modification-request', {
                reservationId: Number(reservationId),
                ...data,
                checkInDate: data.checkInDate ? format(data.checkInDate, 'yyyy-MM-dd') : undefined,
                checkOutDate: data.checkOutDate ? format(data.checkOutDate, 'yyyy-MM-dd') : undefined
            });

            // Show success toast
            toast({
                title: "Request Submitted",
                description: "Your request has been submitted successfully. We'll review it and get back to you soon.",
                variant: "default",
            });

            router.push('/account?tab=reservations');

        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Failed to submit request');
            } else {
                setError('An unexpected error occurred');
            }
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Navigation />
            <div className="container py-24 px-4 max-w-2xl mx-auto">
                <h1 className="text-4xl font-display text-center mb-4">Request Reservation
                                                                       Change</h1>
                <p className="text-center mb-12 text-gray-600">
                    Submit a request to modify your reservation. Staff will review your request and
                    get back to you.
                </p>

                {isLoading ? (
                    <div className="text-center">Loading reservation details...</div>
                ) : !reservation ? (
                    <div className="text-center">
                        <Alert variant="destructive">
                            <AlertDescription>{error || 'Reservation not found'}</AlertDescription>
                        </Alert>
                        <Button className="mt-4"
                                onClick={() => router.push('/account?tab=reservations')}>
                            Return to My Reservations
                        </Button>
                    </div>
                ) : (
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <div className="mb-6 border-b pb-4">
                            <h2 className="font-semibold text-xl">Reservation Details</h2>
                            <p className="mt-2">
                                {reservation.roomType} - Room {reservation.roomNumber}
                            </p>
                            <p className="text-gray-600">
                                {format(new Date(reservation.checkInDate), "MMMM d, yyyy")} to {format(new Date(reservation.checkOutDate), "MMMM d, yyyy")}
                            </p>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="requestType"
                                    render={({field}) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>What would you like to change?</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="flex flex-col space-y-1"
                                                >
                                                    <FormItem
                                                        className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="DateChange" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            Change Dates
                                                        </FormLabel>
                                                    </FormItem>
                                                    <FormItem
                                                        className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="Cancellation" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            Cancel Reservation
                                                        </FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {requestType === 'DateChange' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="checkInDate"
                                            render={({field}) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>New Check-in Date</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant="outline"
                                                                    className={cn(
                                                                        "w-full pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "PPP")
                                                                    ) : (
                                                                        <span>Pick a date</span>
                                                                    )}
                                                                    <CalendarIcon
                                                                        className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0"
                                                                        align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                disabled={(date) => date < new Date()}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="checkOutDate"
                                            render={({field}) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>New Check-out Date</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant="outline"
                                                                    className={cn(
                                                                        "w-full pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "PPP")
                                                                    ) : (
                                                                        <span>Pick a date</span>
                                                                    )}
                                                                    <CalendarIcon
                                                                        className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0"
                                                                        align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                disabled={(date) => {
                                                                    const checkIn = form.getValues('checkInDate');
                                                                    return checkIn ? date <= checkIn : date < new Date();
                                                                }}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="flex justify-end space-x-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.push('/account?tab=reservations')}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                )}
            </div>
        </>
    );
}