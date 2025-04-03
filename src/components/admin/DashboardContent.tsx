'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/utils';

interface DashboardData {
    occupancy: {
        occupiedRooms: number;
        totalRooms: number;
        occupancyRate: number;
    };
    roomTypePopularity: Array<{
        typeName: string;
        bookings: number;
    }>;
    servicePopularity: Array<{
        serviceName: string;
        usageCount: number;
        totalRevenue: number;
    }>;
    revenueByMonth: Array<{
        month: string;
        revenue: number;
    }>;
}

export default function DashboardContent() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/analytics/dashboard');
                setDashboardData(response.data);
                setError('');
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.message || 'Failed to load dashboard data');
                } else {
                    setError('An unexpected error occurred');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="text-center py-8">Loading dashboard data...</div>;
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (!dashboardData) {
        return <div className="text-center py-8">No dashboard data available</div>;
    }

    return (
        <div className="space-y-8">
            {/* Occupancy Card */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle>Current Occupancy</CardTitle>
                    <CardDescription>Today&#39;s room occupancy statistics</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Occupied Rooms</p>
                            <p className="text-3xl font-bold">{dashboardData.occupancy.occupiedRooms}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Available Rooms</p>
                            <p className="text-3xl font-bold">
                                {dashboardData.occupancy.totalRooms - dashboardData.occupancy.occupiedRooms}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Occupancy Rate</p>
                            <p className="text-3xl font-bold">{dashboardData.occupancy.occupancyRate}%</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="roomTypes">
                <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="roomTypes">Room Types</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                </TabsList>

                {/* Room Types Tab */}
                <TabsContent value="roomTypes">
                    <Card>
                        <CardHeader>
                            <CardTitle>Room Type Popularity</CardTitle>
                            <CardDescription>Bookings by room type over the past 90 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mt-4">
                                <table className="w-full text-sm">
                                    <thead>
                                    <tr className="border-b">
                                        <th className="text-left pb-2">Room Type</th>
                                        <th className="text-right pb-2">Bookings</th>
                                        <th className="text-right pb-2">% of Total</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {dashboardData.roomTypePopularity.map((type, index) => {
                                        const totalBookings = dashboardData.roomTypePopularity.reduce(
                                            (sum, item) => sum + item.bookings,
                                            0
                                        );
                                        const percentage = totalBookings > 0
                                            ? ((type.bookings / totalBookings) * 100).toFixed(1)
                                            : '0';

                                        return (
                                            <tr key={index} className="border-b last:border-0">
                                                <td className="py-2">{type.typeName}</td>
                                                <td className="text-right py-2">{type.bookings}</td>
                                                <td className="text-right py-2">{percentage}%</td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Services Tab */}
                <TabsContent value="services">
                    <Card>
                        <CardHeader>
                            <CardTitle>Service Usage</CardTitle>
                            <CardDescription>Most frequently used services over the past 90 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mt-4">
                                <table className="w-full text-sm">
                                    <thead>
                                    <tr className="border-b">
                                        <th className="text-left pb-2">Service</th>
                                        <th className="text-right pb-2">Usage</th>
                                        <th className="text-right pb-2">Revenue</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {dashboardData.servicePopularity.map((service, index) => (
                                        <tr key={index} className="border-b last:border-0">
                                            <td className="py-2">{service.serviceName}</td>
                                            <td className="text-right py-2">{service.usageCount}</td>
                                            <td className="text-right py-2">{formatCurrency(service.totalRevenue)}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}