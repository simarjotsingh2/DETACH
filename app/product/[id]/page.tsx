'use client'

import Footer from '@/components/Footer'
import Navigation from '@/components/Navigation'
import { addToCart } from '@/lib/cart'
import { useWishlist } from '@/lib/useWishlist'
import { motion } from 'framer-motion'
import {
  ArrowLeft, CheckCircle, Heart, Minus, Plus, RotateCcw,
  Share2, Shield, ShoppingCart, Truck
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import "./page.css"

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
  sizes: string[]
  stock: number
  isFeatured: boolean
  discount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  modelUrls?: string[]
  hasModel?: boolean
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  // media state
  const [activeMedia, setActiveMedia] = useState<'image' | 'model'>('image')
  const [selectedImage, setSelectedImage] = useState(0)

  // purchase state
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [addingToCart, setAddingToCart] = useState(false)

  const { isInWishlist, toggleWishlist, isLoading: wishlistLoading } = useWishlist()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`, { cache: 'no-store' })
        if (!res.ok) return router.push('/shop')
        const data: Product = await res.json()
        setProduct(data)
        setActiveMedia(data.modelUrls?.length ? 'model' : 'image')
      } catch (err) {
        console.error(err)
        router.push('/shop')
      } finally {
        setLoading(false)
      }
    }
    if (params.id) fetchProduct()
  }, [params.id, router])

  const firstModel = product?.modelUrls?.[0]
  const discountPct = useMemo(() => {
    if (!product?.originalPrice) return 0
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
  }, [product?.originalPrice, product?.price])

  // actions
  const handleAddToCart = async () => {
    if (!product) return
    if (product.sizes?.length && !selectedSize) {
      toast.error('Please select a size')
      return
    }
    setAddingToCart(true)
    try {
      const result = await addToCart(
        { id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrls[0] },
        quantity,
        selectedSize
      )
      if (result.success) toast.success('Added to cart!')
      else if (!result.requiresLogin) toast.error(result.message || 'Failed to add to cart')
    } catch {
      toast.error('Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleWishlistToggle = async () => {
    if (!product) return
    await toggleWishlist(product.id)
  }

  const handleShare = () => {
    if (!product) return
    if (navigator.share) {
      navigator.share({ title: product.name, text: product.description, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied!')
    }
  }

  // loading / not found
  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 text-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (!product) {
    return (
      <div className="min-h-screen bg-ink-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <button onClick={() => router.push('/shop')} className="btn-primary">Back to Shop</button>
        </div>
      </div>
    )
  }

  // —— PAGE ——
  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <Navigation />

      {/* Cinematic background lighting */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-radial-spot" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-noise mix-blend-soft-light opacity-70" />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-24">
        {/* Back link */}
        <button
          onClick={() => router.back()}
          className="group mb-6 inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="border-b border-transparent group-hover:border-white/40">Back to Shop</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* LEFT — Sticky Media Column */}
          <div className="lg:sticky lg:top-24 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-square rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl
                         bg-gradient-to-b from-[#0e0f14] to-[#0a0b10]"
            >
              {/* glow */}
              <div className="absolute -inset-20 bg-[conic-gradient(from_210deg_at_50%_50%,rgba(255,62,165,.12),transparent_35%,rgba(80,180,255,.12),transparent_70%)] blur-3xl" />

              {/* Media */}
              <div className="relative z-10 w-full h-full">
                {activeMedia === 'model' && firstModel ? (
                  <ProductModelViewer
                    src={firstModel}
                    poster={product.imageUrls?.[0]}
                    className="w-full h-full"
                    /* keep auto-rotate off for calm feel; we can toggle in viewer if needed */
                  />
                ) : (
                  <img
                    src={product.imageUrls[selectedImage] || '/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </div>

              {/* Control pill (image / 3D) */}
              <div className="absolute left-4 top-4 z-20 flex gap-2">
                <button
                  onClick={() => setActiveMedia('image')}
                  className={`glass-pill ${activeMedia === 'image' ? 'glass-pill--active' : ''}`}
                >
                  Image
                </button>
                {firstModel && (
                  <button
                    onClick={() => setActiveMedia('model')}
                    className={`glass-pill ${activeMedia === 'model' ? 'glass-pill--active' : ''}`}
                    title="3D viewer"
                  >
                    {/* 3D icon removed due to missing export */}
                    3D
                  </button>
                )}
              </div>
            </motion.div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {product.imageUrls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveMedia('image'); setSelectedImage(i) }}
                  className={`relative aspect-square rounded-xl overflow-hidden ring-1 transition-all
                              ${activeMedia === 'image' && selectedImage === i
                                ? 'ring-neon-pink ring-offset-2 ring-offset-ink-950'
                                : 'ring-white/10 hover:ring-white/25'}`}
                  title={`Image ${i + 1}`}
                >
                  <img src={url} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" loading="lazy"/>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — Details Panel */}
          <div className="space-y-7">
            {/* Category badges */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs tracking-wider font-semibold
                               bg-white/10 ring-1 ring-white/15">{product.category}</span>

              {product.stock === 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-600/90">Out of Stock</span>
              )}
              {product.stock > 0 && product.stock < 10 && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-600/90">Low Stock</span>
              )}
            </div>

            {/* Title + Price */}
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
                <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  {product.name}
                </span>
              </h1>

              <div className="mt-4 flex items-center gap-4">
                <span className="text-4xl font-extrabold bg-gradient-to-r from-neon-pink to-neon-blue bg-clip-text text-transparent">
                  ₹{product.price}
                </span>
                {!!product.originalPrice && (
                  <>
                    <span className="text-lg text-white/50 line-through">₹{product.originalPrice}</span>
                    <span className="px-2 py-1 rounded bg-red-600/90 text-sm font-semibold">
                      -{discountPct}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="rounded-2xl p-5 bg-white/[0.03] ring-1 ring-white/10 backdrop-blur-md leading-relaxed text-white/80"
              >
                {product.description}
              </motion.div>
            )}

            {/* Size selector */}
            {!!product.sizes?.length && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold tracking-wider text-white/80">SELECT SIZE</h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`size-chip ${selectedSize === size ? 'size-chip--active' : ''}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {selectedSize && (
                  <p className="text-xs text-white/50">Selected: <span className="text-white/80">{selectedSize}</span></p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold tracking-wider text-white/80">QUANTITY</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-xl ring-1 ring-white/10 overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-white/5 disabled:opacity-40"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-2 hover:bg-white/5 disabled:opacity-40"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-white/60">{product.stock} available</span>
              </div>
            </div>

            {/* CTA Row */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="button-primary"
                disabled={addingToCart || product.stock === 0}
                onClick={handleAddToCart}
              >
                {addingToCart
                  ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> Adding…</>
                  : <><ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart</>
                }
              </button>

              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`button-ghost ${isInWishlist(product.id) ? 'button-ghost--active' : ''} ${wishlistLoading ? 'opacity-50' : ''}`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </button>

              <button onClick={handleShare} className="button-ghost" title="Share">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Features / trust row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              <div className="trust-chip"><Truck className="w-5 h-5" /> Free shipping over ₹50</div>
              <div className="trust-chip"><RotateCcw className="w-5 h-5" /> 30-day returns</div>
              <div className="trust-chip"><Shield className="w-5 h-5" /> Secure checkout</div>
              <div className="trust-chip"><CheckCircle className="w-5 h-5" /> Authentic products</div>
            </div>
          </div>
        </div>

        {/* Mobile sticky bar */}
        <div className="lg:hidden fixed bottom-4 left-0 right-0 z-40 px-4">
          <div className="rounded-2xl bg-black/70 backdrop-blur-md ring-1 ring-white/10 p-3 flex items-center justify-between">
            <div>
              <div className="text-xs text-white/60">Total</div>
              <div className="text-lg font-extrabold">₹{product.price * quantity}</div>
            </div>
            <button
              className="button-primary px-6"
              disabled={addingToCart || product.stock === 0}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-5 h-5 mr-2" /> Add
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
