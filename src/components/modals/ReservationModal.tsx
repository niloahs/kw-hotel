'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserReservation } from '@/types';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservation: UserReservation | null;
    onApproveReject?: () => void;
}

export default function ReservationModal({
                                             isOpen,
                                             onClose,
                                             reservation,
                                             onApproveReject
                                         }: ReservationModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const {toast} = useToast();
    const {isStaff} = useAuth();

    if (!reservation) return null;

    const isPending = reservation.requestStatus === 'Pending';

    const handleApprove = async () => {
        if (!reservation) return;
        setIsLoading(true);

        try {
            await axios.post('/api/reservations/confirm', {
                reservationId: reservation.reservationId
            });

            toast({
                title: "Request Approved",
                description: "The reservation has been updated successfully.",
                variant: "default",
            });

            onClose();
            if (onApproveReject) onApproveReject();
        } catch (error) {
            console.error('Error approving request:', error);
            toast({
                title: "Error",
                description: "Failed to approve the request. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async () => {
        if (!reservation) return;
        setIsLoading(true);

        try {
            await axios.post('/api/reservations/reject', {
                reservationId: reservation.reservationId
            });

            toast({
                title: "Request Rejected",
                description: "The reservation change request has been rejected.",
                variant: "default",
            });

            onClose();
            if (onApproveReject) onApproveReject();
        } catch (error) {
            console.error('Error rejecting request:', error);
            toast({
                title: "Error",
                description: "Failed to reject the request. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Get status badge style
    const getStatusBadgeClass = () => {
        if (isPending) return "bg-amber-100 text-amber-800 hover:bg-amber-100 hover:text-amber-800";
        if (reservation.status === 'Upcoming') return "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800";
        if (reservation.status === 'Cancelled') return "bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800";
        if (reservation.status === 'Active') return "bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800";
        return "bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800";
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0">
                <DialogHeader className="p-6 border-b">
                    <DialogTitle className="text-center font-display text-3xl">
                        Reservation Details
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6">
                    {/* Status badge - with hover effect explicitly disabled */}
                    <div className="flex justify-center mb-6">
                        <div
                            className={`${getStatusBadgeClass()} px-6 py-1.5 text-sm font-medium rounded-full inline-flex items-center`}
                        >
                            {reservation.requestStatus === 'Approved'
                                ? `${reservation.requestStatus} & ${reservation.status}`
                                : reservation.requestStatus === 'Pending'
                                    ? `Pending ${reservation.changeType === 'DateChange' ? 'Date Change' : 'Cancellation'}`
                                    : reservation.status}
                        </div>
                    </div>

                    {/* Clean information list */}
                    <div className="rounded-lg border overflow-hidden">
                        <div className="divide-y">
                            <div className="flex justify-between py-4 px-5">
                                <span className="text-gray-700">Guest Name</span>
                                <span className="font-medium">{reservation.guestName}</span>
                            </div>

                            <div className="flex justify-between py-4 px-5">
                                <span className="text-gray-700">Room</span>
                                <span
                                    className="font-medium">{reservation.roomNumber} - {reservation.roomType}</span>
                            </div>

                            <div className="flex justify-between py-4 px-5">
                                <span className="text-gray-700">Check-in</span>
                                <span
                                    className="font-medium">{format(new Date(reservation.checkInDate), 'MMM d, yyyy')}</span>
                            </div>

                            <div className="flex justify-between py-4 px-5">
                                <span className="text-gray-700">Check-out</span>
                                <span
                                    className="font-medium">{format(new Date(reservation.checkOutDate), 'MMM d, yyyy')}</span>
                            </div>

                            <div className="flex justify-between py-4 px-5">
                                <span className="text-gray-700">Total Amount</span>
                                <span
                                    className="font-medium">${typeof reservation.totalAmount === 'number'
                                    ? reservation.totalAmount.toFixed(2)
                                    : parseFloat(String(reservation.totalAmount || 0)).toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between py-4 px-5">
                                <span className="text-gray-700">Payment Status</span>
                                <span className="font-medium">{reservation.paymentStatus}</span>
                            </div>

                            <div className="flex justify-between py-4 px-5">
                                <span className="text-gray-700">Payment Method</span>
                                <span className="font-medium">{reservation.paymentMethod}</span>
                            </div>

                            <div className="flex justify-between py-4 px-5">
                                <span className="text-gray-700">Confirmation Code</span>
                                <span
                                    className="font-medium">{reservation.confirmationCode || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Pending request actions */}
                    {isStaff && isPending && (
                        <div className="mt-6 pt-6 border-t">
                            <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-4">
                                <p className="text-amber-800">
                                    This reservation has a
                                    pending
                                    {reservation.changeType === 'DateChange'
                                        ? ' date change '
                                        : ' cancellation '}
                                    request that requires your review.
                                </p>
                            </div>
                            <div className="flex justify-between gap-4">
                                <Button
                                    variant="outline"
                                    className="w-full py-2"
                                    onClick={handleReject}
                                    disabled={isLoading}
                                >
                                    Reject
                                </Button>
                                <Button
                                    className="w-full py-2"
                                    onClick={handleApprove}
                                    disabled={isLoading}
                                >
                                    Approve
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}