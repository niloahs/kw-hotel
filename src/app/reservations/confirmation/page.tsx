'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Reservation } from "@/types";
import AuthModal from '@/components/modals/AuthModal';
import { ClipboardCopy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ConfirmationPage() {
    const {isAuthenticated} = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const reservationId = searchParams.get('id');
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [totalServiceCharge, setTotalServiceCharge] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);

    // Show auth modal if not authenticated and we have a reservation that isn't claimed
    useEffect(() => {
        if (reservation && !isAuthenticated && reservation.confirmationCode && !reservation.isClaimed) {
            // Optional: Show auth modal after a delay to give user time to read the confirmation
            const timer = setTimeout(() => {
                setIsAuthModalOpen(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [reservation, isAuthenticated]);

    useEffect(() => {
        if (reservationId) {
            fetchReservation();
            fetchServiceCharge();
        } else {
            setError('No reservation ID provided');
            setLoading(false);
        }

        async function fetchReservation() {
            try {
                const response = await axios.get(`/api/reservations/${reservationId}`);
                setReservation(response.data);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    setError(error.response?.data?.message || 'Failed to load reservation details');
                } else {
                    setError('An unexpected error occurred while loading your reservation');
                }
            } finally {
                setLoading(false);
            }
        }

        async function fetchServiceCharge() {
            try {
                const response = await axios.get(`/api/charge-amount/${reservationId}`);
                setTotalServiceCharge(parseFloat(response.data.totalCharge));
            } catch (error) {
                console.error("Failed to fetch service charge:", error);
            }
        }
    }, [reservationId]);

    const copyToClipboard = () => {
        if (!reservation?.confirmationCode) return;

        navigator.clipboard.writeText(reservation.confirmationCode)
            .then(() => {
                setCodeCopied(true);
                setTimeout(() => setCodeCopied(false), 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    };

    const navigateToHomepage = () => {
        router.push('/');
    };

    const navigateToAccount = () => {
        router.push('/account?tab=reservations');
    };

    if (loading) {
        return (
            <>
                <Navigation />
                <div className="container mx-auto py-24 px-4 text-center">
                    <h1 className="text-4xl font-display mb-8">Loading Confirmation...</h1>
                </div>
            </>
        );
    }

    if (error || !reservation) {
        return (
            <>
                <Navigation />
                <div className="container mx-auto py-24 px-4 text-center">
                    <h1 className="text-4xl font-display mb-8">Reservation Confirmation</h1>
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-red-500 mb-4">{error || 'Reservation not found'}</p>
                            <Button onClick={navigateToHomepage}>
                                Return to Home
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    const totalAmountWithCharge = Number(reservation.totalAmount) + (totalServiceCharge ?? 0);

    return (
        <>
            <Navigation />
            <div className="container mx-auto py-24 px-4">
                <h1 className="text-4xl font-display text-center mb-8">Reservation Confirmed!</h1>
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Booking Confirmation #{reservationId}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-green-600 font-bold">Your reservation is confirmed!
                            </p>

                            <div className="border-t border-b py-4 my-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-500">Check-in</p>
                                        <p className="font-semibold">{formatDate(reservation.checkInDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Check-out</p>
                                        <p className="font-semibold">{formatDate(reservation.checkOutDate)}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-gray-500">Room</p>
                                <p className="font-semibold">{reservation.roomType} -
                                    Room {reservation.roomNumber}</p>
                            </div>

                            <div className="border-t border-b py-4 my-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-500">Room Price</p>
                                        <p className="font-semibold">{formatCurrency(reservation.totalAmount - (totalServiceCharge ?? 0))}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Service Charges</p>
                                        <p className="font-semibold">{formatCurrency(Number(totalServiceCharge ?? 0))}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-gray-500">Total Amount</p>
                                <p className="font-semibold">{formatCurrency(totalAmountWithCharge - (totalServiceCharge ?? 0))}</p>
                            </div>

                            {/* Reservation Code Section */}
                            {reservation.confirmationCode && !reservation.isClaimed ? (
                                <div className="border-t pt-4 mt-6">
                                    <div className="bg-blue-50 p-4 rounded-md">
                                        <h3 className="font-semibold text-blue-800 mb-2">Confirmation
                                                                                         Code</h3>
                                        <p className="mb-2">Please save your confirmation code to
                                                            access your reservation later:
                                        </p>
                                        <div className="relative">
                                            <div
                                                className="font-mono bg-white p-3 border rounded text-center text-lg mb-2">
                                                {reservation.confirmationCode}
                                            </div>
                                            <Button
                                                size="default"
                                                variant="ghost"
                                                className="absolute right-2 top-2 p-2 h-auto"
                                                onClick={copyToClipboard}
                                            >
                                                <ClipboardCopy size={16} />
                                            </Button>
                                            {codeCopied && (
                                                <p className="text-green-600 text-sm text-center">Code
                                                                                                  copied!</p>
                                            )}
                                        </div>
                                        {!isAuthenticated && (
                                            <div className="mt-4 text-blue-700">
                                                <Button
                                                    variant="outline"
                                                    className="w-full"
                                                    onClick={() => setIsAuthModalOpen(true)}
                                                >
                                                    Create an account to manage this reservation
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="border-t pt-4 mt-6">
                                    <div className="bg-green-50 p-4 rounded-md">
                                        <h3 className="font-semibold text-green-800 mb-2">Reservation
                                                                                          Saved</h3>
                                        <p>Your reservation has been linked to your account. You can
                                           view and manage your reservations from your account page.
                                        </p>
                                        {isAuthenticated && (
                                            <Button
                                                variant="outline"
                                                className="w-full mt-4"
                                                onClick={navigateToAccount}
                                            >
                                                Go to My Reservations
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            <Button className="w-full mt-6" onClick={navigateToHomepage}>
                                Return to Homepage
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Auth Modal for account creation */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onOpenChangeAction={setIsAuthModalOpen}
                onSuccess={() => setIsAuthModalOpen(false)}
                initialView="register"
                reservationId={reservation?.reservationId}
            />
        </>
    );
}