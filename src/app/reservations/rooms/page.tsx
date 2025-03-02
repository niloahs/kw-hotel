'use client';

import { useSearchParams } from 'next/navigation';
import RoomList from '@/components/booking/RoomList';
import Navigation from '@/components/Navigation';

export default function AvailableRoomsPage() {
    const searchParams = useSearchParams();

    // Check if we have search parameters, if not redirect to main booking page
    const hasParams = searchParams.has('checkIn') &&
        searchParams.has('checkOut') &&
        searchParams.has('guests');

    return (
        <>
            <Navigation />
            <div className="container mx-auto py-24 px-4">
                <h1 className="text-4xl font-display text-center mb-12">Available Rooms</h1>

                {hasParams ? (
                    <RoomList />
                ) : (
                    <div className="text-center">
                        <p>Please specify your search criteria</p>
                        <a href="/reservations" className="text-blue-600 hover:underline">
                            Return to booking
                        </a>
                    </div>
                )}
            </div>
        </>
    );
}