'use client'

import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'

// Optional: wire your own wishlist hooks here
// import { useWishlist } from '@/lib/useWishlist'
// import { useFlyingHeart } from '@/lib/FlyingHeartContext'

export type FeaturedProduct = {
    id: string
    name: string
    price: number
    originalPrice?: number
    imageUrls: string[]
    category: string
}

type Props = {
    fetchUrl?: string // defaults to /api/products?featured=true
    products?: FeaturedProduct[] // pass array directly if you have it
    autoplayMs?: number // default 5000
}

export default function FeaturedProductsEmbla({
    fetchUrl = '/api/products?featured=true',
    products,
    autoplayMs = 5000,
}: Props) {
    const [items, setItems] = React.useState<FeaturedProduct[]>([])
    const [loading, setLoading] = React.useState(true)
    const [progress, setProgress] = React.useState(0)

    // const { addToWishlist, isInWishlist } = useWishlist()
    // const { triggerFlyingHeart } = useFlyingHeart()
    const buttonRef = React.useRef<HTMLButtonElement>(null)

    // Fetch (or accept via props)
    React.useEffect(() => {
        if (products?.length) {
            setItems(products)
            setLoading(false)
            return
        }
        ; (async () => {
            try {
                const res = await fetch(fetchUrl, { cache: 'no-store' })
                const raw = await res.json()
                const arr =
                    Array.isArray(raw) ? raw :
                        Array.isArray(raw?.products) ? raw.products :
                            Array.isArray(raw?.items) ? raw.items :
                                raw ? [raw] : []
                const normalized: FeaturedProduct[] = arr.map((p: any) => ({
                    id: String(p.id ?? p._id ?? Math.random().toString(36).slice(2)),
                    name: p.name ?? 'Untitled',
                    price: Number(p.price ?? 0),
                    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : undefined,
                    imageUrls: Array.isArray(p.imageUrls) && p.imageUrls.length ? p.imageUrls : ['/placeholder.jpg'],
                    category: p.category ?? 'GENERAL',
                }))
                setItems(normalized)
            } catch (e) {
                console.error('featured fetch failed', e)
                setItems([])
            } finally {
                setLoading(false)
            }
        })()
    }, [fetchUrl, products])

    // Embla
    const autoplay = React.useRef(
        Autoplay({ delay: autoplayMs, stopOnInteraction: false, stopOnMouseEnter: true })
    )
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, align: 'center', skipSnaps: false, dragFree: false },
        [autoplay.current]
    )

    // progress bar
    React.useEffect(() => {
        if (!emblaApi) return
        const onScroll = () => {
            const snap = emblaApi.selectedScrollSnap()
            const progressWithin = emblaApi.scrollProgress() - snap
            const width = Math.abs(progressWithin) * 100
            setProgress(width)
        }
        emblaApi.on('scroll', onScroll)
        emblaApi.on('reInit', onScroll)
        onScroll()
        return () => {
            emblaApi.off('scroll', onScroll)
            emblaApi.off('reInit', onScroll)
        }
    }, [emblaApi])

    const scrollPrev = () => emblaApi?.scrollPrev()
    const scrollNext = () => emblaApi?.scrollNext()

    // 3D tilt (shared across slides)
    const tx = useMotionValue(0)
    const ty = useMotionValue(0)
    const rX = useTransform(ty, [-50, 50], [8, -8])
    const rY = useTransform(tx, [-50, 50], [-8, 8])
    const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
        tx.set(((e.clientX - r.left) / r.width) * 100 - 50)
        ty.set(((e.clientY - r.top) / r.height) * 100 - 50)
    }
    const onLeave = () => {
        tx.set(0); ty.set(0)
    }

    if (loading) {
        return (
            <section className="py-14 bg-primary-900">
                <div className="container-custom">
                    <Header />
                    <div className="mt-6 h-1 w-full rounded bg-white/10 overflow-hidden">
                        <div className="h-full w-1/3 animate-pulse bg-white/25" />
                    </div>
                    <div className="mt-6 h-64 w-full rounded-2xl bg-white/5 animate-pulse" />
                </div>
            </section>
        )
    }

    if (!items.length) {
        return (
            <section className="py-14 bg-primary-900">
                <div className="container-custom">
                    <Header />
                    <p className="mt-3 text-gray-300">No featured products right now.</p>
                    <div className="mt-6">
                        <Link href="/shop" className="btn-primary">Browse all products</Link>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="relative py-10 bg-primary-900">
            <div className="container-custom max-w-3xl">
                <Header />

                {/* cinematic parallax glow */}
                <div className="pointer-events-none absolute inset-x-0 top-24 h-72 blur-3xl -z-10">
                    <div className="mx-auto h-full w-[70%] rounded-full bg-[radial-gradient(60%_70%_at_50%_50%,rgba(255,65,130,0.18),rgba(0,0,0,0))]" />
                </div>

                {/* progress */}
                <div className="h-1 bg-white/10 rounded overflow-hidden mb-4">
                    <div
                        className="h-full bg-accent-500 transition-[width] duration-100"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>

                {/* viewport */}
                <div className="relative">
                    <div className="embla" ref={emblaRef}>
                        <div className="embla__container">
                            {items.map((p) => (
                                <div className="embla__slide" key={p.id}>
                                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_40px_-12px_rgba(0,0,0,0.6)] overflow-hidden relative">
                                        {/* sweep sheen */}
                                        <div className="pointer-events-none absolute inset-0 rounded-2xl">
                                            <div className="absolute -left-1/3 top-0 h-full w-1/2 rotate-12
                                      bg-[linear-gradient(100deg,transparent,rgba(255,255,255,.12),transparent)]
                                      animate-[sheen_7s_linear_infinite]" />
                                        </div>

                                        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                                            {/* Image */}
                                            <motion.div
                                                className="md:col-span-3 rounded-xl overflow-hidden aspect-[16/10] md:aspect-[4/3] w-full relative"
                                                onMouseMove={onMove}
                                                onMouseLeave={onLeave}
                                                style={{ perspective: 1000 }}
                                            >
                                                <motion.img
                                                    src={p.imageUrls?.[0] || '/placeholder.jpg'}
                                                    alt={p.name}
                                                    style={{ rotateX: rX, rotateY: rY }}
                                                    className="w-full h-full object-cover will-change-transform"
                                                    whileHover={{ scale: 1.02 }}
                                                    transition={{ type: 'spring', stiffness: 150, damping: 18 }}
                                                />
                                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_10%,transparent,rgba(0,0,0,0.5))]" />
                                            </motion.div>

                                            {/* Details */}
                                            <div className="md:col-span-2 flex flex-col gap-3">
                                                <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/10 text-white/90 w-max">
                                                    {p.category}
                                                </span>

                                                <h3 className="text-xl md:text-2xl font-semibold text-white leading-snug">
                                                    {p.name}
                                                </h3>

                                                <div className="flex items-end gap-3">
                                                    {p.originalPrice && p.originalPrice > p.price ? (
                                                        <>
                                                            <span className="text-gray-400 line-through">₹{p.originalPrice}</span>
                                                            <span className="text-2xl font-bold text-accent-400">₹{p.price}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-2xl font-bold text-accent-400">${p.price}</span>
                                                    )}
                                                </div>

                                                <div className="mt-1 flex gap-2">
                                                    <Link href={`/product/${p.id}`} className="btn-primary h-10 px-4 text-sm">
                                                        View details
                                                    </Link>

                                                    <button
                                                        ref={buttonRef}
                                                        // onClick={async () => {
                                                        //   if (isInWishlist(p.id)) return
                                                        //   const ok = await addToWishlist(p.id)
                                                        //   if (ok && buttonRef.current) {
                                                        //     const r = buttonRef.current.getBoundingClientRect()
                                                        //     triggerFlyingHeart({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
                                                        //   }
                                                        // }}
                                                        className="btn-secondary h-10 px-3 text-sm flex items-center gap-2"
                                                    >
                                                        <Heart className="w-4 h-4" />
                                                        Add to wishlist
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* controls */}
                    <button
                        onClick={scrollPrev}
                        aria-label="Previous"
                        className="absolute -left-3 md:-left-4 top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-full border border-white/15 bg-black/40 text-white hover:bg-black/60 transition"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={scrollNext}
                        aria-label="Next"
                        className="absolute -right-3 md:-right-4 top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-full border border-white/15 bg-black/40 text-white hover:bg-black/60 transition"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="text-center mt-10">
                    <Link href="/shop" className="btn-primary">View all products</Link>
                </div>
            </div>

            <style jsx global>{`
        .embla { overflow: hidden; }
        .embla__container { display: flex; gap: 1.75rem; }
        .embla__slide {
          flex: 0 0 100%;
          min-width: 0;
        }
        @keyframes sheen {
          0% { transform: translateX(-60%) rotate(12deg); }
          60% { transform: translateX(120%) rotate(12deg); }
          100% { transform: translateX(120%) rotate(12deg); }
        }
      `}</style>
        </section>
    )
}

function Header() {
    return (
        <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
                <span className="text-white">FEATURED</span>{' '}
                <span className="text-gradient">PRODUCTS</span>
            </h2>
            <p className="mt-2 text-sm md:text-base text-gray-300">
                Latest drops & most-loved pieces
            </p>
        </div>
    )
}
