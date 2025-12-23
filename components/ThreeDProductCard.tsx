'use client'

import { cn } from '@/lib/utils'; // optional; or remove cn()
import dynamic from 'next/dynamic'
import Link from 'next/link'

// client-only web component host
const ProductModelViewer = dynamic(() => import('@/components/ProductModelViewer'), { ssr: false })

type Product = {
    id: string
    name: string
    price: number
    imageUrls: string[]
    modelUrls?: string[]
    isActive?: boolean
}

interface Props {
    product: Product
    className?: string
}

export default function ThreeDProductCard({ product, className }: Props) {
    const cover = product.imageUrls?.[0] || '/placeholder.jpg'
    const model = product.modelUrls?.[0] // show first model if present

    return (
        <Link
            href={`/product/${product.id}`}
            className={cn(
                'group relative block rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm',
                'transition-transform will-change-transform hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]',
                className
            )}
            style={{ perspective: 1200 }}
            aria-label={product.name}
        >
            {/* media frame */}
            <div className="relative aspect-[4/5] w-full overflow-hidden">
                {/* Image (default visible) */}
                <img
                    src={cover}
                    alt={product.name}
                    className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300
                     opacity-100 group-hover:opacity-0"
                    loading="lazy"
                />

                {/* 3D viewer (fades in on hover) */}
                {model && (
                    <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                       pointer-events-none" // let whole card remain clickable
                    >
                        <ProductModelViewer
                            src={model}
                            // optional: pass the cover as poster so it looks instant
                            poster={cover}
                            className="h-full w-full"
                        />
                    </div>
                )}
            </div>

            {/* content */}
            <div className="p-4">
                <h3 className="text-white font-semibold truncate">{product.name}</h3>
                <p className="text-accent-400 font-bold">₹{product.price}</p>
            </div>
        </Link>
    )
}
