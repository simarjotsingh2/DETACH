'use client'

import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'
import Navigation from '@/components/Navigation'
import ProductFilters from '@/components/ProductFilters'
import ProductGrid from '@/components/ProductGrid'
import { motion } from 'framer-motion'
import { SlidersHorizontal, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrls: string[]
  stock: number
  isActive: boolean
}

// Define the Filters type
interface Filters {
  category: string
  priceRange: [number, number]
  search: string
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    category: 'ALL',
    priceRange: [0, 10000],
    search: ''
  })

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || [])
          setFilteredProducts(data.products || [])
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Filter products based on current filters
  useEffect(() => {
    let filtered = products

    // Category filter
    if (filters.category !== 'ALL') {
      filtered = filtered.filter(product => product.category === filters.category)
    }

    // Price range filter
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    )

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
  }, [products, filters])

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }


  // ————————— Page —————————
return (
  <div className="min-h-screen bg-ink-900 text-white">
    <Navigation />

    {/* Background layers (cinematic spotlights + grain) */}
    <div className="pointer-events-none fixed inset-0 -z-10 bg-radial-spot" />
    <div className="pointer-events-none fixed inset-0 -z-10 bg-noise opacity-90 mix-blend-soft-light" />

    {/* ===== Hero Header ===== */}
    <section className="relative overflow-hidden pt-16 md:pt-24">
      {/* sweeping side glows */}
      <div className="pointer-events-none absolute -left-40 top-0 h-[140%] w-[55%] rotate-[8deg] bg-gradient-to-r from-neon-pink/25 via-transparent to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-0 h-[140%] w-[55%] -rotate-[8deg] bg-gradient-to-l from-neon-blue/25 via-transparent to-transparent blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl px-4 sm:px-6"
      >
        <div className="flex flex-col items-center text-center gap-5">
          <h1 className="font-display text-[40px] md:text-6xl font-extrabold tracking-tight leading-none">
            <span className="block text-white/90">SHOP</span>
            <span className="block bg-gradient-to-r from-neon-violet via-neon-pink to-neon-blue bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer">
              COLLECTION
            </span>
          </h1>

          <p className="max-w-2xl text-white/70">
            Curated drops in a moody, marble-lit gallery. Minimal, luxe—and a little dangerous.
          </p>

          {/* tiny animated badge */}
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-ink-800/40 px-3 py-1.5 backdrop-blur shadow-card">
            <Sparkles className="size-4 animate-floaty text-white/70" />
            <span className="text-xs tracking-wider uppercase text-white/70">
              New animations &amp; vibe enabled
            </span>
          </div>
        </div>
      </motion.div>

      <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>

    {/* ===== Content ===== */}
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px,1fr]">
        {/* — Filters — */}
        <aside className="order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="sticky top-24 rounded-2xl border border-white/10 bg-ink-800/50 p-5 backdrop-blur shadow-card"
          >
            <div className="mb-4 flex items-center gap-2">
              <SlidersHorizontal className="size-5 text-white/60" />
              <h3 className="text-lg font-semibold">Filters</h3>
            </div>

            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </motion.div>
        </aside>

        {/* — Products — */}
        <div className="order-1 lg:order-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex flex-wrap items-center gap-4"
          >
            <p className="text-sm uppercase tracking-wider text-white/60">
              Showing{' '}
              <span className="bg-gradient-to-r from-neon-pink to-neon-blue bg-clip-text text-transparent">
                {loading ? '…' : filteredProducts.length}
              </span>{' '}
              of {loading ? '…' : products.length} products
            </p>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner text="Loading products..." size="lg" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-ink-800/40 p-10 text-center">
              <p className="text-white/70">
                No items match your filters. Try adjusting category, price range, or search.
              </p>
            </div>
          ) : (
            <ProductGrid products={filteredProducts} isLoading={false} />
          )}
        </div>
      </div>
    </section>

    <Footer />
  </div>
)
}