'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReservationModal from '@/components/modals/ReservationModal';
import axios from 'axios';
import { UserReservation } from '@/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function AllReservationsContent() {
    const [reservations, setReservations] = useState<UserReservation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState('');
    const [selectedReservation, setSelectedReservation] = useState<UserReservation | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchReservations = async () => {
        try {
            setLoading(true);
            await axios.post('/api/reservations/update-reservations/');
            const response = await axios.get('/api/reservations/all');
            setReservations(response.data);
            setError('');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || 'An error occurred while retrieving reservations');
            } else {
                setError('An unexpected error occurred while retrieving reservations');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const openModal = (reservation: UserReservation) => {
        setSelectedReservation(reservation);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedReservation(null);
        setIsModalOpen(false);
    };

    const handleApproveReject = () => {
        // Refresh reservations after approve/reject
        fetchReservations();
    };

    const pendingReservations = reservations.filter((reservation) => reservation.requestStatus === 'Pending');
    const confirmedReservations = reservations.filter((reservation) => reservation.status === 'Active' && reservation.requestStatus !== 'Pending');

    // Reusable reservation card component
    const ReservationCard = ({reservation}: { reservation: UserReservation }) => (
        <Card
            key={reservation.reservationId}
            className="border shadow-lg rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors"
            onClick={() => openModal(reservation)}
        >
            <CardHeader
                className={`p-4 ${reservation.requestStatus === 'Pending' ? 'bg-amber-50' : 'bg-gray-100'}`}>
                <div className="flex justify-between items-start">
                    <CardTitle
                        className="text-lg font-bold text-gray-800">{reservation.guestName}</CardTitle>
                    {reservation.requestStatus === 'Pending' && (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            Pending
                        </Badge>
                    )}
                </div>
                <CardDescription className="text-sm text-gray-600">
                    Room: <span
                    className="font-medium">{reservation.roomNumber} - {reservation.roomType}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
                <div className="mb-2">
                    <p className="text-sm text-gray-600">
                        <span className="font-semibold">Status: </span>
                        {reservation.status}
                        {reservation.requestStatus === 'Pending' && reservation.changeType && (
                            <span className="text-amber-600 ml-1">
                                ({reservation.changeType === 'DateChange' ? 'Date Change' : 'Cancellation'} Request)
                            </span>
                        )}
                    </p>
                    <p className="text-sm text-gray-600">
                        <span
                            className="font-semibold">Check-in:</span> {format(new Date(reservation.checkInDate), 'MMM d, yyyy')}
                    </p>
                    <p className="text-sm text-gray-600">
                        <span
                            className="font-semibold">Check-out:</span> {format(new Date(reservation.checkOutDate), 'MMM d, yyyy')}
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="font-semibold">Total:</span> ${reservation.totalAmount}
                    </p>
                </div>
            </CardContent>
        </Card>
    );

    const ReservationGrid = ({reservations}: { reservations: UserReservation[] }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reservations.length > 0 ? (
                reservations.map((reservation) => (
                    <ReservationCard key={reservation.reservationId} reservation={reservation} />
                ))
            ) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                    No reservations found.
                </div>
            )}
        </div>
    );

    if (loading) {
        return <div className="container mx-auto py-24 px-4">Loading reservations...</div>;
    }

    if (error) {
        return <div className="container mx-auto py-24 px-4">{error}</div>;
    }

    return (
        <div className="container mx-auto py-24 px-4">
            <h1 className="text-4xl font-display text-center mb-12">All Reservations</h1>
            <Tabs defaultValue="all">
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                    <TabsTrigger value="pending">
                        Pending
                        {pendingReservations.length > 0 && (
                            <span
                                className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                                {pendingReservations.length}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                    <ReservationGrid reservations={reservations} />
                </TabsContent>

                <TabsContent value="confirmed">
                    <ReservationGrid reservations={confirmedReservations} />
                </TabsContent>

                <TabsContent value="pending">
                    <ReservationGrid reservations={pendingReservations} />
                </TabsContent>
            </Tabs>

            {/* Reservation Modal */}
            <ReservationModal
                isOpen={isModalOpen}
                onClose={closeModal}
                reservation={selectedReservation}
                onApproveReject={handleApproveReject}
            />
        </div>
    );
}