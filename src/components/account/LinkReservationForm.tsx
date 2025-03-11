'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
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

const linkReservationSchema = z.object({
    reservationId: z.string().min(1, 'Reservation code is required'),
    email: z.string().email('Please enter a valid email')
});

type LinkReservationFormData = z.infer<typeof linkReservationSchema>;

interface LinkReservationFormProps {
    onSuccess?: () => void;
}

export default function LinkReservationForm({onSuccess}: LinkReservationFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const form = useForm<LinkReservationFormData>({
        resolver: zodResolver(linkReservationSchema),
        defaultValues: {
            reservationId: '',
            email: ''
        }
    });

    const onSubmit = async (data: LinkReservationFormData) => {
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post('/api/reservations/link', data);
            setSuccess(response.data.message);
            onSuccess?.();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Failed to link reservation');
            } else {
                setError('An unexpected error occurred');
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
                    name="reservationId"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Reservation Code</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter your reservation code"
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
                    name="email"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter the email used for reservation"
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

                {success && (
                    <Alert variant="default"
                           className="bg-green-50 text-green-800 border-green-200">
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? 'Linking...' : 'Link Reservation'}
                </Button>
            </form>
        </Form>
    );
}