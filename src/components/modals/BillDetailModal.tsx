'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import axios from 'axios';
import { Separator } from '@/components/ui/separator';
import { BillDetail } from '@/types';

interface BillDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservationId: number;
}

export default function BillDetailModal({isOpen, onClose, reservationId}: BillDetailModalProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [billDetail, setBillDetail] = useState<BillDetail | null>(null);

    useEffect(() => {
        if (isOpen && reservationId) {
            fetchBillDetail();
        }
    }, [isOpen, reservationId]);

    const fetchBillDetail = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/bills/${reservationId}`);
            setBillDetail(response.data);
            setError('');
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Failed to load bill details');
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Loading bill details...</DialogTitle>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        );
    }

    if (error || !billDetail) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-red-500">Error</DialogTitle>
                    </DialogHeader>
                    <p>{error || 'Failed to load bill details'}</p>
                </DialogContent>
            </Dialog>
        );
    }

    const {
        reservation,
        nights,
        nightlyRate,
        roomTotal,
        serviceCharges,
        serviceChargeTotal,
        billTotal
    } = billDetail;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl print:shadow-none print:border-none"
                           id="bill-print-area">
                <DialogHeader className="flex flex-row justify-between items-center print:pb-2">
                    <DialogTitle className="text-2xl font-display">Bill Details</DialogTitle>
                </DialogHeader>

                <div className="mt-6 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between">
                        <div>
                            <h3 className="font-semibold text-lg">King William Hotel</h3>
                            <p className="text-gray-500">123 Royal Road, Ontario</p>
                            <p className="text-gray-500">Canada</p>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold">Invoice #{reservation.reservationId}</p>
                            <p className="text-gray-500">Date: {formatDate(new Date().toISOString())}</p>
                            <p className="text-gray-500">Confirmation: {reservation.confirmationCode}</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Guest & Stay Details */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-semibold text-sm text-gray-500 mb-1">GUEST</h4>
                            <p>{reservation.guestName}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-500 mb-1">STAY
                                                                                     DETAILS</h4>
                            <p>
                                {formatDate(reservation.checkInDate)} to {formatDate(reservation.checkOutDate)}
                            </p>
                            <p>
                                {reservation.roomType} - Room {reservation.roomNumber}
                            </p>
                            <p>
                                {nights} {nights === 1 ? 'Night' : 'Nights'}
                            </p>

                        </div>
                    </div>

                    <Separator />

                    {/* Charges */}
                    <div>
                        <h4 className="font-semibold text-sm text-gray-500 mb-3">CHARGES</h4>

                        <div className="space-y-4">
                            {/* Room charge */}
                            <div className="bg-gray-50 p-4 rounded-md">
                                <div className="flex justify-between mb-2">
                                    <h5 className="font-semibold">Room Charges</h5>
                                    <p className="font-semibold">{formatCurrency(roomTotal)}</p>
                                </div>
                                <div className="pl-4 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <p>
                                            {nights} nights x {formatCurrency(nightlyRate)}
                                        </p>
                                        <p>{formatCurrency(roomTotal)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Service charges */}
                            {serviceCharges.length > 0 && (
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <div className="flex justify-between mb-2">
                                        <h5 className="font-semibold">Service Charges</h5>
                                        <p className="font-semibold">{formatCurrency(serviceChargeTotal)}</p>
                                    </div>
                                    <div className="pl-4 text-sm space-y-2">
                                        {serviceCharges.map((charge) => (
                                            <div key={charge.serviceChargeId}
                                                 className="flex justify-between text-gray-600">
                                                <p>
                                                    {charge.serviceName}
                                                    {charge.quantity > 1 ? ` (x${charge.quantity})` : ''}
                                                    {' - '}{formatDate(charge.chargeDate)}
                                                </p>
                                                <p>{formatCurrency(charge.chargedAmount)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="bg-gray-100 p-4 rounded-md">
                        <div className="flex justify-between">
                            <h4 className="font-semibold text-lg">Total</h4>
                            <p className="font-semibold text-lg">{formatCurrency(billTotal)}</p>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mt-1">
                            <p>Payment Status</p>
                            <p>{reservation.paymentStatus}</p>
                        </div>
                    </div>

                    <div className="text-center text-gray-500 text-sm">
                        <p>Thank you for choosing King William Hotel!</p>
                        <p>For any inquiries, please contact us at
                           reservations@kingwilliamhotel.ca
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}