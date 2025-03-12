'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/modals/AuthModal';
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";

export default function Navigation() {
    const {isAuthenticated, user, logout} = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Determine if we're on the homepage
    const isHomePage = pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

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
        setIsAuthModalOpen(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.refresh();
        } catch (error) {
            console.log(error);
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

                        {/* Book Now button */}
                        <Button
                            variant={isScrolled ? "default" : "outline"}
                            className={isScrolled ? '' : 'text-black border-white'}
                            onClick={() => router.push('/reservations')}
                        >
                            Book Now
                        </Button>

                        <Separator orientation="vertical" className="h-6" />

                        {/* Show My Account link when authenticated */}
                        {isAuthenticated && (
                            <Link href="/account"
                                  className={isScrolled ? 'text-gray-600' : 'text-white'}>
                                My Account
                            </Link>
                        )}

                        {/* Show Login or Logout based on auth state */}
                        {isAuthenticated ? (
                            <Button
                                variant="ghost"
                                onClick={handleLogout}
                            >
                                Logout {user && `(${user.firstName})`}
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