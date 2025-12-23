'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const categories = [
  {
    id: 'tshirts',
    name: 'T-SHIRTS',
    description: 'Urban streetwear tees with bold graphics',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop',
    count: '50+ Styles'
  },
  {
    id: 'hoodies',
    name: 'HOODIES',
    description: 'Premium comfort with edgy designs',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop',
    count: '30+ Styles'
  },
  {
    id: 'pants',
    name: 'PANTS',
    description: 'Street-ready bottoms for every occasion',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop',
    count: '25+ Styles'
  },
  {
    id: 'shoes',
    name: 'SHOES',
    description: 'Footwear that makes a statement',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop',
    count: '20+ Styles'
  },
  {
    id: 'accessories',
    name: 'ACCESSORIES',
    description: 'Complete your look with our accessories',
    imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=500&fit=crop',
    count: '40+ Items'
  }
]

export default function CategoriesSection() {
  return (
    <section className="section-padding bg-black">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="text-white">SHOP BY</span>{' '}
            <span className="text-gradient">CATEGORY</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Find your style in our carefully curated collections
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link href={`/shop?category=${category.id}`}>
                <div className="relative overflow-hidden rounded-lg bg-primary-900 border border-primary-800 group-hover:border-accent-500 transition-all duration-500">
                  {/* Image */}
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {category.name}
                      </h3>
                      <p className="text-gray-300 text-sm mb-3">
                        {category.description}
                      </p>
                      <span className="inline-block px-3 py-1 bg-accent-600 text-white text-xs font-medium">
                        {category.count}
                      </span>
                    </div>

                    {/* Hover Effect */}
                    <div className="flex items-center text-accent-400 group-hover:text-white transition-colors duration-300">
                      <span className="text-sm font-medium uppercase tracking-wider">
                        EXPLORE
                      </span>
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-accent-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Categories Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/shop" className="btn-primary">
            VIEW ALL CATEGORIES
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
