'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { UserReservation } from '@/types';
import { format } from 'date-fns';
import { User } from '@/lib/auth';

export default function AllReservationsPage() {
    const [reservations, setReservations] = useState<UserReservation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState('');
    const router = useRouter();
   
    useEffect(() => {
        const checkUserRole = async () => {
            try {
                const userResponse = await axios.get('/api/auth/me');
                if (!userResponse.data.user || userResponse.data.user.role !== 'staff') {
                    router.push('/');
                } else {
                    fetchReservations(userResponse.data.user);
                }
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    setError('Unauthorized access. Please log in.');
                    router.push('/');
                }else {
                    setError('An unexpected error occurred while retrieving all the reservations');
                }
                setLoading(false);
            }
        };

        const fetchReservations = async (user : User) => {
            try {
                const response = await axios.get('/api/reservations/all');
                setReservations(response.data);
            } catch(error){
                if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || 'An error occurred while retrieving all the reservations') ; 
            } else {
                setError('An unexpected error occurred while retrieving all the reservations')
                }
            } finally {
                setLoading(false);
            }
        };
        checkUserRole();

    }, [router]);

    return (
        <div className="container mx-auto py-24 px-4">
            <h1 className="text-4xl font-display text-center mb-12">All Reservations</h1>
            {loading ? (
                <p>Loading reservations...</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reservations.map(reservation => (
                        <Card key={reservation.reservationId}>
                            <CardHeader>
                                <CardTitle>{reservation.guestName}</CardTitle>
                                <CardDescription>
                                    Room: {reservation.roomNumber} - {reservation.roomType}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>Status: {reservation.status}</p>
                                <p>Check-in: {format(new Date(reservation.checkInDate), 'PPP')}</p>
                                <p>Check-out: {format(new Date(reservation.checkOutDate), 'PPP')}</p>
                                <p>Total Amount: ${reservation.totalAmount}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
    
}
