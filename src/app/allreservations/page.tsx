'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import { UserReservation } from '@/types';
import { format } from 'date-fns';

export default function AllReservationsPage() {
    const { isAuthenticated, isStaff } = useAuth();
    const [reservations, setReservations] = useState<UserReservation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            setError('Unauthorized access. Please log in.');
            router.push('/');
            return;
        }

        if (!isStaff) {
            setError('Access denied. Staff only.');
            router.push('/account');
            return;
        }

        const fetchReservations = async () => {
            try {
                const response = await axios.get('/api/reservations/all');
                console.log('Fetched reservations:', response.data); // Debugging statement
                setReservations(response.data);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    setError(error.response?.data?.message || 'An error occurred while retrieving all the reservations');
                } else {
                    setError('An unexpected error occurred while retrieving all the reservations');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, [isAuthenticated, isStaff, router]);

    const confirmReservation = async (reservationId: number) => {
        try {
            const response = await axios.post('/api/reservations/confirm', { reservationId });
            console.log('Confirmed reservation:', response.data); // Debugging statement
            // Optionally, refetch reservations to update the list
            const updatedReservations = await axios.get('/api/reservations/all');
            setReservations(updatedReservations.data);
        } catch (error) {
            console.error('Error confirming reservation:', error);
            setError('An error occurred while confirming the reservation');
        }
    };

    console.log('All reservations:', reservations); // Debugging statement

    const pendingReservations = reservations.filter((reservation: UserReservation) => reservation.requestStatus === 'Pending');
    const confirmedReservations = reservations.filter((reservation: UserReservation) => reservation.requestStatus === 'Completed');

    console.log('Pending reservations:', pendingReservations); // Debugging statement
    console.log('Confirmed reservations:', confirmedReservations); // Debugging statement

    return (
        <div className="container mx-auto py-24 px-4">
            <h1 className="text-4xl font-display text-center mb-12">All Reservations</h1>
            {loading ? (
                <p>Loading reservations...</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <Tabs defaultValue="all">
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {reservations.map((reservation: UserReservation) => (
                                <Card key={reservation.reservationId}>
                                    <CardHeader>
                                        <CardTitle>{reservation.guestName}</CardTitle>
                                        <CardDescription>
                                            Room: {reservation.roomNumber} - {reservation.roomType}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p>Status: {reservation.requestStatus}</p>
                                        <p>Check-in: {format(new Date(reservation.checkInDate), 'PPP')}</p>
                                        <p>Check-out: {format(new Date(reservation.checkOutDate), 'PPP')}</p>
                                        <p>Total Amount: ${reservation.totalAmount}</p>
                                        {reservation.requestStatus === 'Pending' && (
                                            <button
                                                onClick={() => confirmReservation(reservation.reservationId)}
                                                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                                            >
                                                Confirm Reservation
                                            </button>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="confirmed">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {confirmedReservations.map((reservation: UserReservation) => (
                                <Card key={reservation.reservationId}>
                                    <CardHeader>
                                        <CardTitle>{reservation.guestName}</CardTitle>
                                        <CardDescription>
                                            Room: {reservation.roomNumber} - {reservation.roomType}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p>Status: {reservation.requestStatus}</p>
                                        <p>Check-in: {format(new Date(reservation.checkInDate), 'PPP')}</p>
                                        <p>Check-out: {format(new Date(reservation.checkOutDate), 'PPP')}</p>
                                        <p>Total Amount: ${reservation.totalAmount}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="pending">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pendingReservations.map((reservation: UserReservation) => (
                                <Card key={reservation.reservationId}>
                                    <CardHeader>
                                        <CardTitle>{reservation.guestName}</CardTitle>
                                        <CardDescription>
                                            Room: {reservation.roomNumber} - {reservation.roomType}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p>Status: {reservation.requestStatus}</p>
                                        <p>Check-in: {format(new Date(reservation.checkInDate), 'PPP')}</p>
                                        <p>Check-out: {format(new Date(reservation.checkOutDate), 'PPP')}</p>
                                        <p>Total Amount: ${reservation.totalAmount}</p>
                                        <button
                                            onClick={() => confirmReservation(reservation.reservationId)}
                                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                                        >
                                            Confirm Reservation
                                        </button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}