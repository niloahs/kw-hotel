'use client';

import BookingForm from '@/components/booking/BookingForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReservationsPage() {
    return (
        <div className="container mx-auto py-24 px-4">
            <h1 className="text-4xl font-display text-center mb-12">Book Your Stay</h1>

            <div className="max-w-lg mx-auto">
                <BookingForm />
            </div>

            <div className="mt-16">
                <h2 className="text-2xl font-display text-center mb-8">Why Book Directly With Us?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Best Rate Guarantee</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>We guarantee the lowest rates when you book directly through our website.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Flexible Cancellation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Plans change. Enjoy our flexible cancellation policy when you book direct.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Personalized Service</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Direct booking allows us to better understand and serve your unique needs.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}