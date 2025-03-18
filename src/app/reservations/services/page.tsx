
'use client';


import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { Check, ChevronRight, Clock, ExternalLink, Utensils, Film, Phone, ShoppingBag, Truck } from "lucide-react"
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import React from 'react';
import { Service, ServiceCharge } from '@/types';
import router from 'next/router';
import { useRouter } from 'next/navigation'; 






export default function ServicesPage() {
  
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedServices, setSelectedServices] = useState<number[]>([]);

  const router = useRouter(); 

  

  const getGroupIdFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
};

  const reservationId = Number(getGroupIdFromURL()); 


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

  // const handleContinue = () => {
  //   console.log('Selected services:', selectedServices);
  //   router.push('/confirmation');
  // };

  const handleContinue = async () => {
    console.log('Reservation id:', reservationId);
  
    try {
      const selectedServiceDetails: ServiceCharge[] = selectedServices.map((serviceId: number) => {
        const service = services.find((s) => s.service_id === serviceId);

        if (!service) {
          console.error('Service not found:', serviceId);
          return null;
        }

        return {
          serviceId: serviceId,
          reservationId,
          quantity: 1, 
          chargedAmount: parseFloat(service.base_price.toString()), 
          chargeDate: new Date().toISOString(),
        };
      }).filter((service) => service !== null); 

      console.log('Selected service details:', selectedServiceDetails);

      if (selectedServiceDetails.length === 0) {
        alert('No services selected.');
        return;
      }

      console.log('Sending to API:', { selectedServices: selectedServiceDetails, reservationId });
      const response =  await axios.post('/api/serviceCharges', { selectedServices: selectedServiceDetails, reservationId });

      if (response.data.success) {
        router.push(`/reservations/confirmation?id=${reservationId}`); // Redirect to confirmation page
      } else {
        alert('Failed to save services. Please try again.');
      }

      // router.push(`/reservations/confirmation?id=${reservationId}`); // Redirect to confirmation page
    } catch (error) {
      alert('Failed to save services. Please try again.');
      console.error('Error saving services:', error);
    }
  };
  

  const handleSkip = () => {
    router.push(`/reservations/confirmation?id=${reservationId}`);
  };


  return (
    <div className="container max-w-5xl py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Additional Services</h1>
          <p className="text-muted-foreground mt-2">Enhance your stay with our premium services.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(
            services.map((service) => (
              // console.log(service),
              <Card key={service.service_id} className={`overflow-hidden transition-all ${selectedServices.includes(service.service_id) ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        
                      </div>
                      <CardTitle className="text-lg">{service.service_name}</CardTitle>
                    </div>
                   
                  </div>
                  {/* <CardDescription>{service.description}</CardDescription> */}
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold">
                    $ {service.base_price}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant={selectedServices.includes(service.service_id) ? 'default' : 'outline'} className="w-full gap-2" onClick={() => toggleService(service.service_id)}>
                    {selectedServices.includes(service.service_id) && <Check className="h-4 w-4" />}
                    {selectedServices.includes(service.service_id) ? 'Selected' : 'Select'}
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        <div className="bg-muted/40 rounded-lg p-6 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold">Your Selection</h2>
              {selectedServices.length > 0 ? (
                <ScrollArea className="h-20 md:h-auto">
                  <div className="flex flex-wrap gap-2 mt-2 max-w-md">
                    {selectedServices.map((serviceId) => {
                      const service = services.find((s) => s.service_id === serviceId);
                      return (
                        <Badge key={serviceId} variant="secondary" className="text-xs">
                          {service?.service_name}
                          {service?.base_price != null && service.base_price > 0 && ` ($${parseFloat(service.base_price.toString()).toFixed(2)})`}
                        </Badge>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground text-sm mt-2">No services selected</p>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-2xl font-bold">${totalPrice.toFixed(2)}</div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSkip}>
                  Skip
                </Button>
                <Button onClick={handleContinue} className="gap-1">
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


