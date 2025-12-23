'use client'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { ReactNode, useState } from 'react'

export default function MagicButton({
    children,
    className,
    as = 'button',
    href,
    onClick,
}: {
    children: ReactNode
    className?: string
    as?: 'button' | 'a'
    href?: string
    onClick?: () => void
}) {
    const Comp: any = as
    const [hover, setHover] = useState(false)

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative inline-block"
            onHoverStart={() => setHover(true)}
            onHoverEnd={() => setHover(false)}
        >
            {/* glow ring */}
            <div className={clsx(
                "absolute -inset-[1.5px] rounded-xl blur-md transition-opacity",
                hover ? "opacity-100" : "opacity-60"
            )}
                style={{
                    background: "linear-gradient(90deg,#8b5dff, #ff4fd8, #6db7ff)",
                    filter: "drop-shadow(0 0 24px rgba(109,183,255,.35))"
                }}
            />
            <Comp
                href={href}
                onClick={onClick}
                className={clsx(
                    "relative z-10 rounded-xl px-5 py-2.5 font-medium",
                    "bg-ink-800/70 backdrop-blur supports-[backdrop-filter]:bg-ink-800/40",
                    "text-white ring-1 ring-white/10",
                    "transition-[background,transform] duration-300",
                    "shadow-card hover:shadow-glow",
                    className
                )}
            >
                <div className="bg-gradient-to-r from-accent.violet via-accent.pink to-accent.blue bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer">
                    {children}
                </div>
            </Comp>
        </motion.div>
    )
}
