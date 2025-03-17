'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Reservation } from '@/types';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';

interface ReservationCardProps {
    reservation: Reservation;
    showModifyButton?: boolean;
    showFavoriteButton?: boolean;
}

export default function ReservationCard({
                                            reservation,
                                            showModifyButton = false,
                                            showFavoriteButton = false,
                                        }: ReservationCardProps) {
    const router = useRouter();
    const [isFavorite, setIsFavorite] = useState(false);
    const [roomTypeId, setRoomTypeId] = useState<number | null>(null);

    // Get room type ID from roomId if we need favorites functionality
    useEffect(() => {
        if (showFavoriteButton && reservation.roomId) {
            const fetchRoomTypeId = async () => {
                try {
                    // Fetch room type ID using roomId
                    const response = await axios.get(`/api/rooms/${reservation.roomId}`);
                    if (response.data && response.data.room_type_id) {
                        setRoomTypeId(response.data.room_type_id);
                    }
                } catch (err) {
                    console.error('Failed to fetch room type ID', err);
                }
            };

            fetchRoomTypeId();
        }
    }, [reservation.roomId, showFavoriteButton]);

    // Check if this room type is a favorite
    useEffect(() => {
        if (roomTypeId && showFavoriteButton) {
            const checkFavoriteStatus = async () => {
                try {
                    const response = await axios.get(`/api/preferences?roomTypeId=${roomTypeId}`);
                    setIsFavorite(response.data.isFavorite);
                } catch (err) {
                    console.error('Failed to check preference status', err);
                }
            };

            checkFavoriteStatus();
        }
    }, [roomTypeId, showFavoriteButton]);

    // Toggle favorite status
    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!roomTypeId) return;

        try {
            if (isFavorite) {
                await axios.delete(`/api/preferences?roomTypeId=${roomTypeId}`);
            } else {
                await axios.post('/api/preferences', {
                    roomTypeId: roomTypeId
                });
            }
            setIsFavorite(!isFavorite);
        } catch (err) {
            console.error('Failed to update preference', err);
        }
    };

    // Get status label
    const getStatusLabel = () => {
        const today = new Date().toISOString().split('T')[0];

        if (reservation.status === 'Cancelled') return 'Cancelled';
        if (reservation.checkOutDate < today) return 'Completed';
        if (reservation.checkInDate <= today && reservation.checkOutDate >= today) return 'Active';
        return 'Upcoming';
    };

    // Get status color
    const getStatusColor = () => {
        const today = new Date().toISOString().split('T')[0];

        if (reservation.status === 'Cancelled') {
            return 'bg-red-50 text-red-700 border-red-200';
        } else if (reservation.checkOutDate < today) {
            return 'bg-gray-50 text-gray-700 border-gray-200'; // Completed
        } else if (reservation.checkInDate <= today) {
            return 'bg-blue-50 text-blue-700 border-blue-200'; // Active
        } else {
            return 'bg-green-50 text-green-700 border-green-200'; // Upcoming
        }
    };

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{reservation.roomType} -
                                                                                 Room {reservation.roomNumber}</h3>

                            {showFavoriteButton && roomTypeId && (
                                <button
                                    onClick={toggleFavorite}
                                    className="text-yellow-400 hover:text-yellow-500"
                                    title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                                >
                                    {isFavorite ? (
                                        <Star className="w-5 h-5 fill-current" />
                                    ) : (
                                        <Star className="w-5 h-5" />
                                    )}
                                </button>
                            )}
                        </div>

                        <p className="text-gray-500 text-sm">
                            {formatDate(reservation.checkInDate)} — {formatDate(reservation.checkOutDate)}
                        </p>

                        <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                            <div>
                                <p className="text-gray-500">Confirmation</p>
                                <p>#{reservation.confirmationCode}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Amount</p>
                                <p>{formatCurrency(reservation.totalAmount)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Status</p>
                                <Badge variant="outline" className={getStatusColor()}>
                                    {getStatusLabel()}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {showModifyButton && (
                    <div className="mt-4 pt-4 border-t">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/reservations/modify/${reservation.reservationId}`)}
                        >
                            Request Changes
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}