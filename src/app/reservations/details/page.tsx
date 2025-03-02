'use client';

import { useSearchParams } from 'next/navigation';
import GuestDetailsForm from '@/components/booking/GuestDetailsForm';
import Navigation from '@/components/Navigation';

export default function ReservationDetailsPage() {
    const searchParams = useSearchParams();

    // Check if we have the required parameters
    const hasRequiredParams = searchParams.has('checkIn') &&
        searchParams.has('checkOut') &&
        searchParams.has('roomId');

    return (
        <>
            <Navigation />
            <div className="container mx-auto py-24 px-4">
                <h1 className="text-4xl font-display text-center mb-12">Complete Your Reservation</h1>

                {hasRequiredParams ? (
                    <div className="max-w-xl mx-auto">
                        <GuestDetailsForm />
                    </div>
                ) : (
                    <div className="text-center">
                        <p>Missing required reservation information</p>
                        <a href="/reservations" className="text-blue-600 hover:underline">
                            Return to booking
                        </a>
                    </div>
                )}
            </div>
        </>
    );
}