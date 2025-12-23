'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react'
import { getCartItems, updateQuantity, removeFromCart, clearCart, getCartTotal, isUserAuthenticated } from '@/lib/cart'
import { CartItem } from '@/lib/cart'
import toast from 'react-hot-toast'

interface EnhancedCartProps {
  isOpen: boolean
  onClose: () => void
}

export default function EnhancedCart({ isOpen, onClose }: EnhancedCartProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  const loadCartItems = async () => {
    if (!isUserAuthenticated()) {
      setCartItems([])
      setTotal(0)
      return
    }

    setLoading(true)
    try {
      const items = await getCartItems()
      const cartTotal = await getCartTotal()
      setCartItems(items)
      setTotal(cartTotal)
    } catch (error) {
      console.error('Error loading cart items:', error)
      toast.error('Failed to load cart items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadCartItems()
    }
  }, [isOpen])

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 0) return

    setLoading(true)
    try {
      const currentItem = cartItems.find(ci => ci.productId === productId)
      const result = await updateQuantity(productId, newQuantity, currentItem?.selectedSize)
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
      setLoading(false)
    }
  }

  const handleRemoveItem = async (productId: string) => {
    setLoading(true)
    try {
      const currentItem = cartItems.find(ci => ci.productId === productId)
      const result = await removeFromCart(productId, currentItem?.selectedSize)
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
      setLoading(false)
    }
  }

  const handleClearCart = async () => {
    setLoading(true)
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
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Cart Panel */}
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ duration: 0.3 }}
            className="relative bg-primary-900 border border-primary-800 rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary-800">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-accent-400" />
                <h2 className="text-xl font-semibold text-white">Shopping Cart</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Content */}
            <div className="flex flex-col h-full max-h-[calc(80vh-140px)]">
              {!isUserAuthenticated() ? (
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center">
                    <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">Please login to view your cart</p>
                    <button
                      onClick={onClose}
                      className="btn-primary"
                    >
                      Go to Login
                    </button>
                  </div>
                </div>
              ) : loading ? (
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-accent-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading cart...</p>
                  </div>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center">
                    <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">Your cart is empty</p>
                    <button
                      onClick={onClose}
                      className="btn-primary"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex items-center gap-4 p-4 bg-primary-800 rounded-lg"
                      >
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-primary-700 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium text-sm line-clamp-2 mb-1">
                            {item.name}
                          </h3>
                          <p className="text-accent-400 font-semibold">
                            ₹{item.price}
                          </p>
                          {item.selectedSize && (
                            <p className="text-xs text-gray-400 mt-1">
                              Size: {item.selectedSize}
                            </p>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            disabled={loading || item.quantity <= 1}
                            className="w-8 h-8 rounded-full bg-primary-700 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
                          >
                            <Minus className="w-4 h-4 text-white" />
                          </button>
                          <span className="w-8 text-center text-white font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            disabled={loading}
                            className="w-8 h-8 rounded-full bg-primary-700 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
                          >
                            <Plus className="w-4 h-4 text-white" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.productId)}
                          disabled={loading}
                          className="p-2 text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Cart Footer */}
                  <div className="border-t border-primary-800 p-6 space-y-4">
                    {/* Total */}
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-white">Total:</span>
                      <span className="text-xl font-bold text-accent-400">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleClearCart}
                        disabled={loading}
                        className="flex-1 px-4 py-2 border border-red-600 text-red-400 hover:bg-red-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 rounded-lg"
                      >
                        Clear Cart
                      </button>
                      <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-primary-700 text-gray-300 hover:border-primary-600 hover:text-white transition-colors duration-200 rounded-lg"
                      >
                        Continue Shopping
                      </button>
                      <button
                        onClick={() => {
                          // Navigate to checkout
                          onClose()
                          // Add checkout navigation here
                        }}
                        className="flex-1 btn-primary"
                      >
                        Checkout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
