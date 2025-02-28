'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({behavior: 'smooth'})
    }

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
                        {[
                            {title: 'Heritage', id: 'heritage'},
                            {title: 'Accommodations', id: 'accommodations'},
                            {title: 'Experience', id: 'experience'},
                            {title: 'Location', id: 'location'}
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className={`${
                                    isScrolled ? 'text-gray-600' : 'text-white'
                                } hover:opacity-80`}
                            >
                                {item.title}
                            </button>
                        ))}
                        <Button
                            variant={isScrolled ? "default" : "outline"}
                            className={isScrolled ? '' : 'text-black border-white'}
                        >
                            Book Now
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    )
}