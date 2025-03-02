import { Montserrat, Playfair_Display } from 'next/font/google'
import Footer from '@/components/layout/Footer'
import Navigation from '@/components/Navigation'
import './globals.css'
import React from "react";

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
        <Navigation />
        <main>
            {children}
        </main>
        <Footer />
        </body>
        </html>
    )
}