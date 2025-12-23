'use client'

import { useState, useRef } from 'react'
import { Heart } from 'lucide-react'
import { useWishlist } from '@/lib/useWishlist'
import { useFlyingHeart } from '@/lib/FlyingHeartContext'

interface WishlistButtonProps {
  productId: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export default function WishlistButton({ 
  productId, 
  className = '', 
  size = 'md',
  showText = false 
}: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist, isLoading } = useWishlist()
  const { triggerFlyingHeart } = useFlyingHeart()
  const [isAnimating, setIsAnimating] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = async () => {
    if (isLoading) return
    
    const wasInWishlist = isInWishlist(productId)
    const success = await toggleWishlist(productId)
    
    if (success && !wasInWishlist) {
      // Only trigger flying heart when adding to wishlist
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        console.log('🚀 Triggering flying heart from:', rect.left, rect.top)
        
        // Add a small delay to ensure the button animation completes first
        setTimeout(() => {
          triggerFlyingHeart({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          })
          console.log('💖 Flying heart animation started!')
        }, 100)
      }
    }
    
    if (success) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const isWishlisted = isInWishlist(productId)

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        ${className}
        relative flex items-center justify-center
        rounded-full transition-all duration-300
        ${isWishlisted 
          ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
          : 'bg-gray-500/20 text-gray-400 hover:bg-red-500/20 hover:text-red-500'
        }
        ${isAnimating ? 'scale-110' : 'hover:scale-105'}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        group
      `}
      title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart 
        className={`
          ${iconSizes[size]}
          transition-all duration-300
          ${isWishlisted ? 'fill-current' : ''}
          ${isAnimating ? 'scale-125' : ''}
        `}
      />
      
      {showText && (
        <span className="ml-2 text-sm font-medium">
          {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
        </span>
      )}
      
      {/* Ripple effect */}
      {isAnimating && (
        <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
      )}
    </button>
  )
}
