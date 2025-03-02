'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { RevealOnScroll } from '@/components/animations/Reveal';
import AuthModal from '@/components/modals/AuthModal';
import { useRouter } from 'next/navigation';

export default function Home() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const router = useRouter();

    const handleReservationClick = () => {
        router.push('/reservations');
    };

    const handleAuthSuccess = () => {
        router.push('/reservations');
    };

    return (
        <>

            {/* Authentication Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onOpenChangeAction={setIsAuthModalOpen}
                onSuccess={handleAuthSuccess}
            />


            {/* Hero Section */}
            <section id="hero" className="relative h-screen">
                <div className="absolute inset-0">
                    <Image
                        src="/hero-hotel.jpg"
                        alt="King William Hotel Exterior"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/20" />
                </div>
                <div className="relative container h-full flex items-center">
                    <div className="max-w-2xl text-white">
                        <div className="overflow-hidden">
                            <h1 className="font-display text-7xl mb-6 animate-fade-in">
                                King William Hotel
                            </h1>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xl mb-8 font-light tracking-wide animate-fade-in-delay">
                                A landmark of elegance since 1923
                            </p>
                        </div>
                        <Button
                            size="lg"
                            className="bg-white/90 backdrop-blur-sm text-black hover:bg-white transition-all duration-300"
                            onClick={handleReservationClick}
                        >
                            Reserve Your Stay
                        </Button>
                    </div>
                </div>
            </section>

            {/* Heritage Section */}
            <section id="heritage" className="py-24 bg-stone-50">
                <div className="container">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <RevealOnScroll>
                            <div className="relative h-[600px]">
                                <Image
                                    src="/hotel-interior.jpg"
                                    alt="King William Hotel Interior"
                                    fill
                                    className="object-cover rounded-lg"
                                />
                            </div>
                        </RevealOnScroll>
                        <RevealOnScroll>
                            <div>
                                <h2 className="font-display text-4xl mb-6">A Century of
                                                                           Hospitality</h2>
                                <p className="text-gray-700 mb-6">
                                    Built in 1923, the King William Hotel stands as a testament to
                                    timeless elegance in the heart of Ontario&#39;s most cherished
                                    tourist destination. Recently restored to its original splendor,
                                    our rooms and common areas capture the essence of early
                                    20th-century luxury while providing modern comfort and
                                    convenience.
                                </p>
                            </div>
                        </RevealOnScroll>
                    </div>
                </div>
            </section>

            {/* Accommodations Section */}
            <section id="accommodations" className="py-24">
                <div className="container">
                    <RevealOnScroll>
                        <h2 className="font-display text-4xl text-center mb-16">Accommodations</h2>
                    </RevealOnScroll>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                type: "Single Rooms",
                                description: "15 elegantly appointed rooms perfect for the discerning traveler",
                                rate: "Starting at $95 per night",
                                image: "/single-room.jpg"
                            },
                            {
                                type: "Double Rooms",
                                description: "22 spacious rooms ideal for pairs or families",
                                rate: "Starting at $130 per night",
                                image: "/double-room.jpg"
                            },
                            {
                                type: "Luxury Suites",
                                description: "4 unique suites offering the pinnacle of comfort",
                                rate: "Starting at $165 per night",
                                image: "/suite.jpg"
                            }
                        ].map((room) => (
                            <RevealOnScroll key={room.type}>
                                <div className="group">
                                    <div className="relative h-[400px] mb-6">
                                        <Image
                                            src={room.image}
                                            alt={room.type}
                                            fill
                                            className="object-cover rounded-lg"
                                        />
                                    </div>
                                    <h3 className="font-display text-2xl mb-3">{room.type}</h3>
                                    <p className="text-gray-600 mb-2">{room.description}</p>
                                    <p className="text-gray-500">{room.rate}</p>
                                </div>
                            </RevealOnScroll>
                        ))}
                    </div>
                </div>
            </section>

            {/* Experience Section */}
            <section id="experience" className="py-24 bg-stone-50">
                <div className="container">
                    <RevealOnScroll>
                        <h2 className="font-display text-4xl text-center mb-16">The King William
                                                                                Experience</h2>
                    </RevealOnScroll>
                    <div className="space-y-24">
                        <RevealOnScroll>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                <div className="relative h-[400px]">
                                    <Image
                                        src="/restaurant.jpg"
                                        alt="Hotel Restaurant"
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-display text-3xl mb-6">Fine Dining</h3>
                                    <p className="text-gray-700 mb-6">
                                        From early morning breakfast to late evening dining, our
                                        restaurant offers an exceptional culinary experience. Enjoy
                                        the convenience of charging any meal directly to your room,
                                        allowing you to dine at your leisure.
                                    </p>
                                </div>
                            </div>
                        </RevealOnScroll>

                        <RevealOnScroll>
                            <div
                                className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
                                <div className="relative h-[400px]">
                                    <Image
                                        src="/services.jpg"
                                        alt="Concierge Services"
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-display text-3xl mb-6">Personalized
                                                                               Service</h3>
                                    <p className="text-gray-700 mb-6">
                                        Our attentive staff provides a range of services including
                                        dry-cleaning, transportation arrangements, and special
                                        requests. All services can be conveniently billed to your
                                        room.
                                    </p>
                                </div>
                            </div>
                        </RevealOnScroll>
                    </div>
                </div>
            </section>

            {/* Contact and Location */}
            <section id="location" className="py-24">
                <div className="container">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="font-display text-4xl mb-6">Visit Us</h2>
                        <p className="text-gray-700 mb-8">
                            Located in the heart of Ontario&#39;s premier tourist destination, the
                            King William Hotel offers the perfect base for exploring the
                            region&#39;s attractions.
                        </p>
                        <Button size="lg" onClick={handleReservationClick}>
                            Make a Reservation
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}
