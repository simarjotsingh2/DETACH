'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, X } from 'lucide-react'

interface Filters {
  category: string
  priceRange: [number, number]
  search: string
}

interface ProductFiltersProps {
  filters: Filters
  onFilterChange: (filters: Partial<Filters>) => void
}

const categories = [
  { value: 'ALL', label: 'All Categories' },
  { value: 'TSHIRTS', label: 'T-Shirts' },
  { value: 'HOODIES', label: 'Hoodies' },
  { value: 'PANTS', label: 'Pants' },
  { value: 'SHOES', label: 'Shoes' },
  { value: 'ACCESSORIES', label: 'Accessories' }
]

export default function ProductFilters({ filters, onFilterChange }: ProductFiltersProps) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  const handleCategoryChange = (category: string) => {
    onFilterChange({ category })
  }

  const handlePriceChange = (min: number, max: number) => {
    onFilterChange({ priceRange: [min, max] })
  }

  const handleSearchChange = (search: string) => {
    onFilterChange({ search })
  }

  const clearFilters = () => {
    onFilterChange({
      category: 'ALL',
      priceRange: [0, 10000],
      search: ''
    })
  }

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          className="w-full flex items-center justify-between p-4 bg-primary-900 border border-primary-800 rounded-lg"
        >
          <span className="text-white font-medium">Filters</span>
          <Filter className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Mobile Filters Overlay */}
      {isMobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50">
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="absolute right-0 top-0 h-full w-80 bg-primary-900 border-l border-primary-800 p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Filters</h3>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Mobile Filter Content */}
            <div className="space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-primary-800 border border-primary-700 text-white rounded-lg focus:border-accent-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">Category</label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category.value} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category.value}
                        checked={filters.category === category.value}
                        onChange={() => handleCategoryChange(category.value)}
                        className="mr-3 text-accent-500 focus:ring-accent-500"
                      />
                      <span className="text-gray-300">{category.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={filters.priceRange[1]}
                    onChange={(e) => handlePriceChange(filters.priceRange[0], parseInt(e.target.value))}
                    className="w-full h-2 bg-primary-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>₹0</span>
                    <span>₹10000</span>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full py-3 px-4 border border-accent-500 text-accent-400 hover:bg-accent-500 hover:text-white transition-colors duration-300 rounded-lg"
              >
                Clear All Filters
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <div className="bg-primary-900 border border-primary-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Filters</h3>
          
          <div className="space-y-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-primary-800 border border-primary-700 text-white rounded-lg focus:border-accent-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">Category</label>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={category.value} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value={category.value}
                      checked={filters.category === category.value}
                      onChange={() => handleCategoryChange(category.value)}
                      className="mr-3 text-accent-500 focus:ring-accent-500"
                    />
                    <span className="text-gray-300">{category.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
              </label>
              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="10000"
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceChange(filters.priceRange[0], parseInt(e.target.value))}
                  className="w-full h-2 bg-primary-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>₹0</span>
                  <span>₹10000</span>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="w-full py-3 px-4 border border-accent-500 text-accent-400 hover:bg-accent-500 hover:text-white transition-colors duration-300 rounded-lg"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
