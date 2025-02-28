'use client'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export function RevealOnScroll({ children, width = "100%" }: { children: ReactNode, width?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 75 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ width }}
        >
            {children}
        </motion.div>
    )
}