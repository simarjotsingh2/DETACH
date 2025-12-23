"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  ArrowLeft,
  X,
  ChevronDown
} from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { getCartItems, updateQuantity, removeFromCart, clearCart, getCartTotal, isUserAuthenticated } from '@/lib/cart'
import { CartItem } from '@/lib/cart'
import toast from 'react-hot-toast'

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [updating, setUpdating] = useState<string | null>(null)
  const [selectedSizes, setSelectedSizes] = useState<{[key: string]: string}>({})

  const loadCartItems = async () => {
    if (!isUserAuthenticated()) {
      setCartItems([])
      setTotal(0)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const items = await getCartItems()
      const cartTotal = await getCartTotal()
      setCartItems(items)
      setTotal(cartTotal)
      
      // Initialize selected sizes for items that have sizes
      const initialSizes: {[key: string]: string} = {}
      items.forEach(item => {
        if (item.sizes && item.sizes.length > 0) {
          initialSizes[item.id] = item.selectedSize || item.sizes[0]
        }
      })
      setSelectedSizes(initialSizes)
    } catch (error) {
      console.error('Error loading cart items:', error)
      toast.error('Failed to load cart items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCartItems()
  }, [])

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 0) return

    setUpdating(productId)
    try {
      const currentItem = cartItems.find(ci => ci.productId === productId)
      const size = currentItem ? (selectedSizes[currentItem.id] || currentItem.selectedSize) : undefined
      const result = await updateQuantity(productId, newQuantity, size)
      if (result.success) {
        await loadCartItems() // Reload cart items
        toast.success('Cart updated')
      } else {
        toast.error(result.message || 'Failed to update quantity')
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast.error('Failed to update quantity')
    } finally {
      setUpdating(null)
    }
  }

  const handleRemoveItem = async (productId: string) => {
    setUpdating(productId)
    try {
      const currentItem = cartItems.find(ci => ci.productId === productId)
      const size = currentItem ? (selectedSizes[currentItem.id] || currentItem.selectedSize) : undefined
      const result = await removeFromCart(productId, size)
      if (result.success) {
        await loadCartItems() // Reload cart items
        toast.success('Item removed from cart')
      } else {
        toast.error(result.message || 'Failed to remove item')
      }
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error('Failed to remove item')
    } finally {
      setUpdating(null)
    }
  }

  const handleClearCart = async () => {
    setUpdating('clear')
    try {
      const result = await clearCart()
      if (result.success) {
        setCartItems([])
        setTotal(0)
        toast.success('Cart cleared')
      } else {
        toast.error(result.message || 'Failed to clear cart')
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast.error('Failed to clear cart')
    } finally {
      setUpdating(null)
    }
  }

  const handleSizeChange = async (itemId: string, productId: string, newSize: string) => {
    // Update local state immediately for UI responsiveness
    setSelectedSizes(prev => ({
      ...prev,
      [itemId]: newSize
    }))
    
    setUpdating(productId)
    try {
      // Find the current item to get its quantity
      const currentItem = cartItems.find(item => item.productId === productId)
      if (!currentItem) return
      
      // Update the size in the database by calling updateQuantity with the new size
      const result = await updateQuantity(productId, currentItem.quantity, newSize)
      if (result.success) {
        toast.success('Size updated')
        // Reload cart items to get the updated data
        await loadCartItems()
      } else {
        // Revert local state if API call failed
        setSelectedSizes(prev => ({
          ...prev,
          [itemId]: currentItem.selectedSize || currentItem.sizes?.[0] || ''
        }))
        toast.error(result.message || 'Failed to update size')
      }
    } catch (error) {
      console.error('Error updating size:', error)
      // Revert local state if API call failed
      const currentItem = cartItems.find(item => item.productId === productId)
      if (currentItem) {
        setSelectedSizes(prev => ({
          ...prev,
          [itemId]: currentItem.selectedSize || currentItem.sizes?.[0] || ''
        }))
      }
      toast.error('Failed to update size')
    } finally {
      setUpdating(null)
    }
  }

  const handleCheckout = () => {
    // Navigate to checkout page
    router.push('/checkout')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-accent-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading cart...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </button>

          {!isUserAuthenticated() ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-24 h-24 text-gray-600 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-white mb-4">Please Login</h1>
              <p className="text-gray-400 mb-8">You need to be logged in to view your cart</p>
              <button
                onClick={() => router.push('/login')}
                className="btn-primary"
              >
                Go to Login
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-24 h-24 text-gray-600 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-white mb-4">Your Cart is Empty</h1>
              <p className="text-gray-400 mb-8">Add some products to get started</p>
              <button
                onClick={() => router.push('/shop')}
                className="btn-primary"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">Your Cart</h1>
                  <p className="text-gray-400">Review your items and proceed to checkout</p>
                </div>

                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-primary-900 border border-primary-800 rounded-lg p-6"
                    >
                      <div className="flex items-center gap-6">
                        {/* Product Image */}
                        <Link 
                          href={`/product/${item.productId}`}
                          className="w-20 h-20 bg-primary-700 rounded-lg overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-accent-500 transition-all duration-200"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </Link>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <Link 
                            href={`/product/${item.productId}`}
                            className="block"
                          >
                            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 hover:text-accent-400 transition-colors duration-200">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-accent-400 font-bold text-xl">
                            ₹{item.price}
                          </p>
                          {item.sizes && item.sizes.length > 0 && (
                            <div className="mt-3">
                              <label className="text-sm text-gray-400 block mb-1">Size:</label>
                              <div className="relative">
                                <select
                                  value={selectedSizes[item.id] || item.selectedSize || item.sizes[0]}
                                  onChange={(e) => handleSizeChange(item.id, item.productId, e.target.value)}
                                  disabled={updating === item.productId}
                                  className="bg-primary-700 border border-primary-600 text-white text-sm rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer hover:border-accent-500 focus:border-accent-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {item.sizes.map((size) => (
                                    <option key={size} value={size} className="bg-primary-700">
                                      {size}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            disabled={updating === item.productId || item.quantity <= 1}
                            className="w-10 h-10 rounded-lg bg-primary-700 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
                          >
                            <Minus className="w-4 h-4 text-white" />
                          </button>
                          <span className="w-12 text-center text-white font-medium text-lg">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            disabled={updating === item.productId}
                            className="w-10 h-10 rounded-lg bg-primary-700 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
                          >
                            <Plus className="w-4 h-4 text-white" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-white font-bold text-lg">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.productId)}
                          disabled={updating === item.productId}
                          className="p-2 text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-primary-900 border border-primary-800 rounded-lg p-6 sticky top-24">
                  <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Subtotal</span>
                      <span className="text-white font-semibold">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Shipping</span>
                      <span className="text-gray-300">Calculated at checkout</span>
                    </div>
                  </div>

                  <div className="border-t border-primary-700 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-white">Total</span>
                      <span className="text-xl font-bold text-accent-400">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleCheckout}
                      className="w-full btn-primary text-lg py-3"
                    >
                      Checkout
                    </button>
                    <button
                      onClick={handleClearCart}
                      disabled={updating === 'clear'}
                      className="w-full px-4 py-3 border border-red-600 text-red-400 hover:bg-red-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 rounded-lg"
                    >
                      {updating === 'clear' ? 'Clearing...' : 'Clear Cart'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}


