'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LinkReservationForm from '@/components/account/LinkReservationForm';

export default function AccountPage() {
    const {isAuthenticated, isLoading} = useAuth();
    const router = useRouter();

    // Protect the page
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return <div className="container py-24">Loading account information...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="container mx-auto py-24 px-4">
            <h1 className="text-4xl font-display text-center mb-12">My Account</h1>

            <div className="max-w-3xl mx-auto">
                <Tabs defaultValue="reservations">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="reservations">My Reservations</TabsTrigger>
                        <TabsTrigger value="link">Link Reservation</TabsTrigger>
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
                                {/* TODO: Reservation List */}
                                <p>Reservation List</p>
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