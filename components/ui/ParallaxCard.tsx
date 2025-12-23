'use client'
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ReactNode } from 'react';

export default function ParallaxCard({
    children, className
}: { children: ReactNode; className?: string }) {
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const rotateX = useTransform(y, [-20, 20], [8, -8])
    const rotateY = useTransform(x, [-20, 20], [-8, 8])

    function onMove(e: React.MouseEvent) {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const px = (e.clientX - rect.left) / rect.width
        const py = (e.clientY - rect.top) / rect.height
        x.set((px - 0.5) * 40)
        y.set((py - 0.5) * 40)
    }

    return (
        <motion.div
            onMouseMove={onMove}
            onMouseLeave={() => { x.set(0); y.set(0) }}
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
