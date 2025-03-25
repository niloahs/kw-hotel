'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LinkReservationForm from '@/components/account/LinkReservationForm';
import ReservationList from '@/components/account/ReservationList';

export default function AccountContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab') || 'reservations';

    return (
        <div className="container mx-auto py-24 px-4">
            <h1 className="text-4xl font-display text-center mb-12">My Account</h1>

            <div className="max-w-3xl mx-auto">
                <Tabs defaultValue={tab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger
                            value="reservations"
                            onClick={() => router.push('/account?tab=reservations')}
                        >
                            My Reservations
                        </TabsTrigger>
                        <TabsTrigger
                            value="link"
                            onClick={() => router.push('/account?tab=link')}
                        >
                            Link Reservation
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="reservations">
                        <Card>
                            <CardHeader>
                                <CardTitle>My Reservations</CardTitle>
                                <CardDescription>
                                    View and manage your upcoming and past stays
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ReservationList />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="link">
                        <Card>
                            <CardHeader>
                                <CardTitle>Link Existing Reservation</CardTitle>
                                <CardDescription>
                                    Connect a reservation you made without an account
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <LinkReservationForm
                                    onSuccess={() => router.push('/account?tab=reservations')}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}