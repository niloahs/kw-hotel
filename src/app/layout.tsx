import { Montserrat, Playfair_Display } from 'next/font/google'
import Footer from '@/components/layout/Footer'
import Navigation from '@/components/Navigation'
import './globals.css'
import React from "react";
import { SessionProvider } from '@/components/providers/SessionProvider';

const playfair = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-playfair'
})

const montserrat = Montserrat({
    subsets: ['latin'],
    variable: '--font-montserrat'
})

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" id="root">
        <body className={`${montserrat.variable} ${playfair.variable} font-sans`}>
        <SessionProvider>
            <Navigation />
            <main>
                {children}
            </main>
            <Footer />
        </SessionProvider>
        </body>
        </html>
    )
}