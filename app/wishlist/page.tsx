'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ShoppingBag, Trash2, ArrowLeft, Eye, X } from 'lucide-react'
import { useWishlist } from '@/lib/useWishlist'
import { addToCart, isUserAuthenticated } from '@/lib/cart'
import toast from 'react-hot-toast'

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, isLoading } = useWishlist()
  const [isRemoving, setIsRemoving] = useState<string | null>(null)
  const [showSizeModal, setShowSizeModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [addingToCart, setAddingToCart] = useState(false)

  const handleRemoveFromWishlist = async (productId: string) => {
    setIsRemoving(productId)
    await removeFromWishlist(productId)
    setIsRemoving(null)
  }

  const handleAddToCartClick = (product: any) => {
    // Check if product has sizes
    if (product.sizes && product.sizes.length > 0) {
      setSelectedProduct(product)
      setSelectedSize('')
      setShowSizeModal(true)
    } else {
      // No sizes, add directly to cart
      handleAddToCart(product, '')
    }
  }

  const handleAddToCart = async (product: any, size: string = '') => {
    setAddingToCart(true)
    try {
      const result = await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrls[0]
      }, 1, size)

      if (result.success) {
        toast.success('Added to cart!')
        setShowSizeModal(false)
        setSelectedProduct(null)
        setSelectedSize('')
      } else if (result.requiresLogin) {
        toast.error('Please login to add products to the cart')
      } else {
        toast.error(result.message || 'Failed to add to cart')
      }
    } catch (error) {
      toast.error('Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleSizeSelection = () => {
    if (!selectedSize) {
      toast.error('Please select a size')
      return
    }
    handleAddToCart(selectedProduct, selectedSize)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading your wishlist...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/shop"
              className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
                <span>❤️</span>
                <span>My Wishlist</span>
              </h1>
              <p className="text-gray-400 mt-1">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-2xl font-semibold text-white mb-4">Your wishlist is empty</h3>
            <p className="text-gray-400 mb-8">Start adding products you love to your wishlist!</p>
            <Link
              href="/shop"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Start Shopping</span>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group h-full"
              >
                <div className="bg-primary-900 border border-primary-800 rounded-lg overflow-hidden hover:border-accent-500 transition-all duration-300 h-full flex flex-col">
                  {/* Product Image */}
                  <div className="relative overflow-hidden flex-shrink-0">
                    <Link href={`/product/${item.product.id}`}>
                      <img
                        src={item.product.imageUrls[0] || '/placeholder.jpg'}
                        alt={item.product.name}
                        className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </Link>

                    {/* Remove from Wishlist */}
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={() => handleRemoveFromWishlist(item.product.id)}
                        disabled={isRemoving === item.product.id}
                        className="w-10 h-10 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Quick View Button */}
                    <div className="absolute bottom-4 right-4">
                      <Link
                        href={`/product/${item.product.id}`}
                        className="w-10 h-10 bg-accent-500/20 hover:bg-accent-500/30 text-accent-400 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                    </div>

                    {/* Product Status */}
                    {!item.product.isActive && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="px-4 py-2 bg-red-600 text-white font-medium rounded">
                          UNAVAILABLE
                        </span>
                      </div>
                    )}

                    {item.product.stock === 0 && item.product.isActive && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="px-4 py-2 bg-yellow-600 text-white font-medium rounded">
                          OUT OF STOCK
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="mb-4 flex-grow">
                      <h3 className="text-base font-semibold text-white mb-2 group-hover:text-accent-400 transition-colors duration-300 line-clamp-2 leading-tight">
                        <Link href={`/product/${item.product.id}`}>
                          {item.product.name}
                        </Link>
                      </h3>

                      <p className="text-gray-400 text-sm mb-3">
                        {item.product.category} • {item.product.stock} in stock
                      </p>

                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl font-bold text-accent-400">
                          ₹{item.product.price}
                        </div>
                        {item.product.discount && item.product.discount > 0 && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                            -{item.product.discount}% off
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          Added {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-auto">
                      <button
                        className="flex-1 btn-primary text-xs sm:text-sm py-2 sm:py-3 flex items-center justify-center space-x-1 sm:space-x-2 min-h-[40px] sm:min-h-[48px]"
                        disabled={!item.product.isActive || item.product.stock === 0}
                        onClick={() => handleAddToCartClick(item.product)}
                      >
                        <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="truncate">
                          {!item.product.isActive ? 'Unavailable' :
                           item.product.stock === 0 ? 'Out of Stock' :
                           'Add to Cart'}
                        </span>
                      </button>

                      <Link
                        href={`/product/${item.product.id}`}
                        className="btn-secondary text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 flex items-center justify-center min-h-[40px] sm:min-h-[48px] flex-shrink-0"
                      >
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline ml-1">View</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Size Selection Modal */}
      {showSizeModal && selectedProduct && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSizeModal(false)
              setSelectedProduct(null)
              setSelectedSize('')
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-primary-900 border border-primary-700 rounded-lg p-6 max-w-md w-full"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Select Your Size</h3>
              <button
                onClick={() => {
                  setShowSizeModal(false)
                  setSelectedProduct(null)
                  setSelectedSize('')
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Info */}
            <div className="flex items-center gap-4 mb-6">
              <img
                src={selectedProduct.imageUrls[0] || '/placeholder.jpg'}
                alt={selectedProduct.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <h4 className="text-white font-medium">{selectedProduct.name}</h4>
                <p className="text-accent-400 font-bold">₹{selectedProduct.price}</p>
              </div>
            </div>

            {/* Size Options */}
            <div className="mb-6">
              <p className="text-gray-300 mb-3">Available Sizes:</p>
              <div className="grid grid-cols-3 gap-2">
                {selectedProduct.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 px-3 border rounded-lg text-sm font-medium transition-colors duration-200 ${
                      selectedSize === size
                        ? 'border-accent-500 bg-accent-500/10 text-accent-400'
                        : 'border-primary-700 text-gray-300 hover:border-accent-500 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {selectedSize && (
                <p className="text-sm text-gray-400 mt-2">
                  Selected: <span className="text-accent-400 font-medium">{selectedSize}</span>
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSizeModal(false)
                  setSelectedProduct(null)
                  setSelectedSize('')
                }}
                className="flex-1 py-2 px-4 border border-primary-700 text-gray-300 rounded-lg hover:border-primary-600 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSizeSelection}
                disabled={!selectedSize || addingToCart}
                className="flex-1 btn-primary py-2 px-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToCart ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
