'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserReservation } from '@/types';
import { format } from 'date-fns';

interface ReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservation: UserReservation | null;
}

export default function ReservationModal({ isOpen, onClose, reservation }: ReservationModalProps) {
    if (!reservation) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-center font-display text-3xl">
                        Reservation Details
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p>
                        <strong>Guest Name:</strong> {reservation.guestName}
                    </p>
                    <p>
                        <strong>Room:</strong> {reservation.roomNumber} - {reservation.roomType}
                    </p>
                    <p>
                        <strong>Status:</strong>{' '}
                        {reservation.requestStatus === 'Approved'
                            ? `${reservation.requestStatus} & ${reservation.status}`
                            : reservation.requestStatus === 'Pending'
                            ? reservation.requestStatus
                            : reservation.status}
                    </p>
                    <p>
                        <strong>Check-in:</strong> {format(new Date(reservation.checkInDate), 'PPP')}
                    </p>
                    <p>
                        <strong>Check-out:</strong> {format(new Date(reservation.checkOutDate), 'PPP')}
                    </p>
                    <p>
                        <strong>Total Amount:</strong> ${reservation.totalAmount}
                    </p>
                    <p>
                        <strong>Payment Status:</strong> {reservation.paymentStatus}
                    </p>
                    <p>
                        <strong>Payment Method:</strong> {reservation.paymentMethod}
                    </p>
                    <p>
                        <strong>Confirmation Code:</strong> {reservation.confirmationCode || 'N/A'}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}