'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/modals/AuthModal';
import { getCookie, deleteCookie } from 'cookies-next';

export default function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        // Check login status
        const token = getCookie('kw_auth_token');
        setIsLoggedIn(!!token);

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({behavior: 'smooth'});
    };

    const handleAuthSuccess = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {method: 'POST'});
            deleteCookie('kw_auth_token');
            setIsLoggedIn(false);
            router.refresh();
        } catch (error) {
            console.log(error)
            console.error('Logout failed');
        }
    };

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${
            isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
        }`}>
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => scrollToSection('hero')}
                        className={`font-display text-2xl ${
                            isScrolled ? 'text-gray-900' : 'text-white'
                        }`}
                    >
                        King William Hotel
                    </button>

                    <div className="hidden md:flex items-center space-x-8">
                        {/* Navigation links */}
                        {[
                            {title: 'Heritage', id: 'heritage'},
                            {title: 'Accommodations', id: 'accommodations'},
                            {title: 'Experience', id: 'experience'},
                            {title: 'Location', id: 'location'}
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className={`${isScrolled ? 'text-gray-600' : 'text-white'} hover:opacity-80`}
                            >
                                {item.title}
                            </button>
                        ))}

                        {/* Always show Book Now button */}
                        <Button
                            variant={isScrolled ? "default" : "outline"}
                            className={isScrolled ? '' : 'text-black border-white'}
                            onClick={() => router.push('/reservations')}
                        >
                            Book Now
                        </Button>

                        {/* Show Login or Logout based on auth state */}
                        {isLoggedIn ? (
                            <Button
                                variant="ghost"
                                className={isScrolled ? 'text-gray-600' : 'text-white'}
                                onClick={handleLogout}
                            >
                                Logout
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                className={isScrolled ? 'text-gray-600' : 'text-white'}
                                onClick={() => setIsAuthModalOpen(true)}
                            >
                                Login
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <AuthModal
                isOpen={isAuthModalOpen}
                onOpenChangeAction={setIsAuthModalOpen}
                onSuccess={handleAuthSuccess}
            />
        </nav>
    );
}