'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { UserReservation } from '@/types';

export default function AllReservationsPage() {
    const [reservations, setReservations] = useState<UserReservation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState('');
   
    useEffect(() => {
        const fetchReservations = async () => {
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
                setLoading(false)
            }
        };

        fetchReservations();

    }, []);

    return (
        <div className="container mx-auto py-24 px-4">
            <h1 className="text-4xl font-display text-center mb-12">All Reservations</h1>
            {loading ? (
                <p>Loading reservations...</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <ul>
                    {reservations.map(reservation => (
                        <li key={reservation.reservationId}>
                            {reservation.guestName} - {reservation.roomNumber} - {reservation.roomType} - {reservation.status}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
    
}
