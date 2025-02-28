import { Montserrat, Playfair_Display } from 'next/font/google'
import Footer from '@/components/layout/footer'
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
        <html lang="en">
        <body className={`${montserrat.variable} ${playfair.variable} font-sans`}>
        {children}
        <Footer />
        </body>
        </html>
    )
}