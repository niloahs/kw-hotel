'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReservationModal from '@/components/modals/ReservationModal';
import axios from 'axios';
import { UserReservation } from '@/types';
import { format } from 'date-fns';

export default function AllReservationsContent() {
    const [reservations, setReservations] = useState<UserReservation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState('');
    const [selectedReservation, setSelectedReservation] = useState<UserReservation | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const response = await axios.get('/api/reservations/all');
                setReservations(response.data);
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

    const pendingReservations = reservations.filter((reservation) => reservation.requestStatus === 'Pending');
    const confirmedReservations = reservations.filter((reservation) => reservation.requestStatus === 'Approved');

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
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reservations.map((reservation: UserReservation) => (
                            <Card
                                key={reservation.reservationId}
                                className="border shadow-lg rounded-lg overflow-hidden cursor-pointer"
                                onClick={() => openModal(reservation)}
                            >
                                <CardHeader className="bg-gray-100 p-4">
                                    <CardTitle
                                        className="text-lg font-bold text-gray-800">{reservation.guestName}</CardTitle>
                                    <CardDescription className="text-sm text-gray-600">
                                        Room: <span
                                        className="font-medium">{reservation.roomNumber} - {reservation.roomType}</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <div className="mb-2">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-semibold">Status: </span>
                                            {reservation.requestStatus === 'Approved'
                                                ? `${reservation.requestStatus} & ${reservation.status}`
                                                : reservation.requestStatus === 'Pending'
                                                    ? reservation.requestStatus
                                                    : reservation.status}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span
                                                className="font-semibold">Check-in:</span> {format(new Date(reservation.checkInDate), 'PPP')}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span
                                                className="font-semibold">Check-out:</span> {format(new Date(reservation.checkOutDate), 'PPP')}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span
                                                className="font-semibold">Total Amount:</span> ${reservation.totalAmount}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="confirmed">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {confirmedReservations.length > 0 ? (
                            confirmedReservations.map((reservation: UserReservation) => (
                                <Card
                                    key={reservation.reservationId}
                                    className="border shadow-lg rounded-lg overflow-hidden cursor-pointer"
                                    onClick={() => openModal(reservation)}
                                >
                                    <CardHeader className="bg-gray-100 p-4">
                                        <CardTitle
                                            className="text-lg font-bold text-gray-800">{reservation.guestName}</CardTitle>
                                        <CardDescription className="text-sm text-gray-600">
                                            Room: <span
                                            className="font-medium">{reservation.roomNumber} - {reservation.roomType}</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <div className="mb-2">
                                            <p className="text-sm text-gray-600">
                                                <span
                                                    className="font-semibold">Status:</span> {reservation.requestStatus} & {reservation.status}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span
                                                    className="font-semibold">Check-in:</span> {format(new Date(reservation.checkInDate), 'PPP')}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span
                                                    className="font-semibold">Check-out:</span> {format(new Date(reservation.checkOutDate), 'PPP')}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span
                                                    className="font-semibold">Total Amount:</span> ${reservation.totalAmount}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                No confirmed reservations found.
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="pending">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingReservations.length > 0 ? (
                            pendingReservations.map((reservation: UserReservation) => (
                                <Card
                                    key={reservation.reservationId}
                                    className="border shadow-lg rounded-lg overflow-hidden cursor-pointer"
                                    onClick={() => openModal(reservation)}
                                >
                                    <CardHeader className="bg-gray-100 p-4">
                                        <CardTitle
                                            className="text-lg font-bold text-gray-800">{reservation.guestName}</CardTitle>
                                        <CardDescription className="text-sm text-gray-600">
                                            Room: <span
                                            className="font-medium">{reservation.roomNumber} - {reservation.roomType}</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <div className="mb-2">
                                            <p className="text-sm text-gray-600">
                                                <span
                                                    className="font-semibold">Status:</span> {reservation.requestStatus}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span
                                                    className="font-semibold">Check-in:</span> {format(new Date(reservation.checkInDate), 'PPP')}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span
                                                    className="font-semibold">Check-out:</span> {format(new Date(reservation.checkOutDate), 'PPP')}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span
                                                    className="font-semibold">Total Amount:</span> ${reservation.totalAmount}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                No pending reservations found.
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Reservation Modal */}
            <ReservationModal
                isOpen={isModalOpen}
                onClose={closeModal}
                reservation={selectedReservation}
            />
        </div>
    );
}