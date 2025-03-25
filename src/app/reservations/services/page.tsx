'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Check, ChevronRight, Clock, Film, Phone, Shirt, Utensils } from "lucide-react";
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Service } from '@/types';
import { useToast } from "@/hooks/use-toast";

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedServices, setSelectedServices] = useState<number[]>([]);
    const router = useRouter();
    const {toast} = useToast();

    const getGroupIdFromURL = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get("id");
    };

    const reservationId = Number(getGroupIdFromURL());

    // Format service name for display
    const formatServiceName = (serviceName: string) => {
        switch (serviceName) {
            case 'DryClean':
                return "Dry Cleaning";
            case 'LongDistance':
                return "Long Distance Calls";
            case 'MovieRental':
                return "Movie Rental";
            case 'Restaurant':
                return "Restaurant";
            case 'RoomService':
                return "Room Service";
            case 'WakeUpCall':
                return "Wake-Up Call";
            default:
                return serviceName;
        }
    };

    // Function to get the appropriate icon for each service
    const getServiceIcon = (serviceName: string) => {
        switch (serviceName) {
            case 'DryClean':
                return <Shirt className="w-4 h-4" />;
            case 'LongDistance':
                return <Phone className="w-4 h-4" />;
            case 'MovieRental':
                return <Film className="w-4 h-4" />;
            case 'Restaurant':
                return <Utensils className="w-4 h-4" />;
            case 'RoomService':
                return <Bell className="w-4 h-4" />;
            case 'WakeUpCall':
                return <Clock className="w-4 h-4" />;
            default:
                return null;
        }
    };

    // Get short descriptions for each service
    const getServiceDescription = (serviceName: string) => {
        switch (serviceName) {
            case 'DryClean':
                return "Professional cleaning for your garments with same-day service.";
            case 'LongDistance':
                return "Convenient long-distance calling from your room at competitive rates.";
            case 'MovieRental':
                return "Enjoy the latest films from our extensive in-room entertainment.";
            case 'Restaurant':
                return "Fine dining experience with a diverse menu, billed directly to your room.";
            case 'RoomService':
                return "Delicious meals delivered directly to your door, available 24/7.";
            case 'WakeUpCall':
                return "Schedule a convenient wake-up call from our front desk staff.";
            default:
                return "";
        }
    };

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await axios.get('/api/services');
                setServices(response.data);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    setError(error.response?.data?.message || 'An error occurred while retrieving services');
                } else {
                    setError('An unexpected error occurred while retrieving services');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const toggleService = (serviceId: number) => {
        setSelectedServices((prev) =>
            prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
        );
    };

    const totalPrice = selectedServices.reduce((sum, serviceId) => {
        const service = services.find((s) => s.service_id === serviceId);
        return sum + (service ? parseFloat(service.base_price.toString()) || 0 : 0);
    }, 0);

    const handleContinue = async () => {
        try {
            if (selectedServices.length > 0) {
                const selectedServiceDetails = selectedServices.map((serviceId) => {
                    const service = services.find((s) => s.service_id === serviceId);
                    if (!service) return null;

                    return {
                        serviceId: serviceId,
                        reservationId,
                        quantity: 1,
                        chargedAmount: parseFloat(service.base_price.toString()),
                        chargeDate: new Date().toISOString(),
                    };
                }).filter(Boolean);

                await axios.post('/api/serviceCharges', {
                    selectedServices: selectedServiceDetails,
                    reservationId
                });
            }
            router.push(`/reservations/confirmation?id=${reservationId}`);
        } catch (error) {
            console.error('Error saving services:', error);
            toast({
                title: "Error",
                description: "Failed to save services. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleSkip = () => {
        router.push(`/reservations/confirmation?id=${reservationId}`);
    };

    if (loading) {
        return (
            <div className="container max-w-4xl mx-auto py-24 px-4">
                <h1 className="text-3xl font-display text-center mb-4">Additional Services</h1>
                <p className="text-center text-gray-500">Loading available services...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container max-w-4xl mx-auto py-24 px-4">
                <h1 className="text-3xl font-display text-center mb-4">Additional Services</h1>
                <p className="text-center text-red-500 mb-6">{error}</p>
                <div className="flex justify-center">
                    <Button onClick={handleSkip}>Continue to Confirmation</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto py-24 px-4">
            <h1 className="text-3xl font-display text-center mb-2">Additional Services</h1>
            <p className="text-center text-gray-500 mb-8">Enhance your stay with our premium
                                                          services.
            </p>

            <div className="grid gap-4 md:grid-cols-3 mb-8">
                {services.map((service) => (
                    <div
                        key={service.service_id}
                        className={`border rounded-md p-3 transition-all ${
                            selectedServices.includes(service.service_id) ? 'border-primary' : 'border-gray-200'
                        }`}
                    >
                        <div className="flex items-center gap-2 mb-1">
              <span className="text-primary">
                {getServiceIcon(service.service_name)}
              </span>
                            <span
                                className="font-medium text-sm">{formatServiceName(service.service_name)}</span>
                        </div>

                        <p className="text-xs text-gray-500 mb-2 line-clamp-2 h-8">
                            {getServiceDescription(service.service_name)}
                        </p>

                        <div className="flex justify-between items-center">
                            <div className="font-semibold">
                                {parseFloat(service.base_price.toString()) > 0
                                    ? `$${parseFloat(service.base_price.toString()).toFixed(2)}`
                                    : 'Free'}
                            </div>
                            <Button
                                variant={selectedServices.includes(service.service_id) ? 'default' : 'outline'}
                                size="sm"
                                className="text-xs h-8 px-2"
                                onClick={() => toggleService(service.service_id)}
                            >
                                {selectedServices.includes(service.service_id) ? (
                                    <>
                                        <Check className="h-3 w-3 mr-1" />
                                        Selected
                                    </>
                                ) : 'Select'}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gray-50 rounded-md p-4 border">
                <div
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                        <h2 className="text-lg font-medium">Your Selection</h2>
                        {selectedServices.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {selectedServices.map((serviceId) => {
                                    const service = services.find((s) => s.service_id === serviceId);
                                    return (
                                        <Badge key={serviceId} variant="secondary"
                                               className="text-xs">
                                            {formatServiceName(service?.service_name || "")}
                                            {service?.base_price != null && parseFloat(service.base_price.toString()) > 0 &&
                                                ` ($${parseFloat(service.base_price.toString()).toFixed(2)})`
                                            }
                                        </Badge>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-xs mt-1">No services selected</p>
                        )}
                    </div>

                    <div className="flex flex-col items-end">
                        <div className="text-right mb-2">
                            <div className="text-xs text-gray-500">Total</div>
                            <div className="text-xl font-medium">${totalPrice.toFixed(2)}</div>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleSkip}>
                                Skip
                            </Button>
                            <Button size="sm" onClick={handleContinue} className="gap-1">
                                Continue
                                <ChevronRight className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}