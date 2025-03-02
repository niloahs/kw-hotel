'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Reservation } from "@/types";

export default function ConfirmationPage() {
    const searchParams = useSearchParams();
    const reservationId = searchParams.get('id');
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (reservationId) {
            fetchReservation();
        } else {
            setError('No reservation ID provided');
            setLoading(false);
        }

        async function fetchReservation() {
            try {
                const response = await axios.get(`/api/reservations/${reservationId}`);
                console.log("Reservation data:", response.data); // Add this to inspect the data
                setReservation(response.data);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    setError(error.response?.data?.message || 'Failed to load reservation details');
                }
            } finally {
                setLoading(false);
            }
        }
    }, [reservationId]);

    if (loading) {
        return (
            <>
                <Navigation />
                <div className="container mx-auto py-24 px-4 text-center">
                    <h1 className="text-4xl font-display mb-8">Loading Confirmation...</h1>
                </div>
            </>
        );
    }

    if (error || !reservation) {
        return (
            <>
                <Navigation />
                <div className="container mx-auto py-24 px-4 text-center">
                    <h1 className="text-4xl font-display mb-8">Reservation Confirmation</h1>
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-red-500 mb-4">{error || 'Reservation not found'}</p>
                            <Button onClick={() => window.location.href = '/'}>
                                Return to Home
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    return (
        <>
            <Navigation />
            <div className="container mx-auto py-24 px-4">
                <h1 className="text-4xl font-display text-center mb-8">Reservation Confirmed!</h1>
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Booking Confirmation #{reservationId}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-green-600 font-bold">Your reservation is confirmed!
                            </p>

                            <div className="border-t border-b py-4 my-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-500">Check-in</p>
                                        <p className="font-semibold">{formatDate(reservation.checkInDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Check-out</p>
                                        <p className="font-semibold">{formatDate(reservation.checkOutDate)}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-gray-500">Room</p>
                                <p className="font-semibold">{reservation.roomType} -
                                                                                    Room {reservation.roomNumber}</p>
                            </div>

                            <div>
                                <p className="text-gray-500">Total Amount</p>
                                <p className="font-semibold">{formatCurrency(reservation.totalAmount)}</p>
                            </div>

                            <Button className="w-full mt-6"
                                    onClick={() => window.location.href = '/'}>
                                Return to Homepage
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}