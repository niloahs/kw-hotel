'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/modals/AuthModal';
import { getCookie, deleteCookie } from 'cookies-next';

export default function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Determine if we're on the homepage
    const isHomePage = pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        // Check login status
        const token = getCookie('kw_auth_token');
        setIsLoggedIn(!!token);

        // Only add scroll listener on homepage
        if (isHomePage) {
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        } else {
            // Always show solid background on other pages
            setIsScrolled(true);
        }
    }, [isHomePage]);

    const scrollToSection = (id: string) => {
        if (isHomePage) {
            document.getElementById(id)?.scrollIntoView({behavior: 'smooth'});
        } else {
            // If not on homepage, navigate to homepage and then scroll
            router.push(`/#${id}`);
        }
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
            console.error('Logout failed');
        }
    };

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${
            isScrolled ? 'bg-white shadow-md text-gray-900' : 'bg-transparent text-white'
        }`}>
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className={`font-display text-2xl`}>
                        King William Hotel
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        {/* Navigation links - only show these on homepage */}
                        {isHomePage && [
                            {title: 'Heritage', id: 'heritage'},
                            {title: 'Accommodations', id: 'accommodations'},
                            {title: 'Experience', id: 'experience'},
                            {title: 'Location', id: 'location'}
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className={`hover:opacity-80`}
                            >
                                {item.title}
                            </button>
                        ))}

                        {/* Show reservation link on non-homepages */}
                        {!isHomePage && (
                            <Link href="/reservations" className={isScrolled ? 'text-gray-600' : 'text-white'}>
                                Reservations
                            </Link>
                        )}

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
                                onClick={handleLogout}
                            >
                                Logout
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
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