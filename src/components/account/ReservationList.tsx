'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Reservation } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import ReservationCard from './ReservationCard';

export default function ReservationList() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    const fetchReservations = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/reservations/user');

            // Sort reservations by date (newest check-in first)
            const sortedReservations = response.data.sort((a: Reservation, b: Reservation) => {
                return new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime();
            });

            setReservations(sortedReservations);
        } catch (err) {
            setError('Failed to load your reservations');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    // Group reservations by status and date
    const today = new Date().toISOString().split('T')[0];

    const active = reservations.filter(r =>
        r.status === 'Confirmed' && r.checkOutDate >= today
    );

    const past = reservations.filter(r =>
        r.status === 'Confirmed' && r.checkOutDate < today
    );

    const cancelled = reservations.filter(r =>
        r.status === 'Cancelled'
    );

    if (loading) {
        return <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-md" />)}
        </div>;
    }

    if (error) return <p className="text-red-500">{error}</p>;

    if (reservations.length === 0) {
        return <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You don&#39;t have any reservations yet.</p>
            <Button onClick={() => router.push('/reservations')}>Book Your First Stay</Button>
        </div>;
    }

    return (
        <div className="space-y-8">
            {/* Active Reservations */}
            {active.length > 0 && (
                <>
                    <h3 className="font-medium text-lg border-b pb-2">Active & Upcoming Stays</h3>
                    <div className="space-y-4">
                        {active.map(reservation => (
                            <ReservationCard
                                key={reservation.reservationId}
                                reservation={reservation}
                                showModifyButton={true}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Past Reservations */}
            {past.length > 0 && (
                <>
                    <h3 className="font-medium text-lg border-b pb-2">Past Stays</h3>
                    <div className="space-y-4">
                        {past.map(reservation => (
                            <ReservationCard
                                key={reservation.reservationId}
                                reservation={reservation}
                                showModifyButton={false}
                                showFavoriteButton={true}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Cancelled Reservations */}
            {cancelled.length > 0 && (
                <>
                    <h3 className="font-medium text-lg border-b pb-2">Cancelled Reservations</h3>
                    <div className="space-y-4">
                        {cancelled.map(reservation => (
                            <ReservationCard
                                key={reservation.reservationId}
                                reservation={reservation}
                                showModifyButton={false}
                                showFavoriteButton={false}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}