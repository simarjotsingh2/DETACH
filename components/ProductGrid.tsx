'use client'

import { motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import './ProductGrid.css'
import WishlistButton from './WishlistButton'

// client-only 3D viewer
const ProductModelViewer = dynamic(() => import('@/components/ProductModelViewer'), { ssr: false })

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  imageUrls: string[]
  stock: number
  isActive: boolean
  discount?: number
  modelUrls?: string[]
}

interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
}

// helpers (kept in case you use them elsewhere)
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const lerp  = (a: number, b: number, t: number) => a + (b - a) * t

/* ─────────────────────────  Card Component  ───────────────────────── */

function ProductCard({ product, index }: { product: Product; index: number }) {
  const cover = product.imageUrls?.[0] || '/placeholder.jpg'
  const hoverImage = product.imageUrls?.[1]
  const modelUrl = product.modelUrls?.[0]

  // per-card refs (safe inside a dedicated child component)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const hostRef = useRef<HTMLDivElement | null>(null) // wraps <model-viewer>
  const rafRef = useRef<number | null>(null)

  const getModelViewer = () =>
    hostRef.current?.querySelector('model-viewer') as any | null

  const onMove = (e: React.MouseEvent) => {
    if (!modelUrl) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const { clientX } = e
    rafRef.current = requestAnimationFrame(() => {
      const card = cardRef.current
      const mv = getModelViewer()
      if (!card || !mv) return
      const rect = card.getBoundingClientRect()
      // normalize 0..1 across width
      const nx = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
      const yaw = (nx * 360).toFixed(1)
      mv.setAttribute('camera-orbit', `${yaw}deg 90deg auto`)
    })
  }

  const onEnter = (e: React.MouseEvent) => {
    if (!modelUrl) return
    const mv = getModelViewer()
    mv?.removeAttribute('auto-rotate') // pause while interacting
    onMove(e) // snap to cursor immediately
  }

  const onLeave = () => {
    if (!modelUrl) return
    const mv = getModelViewer()
    mv?.setAttribute('auto-rotate', '') // resume slow rotate
  }

  // clean up any pending RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <motion.article
      ref={cardRef as any}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className={[
        'det-card group mx-auto flex w-[280px] h-[420px] items-end justify-center overflow-hidden',
        'rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-md',
        (modelUrl || hoverImage) ? 'has-mock' : ''
      ].join(' ')}
    >
      {/* WRAPPER (cover + gradients + tilt) */}
      <div className="det-wrapper">
        <img src={cover} alt={product.name} className="det-cover-image" />
      </div>

      {/* HOVER LAYER: prefer 3D if present, else second image */}
      {modelUrl ? (
        <div ref={hostRef} className="det-3d" style={{ zIndex: 15 }}>
          <ProductModelViewer src={modelUrl} poster={cover} className="h-full w-full" />
        </div>
      ) : hoverImage ? (
        <img src={hoverImage} alt={`${product.name} mockup`} className="det-character" />
      ) : null}

      {/* BADGES / WISHLIST */}
      <div className="pointer-events-none absolute left-4 top-4 z-20 flex gap-2">
        <span className="rounded-full bg-[#ff2a6d] px-3 py-1 text-xs font-semibold text-white">
          {product.category?.toUpperCase()}
        </span>
        {typeof product.discount === 'number' && product.discount > 0 && (
          <span className="rounded-full bg-red-600/90 px-3 py-1 text-xs font-semibold text-white">
            -{product.discount}% OFF
          </span>
        )}
      </div>
      <div className="absolute right-4 top-4 z-20">
        <WishlistButton productId={product.id} />
      </div>

      {/* INFO STRIP (title + price + CTA) */}
      <div className="det-info">
        <div className="det-info-row">
          <div className="det-info-left">
            <h3 className="det-name" title={product.name}>{product.name}</h3>
            {product.originalPrice && product.originalPrice > product.price ? (
              <div className="det-price">
                <span className="det-price--old">₹{product.originalPrice}</span>
                <span className="det-price--new">₹{product.price}</span>
              </div>
            ) : (
              <div className="det-price">
                <span className="det-price--new">₹{product.price}</span>
              </div>
            )}
          </div>

          <Link href={`/product/${product.id}`} className="det-cta">View</Link>
        </div>
      </div>

      {/* helper strip */}
      {(modelUrl || hoverImage) && (
        <div className="det-helper">
          <div className="flex items-center justify-center gap-2 text-sm text-white/90">
            <Eye className="h-4 w-4" />
            Hover to reveal {modelUrl ? '3D mockup' : 'mockup'}
          </div>
        </div>
      )}
    </motion.article>
  )
}

/* ─────────────────────────  Grid  ───────────────────────── */

export default function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-2xl h-[360px] border border-white/10 bg-white/5 backdrop-blur-md animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7" style={{ perspective: 2500 }}>
      {products.map((product, idx) => (
        <ProductCard key={product.id} product={product} index={idx} />
      ))}
    </div>
  )
}
