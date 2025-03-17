// "use client"

// import type React from "react"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { Check, ChevronRight, Clock, ExternalLink, Utensils, Film, Phone, ShoppingBag, Truck } from "lucide-react"

// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Separator } from "@/components/ui/separator"
// import { Badge } from "@/components/ui/badge"
// import { ScrollArea } from "@/components/ui/scroll-area"

// const services = [
//   {
//     id: 1,
//     service_name: "Restaurant",
//     base_price: 0.0,
//     is_external: false,
//     description: "Enjoy our in-house restaurant with a variety of cuisines and dining options.",
//     icon: Utensils,
//   },
//   {
//     id: 2,
//     service_name: "LongDistance",
//     base_price: 0.0,
//     is_external: false,
//     description: "Make long distance calls from your room at competitive rates.",
//     icon: Phone,
//   },
//   {
//     id: 3,
//     service_name: "MovieRental",
//     base_price: 9.99,
//     is_external: false,
//     description: "Rent the latest movies and enjoy them in the comfort of your room.",
//     icon: Film,
//   },
//   {
//     id: 4,
//     service_name: "DryClean",
//     base_price: 25.0,
//     is_external: true,
//     description: "Professional dry cleaning service for your garments with quick turnaround.",
//     icon: Truck,
//   },
//   {
//     id: 5,
//     service_name: "WakeUpCall",
//     base_price: 0.0,
//     is_external: false,
//     description: "Schedule a wake-up call at your preferred time.",
//     icon: Clock,
//   },
//   {
//     id: 6,
//     service_name: "RoomService",
//     base_price: 5.0,
//     is_external: false,
//     description: "Order food and beverages directly to your room 24/7.",
//     icon: ShoppingBag,
//   },
// ]

// export default function ServicesPage() {
//   const router = useRouter()
//   const [selectedServices, setSelectedServices] = useState<number[]>([])

//   const toggleService = (serviceId: number) => {
//     setSelectedServices((prev) =>
//       prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
//     )
//   }

//   const handleContinue = () => {

//     console.log("Selected services:", selectedServices)
//     router.push("/confirmation")
//   }

//   const handleSkip = () => {
//     router.push("/confirmation")
//   }

//   const totalPrice = selectedServices.reduce((sum, serviceId) => {
//     const service = services.find((s) => s.id === serviceId)
//     return sum + (service?.base_price || 0)
//   }, 0)

//   return (
//     <div className="container max-w-5xl py-10">
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Additional Services</h1>
//           <p className="text-muted-foreground mt-2">
//             Enhance your stay with our premium services. Select the ones you'd like to add or skip for now.
//           </p>
//         </div>

//         <Separator />

//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           {services.map((service) => (
//             <ServiceCard
//               key={service.id}
//               service={service}
//               isSelected={selectedServices.includes(service.id)}
//               onToggle={() => toggleService(service.id)}
//             />
//           ))}
//         </div>

//         <div className="bg-muted/40 rounded-lg p-6 mt-8">
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//             <div>
//               <h2 className="text-xl font-semibold">Your Selection</h2>
//               {selectedServices.length > 0 ? (
//                 <ScrollArea className="h-20 md:h-auto">
//                   <div className="flex flex-wrap gap-2 mt-2 max-w-md">
//                     {selectedServices.map((serviceId) => {
//                       const service = services.find((s) => s.id === serviceId)
//                       return (
//                         <Badge key={serviceId} variant="secondary" className="text-xs">
//                           {service?.service_name}
//                           {service?.base_price != null && service.base_price > 0 && ` ($${service.base_price.toFixed(2)})`}
//                         </Badge>
//                       )
//                     })}
//                   </div>
//                 </ScrollArea>
//               ) : (
//                 <p className="text-muted-foreground text-sm mt-2">No services selected</p>
//               )}
//             </div>

//             <div className="flex flex-col items-end gap-2">
//               <div className="text-right">
//                 <div className="text-sm text-muted-foreground">Total</div>
//                 <div className="text-2xl font-bold">${totalPrice.toFixed(2)}</div>
//               </div>

//               <div className="flex gap-2">
//                 <Button variant="outline" onClick={handleSkip}>
//                   Skip
//                 </Button>
//                 <Button onClick={handleContinue} className="gap-1">
//                   Continue
//                   <ChevronRight className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// interface ServiceCardProps {
//   service: {
//     id: number
//     service_name: string
//     base_price: number
//     is_external: boolean
//     description: string
//     icon: React.ElementType
//   }
//   isSelected: boolean
//   onToggle: () => void
// }

// function ServiceCard({ service, isSelected, onToggle }: ServiceCardProps) {
//   const Icon = service.icon

//   return (
//     <Card className={`overflow-hidden transition-all ${isSelected ? "ring-2 ring-primary" : ""}`}>
//       <CardHeader className="pb-3">
//         <div className="flex justify-between items-start">
//           <div className="flex items-center gap-2">
//             <div className="p-2 rounded-full bg-primary/10">
//               <Icon className="h-5 w-5 text-primary" />
//             </div>
//             <CardTitle className="text-lg">{service.service_name}</CardTitle>
//           </div>
//           {service.is_external && (
//             <Badge variant="outline" className="flex items-center gap-1">
//               <ExternalLink className="h-3 w-3" />
//               External
//             </Badge>
//           )}
//         </div>
//         <CardDescription>{service.description}</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="text-lg font-semibold">
//           {service.base_price > 0 ? `$${service.base_price.toFixed(2)}` : "Free"}
//         </div>
//       </CardContent>
//       <CardFooter className="pt-0">
//         <Button variant={isSelected ? "default" : "outline"} className="w-full gap-2" onClick={onToggle}>
//           {isSelected && <Check className="h-4 w-4" />}
//           {isSelected ? "Selected" : "Select"}
//         </Button>
//       </CardFooter>
//     </Card>
//   )
// }

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { Check, ChevronRight, Clock, ExternalLink, Utensils, Film, Phone, ShoppingBag, Truck } from "lucide-react"
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import React from 'react';
import router from 'next/router';


interface Service {
  id: number;
  service_name: string;
  description: string;
  base_price: number;
  icon: React.ComponentType<{ className?: string }>;
}


export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedServices, setSelectedServices] = useState<number[]>([]);

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
    const service = services.find((s) => s.id === serviceId);
    return sum + (service?.base_price || 0);
  }, 0);

  const handleContinue = () => {
    console.log('Selected services:', selectedServices);
    router.push('/confirmation');
  };

  const handleSkip = () => {
    router.push('/confirmation');
  };


  return (
    <div className="container max-w-5xl py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Additional Services</h1>
          <p className="text-muted-foreground mt-2">Enhance your stay with our premium services.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p>Loading services...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            services.map((service) => (
              <Card key={service.id} className={`overflow-hidden transition-all ${selectedServices.includes(service.id) ? 'ring-2 ring-primary' : ''}`}>
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
                  <Button variant={selectedServices.includes(service.id) ? 'default' : 'outline'} className="w-full gap-2" onClick={() => toggleService(service.id)}>
                    {selectedServices.includes(service.id) && <Check className="h-4 w-4" />}
                    {selectedServices.includes(service.id) ? 'Selected' : 'Select'}
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
                      const service = services.find((s) => s.id === serviceId);
                      return (
                        <Badge key={serviceId} variant="secondary" className="text-xs">
                          {service?.service_name}
                          {service?.base_price != null && service.base_price > 0 && ` ($${service.base_price.toFixed(2)})`}
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


