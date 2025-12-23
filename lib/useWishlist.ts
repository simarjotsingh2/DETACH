import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { isUserAuthenticated } from './cart'

interface WishlistItem {
  id: string
  product: {
    id: string
    name: string
    price: number
    originalPrice?: number
    discount?: number
    imageUrls: string[]
    isActive: boolean
    stock: number
  }
  createdAt: string
}

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchWishlist = async () => {
    // Check if user is authenticated before making API call
    if (!isUserAuthenticated()) {
      setWishlist([])
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/wishlist', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setWishlist(data.wishlist || [])
      } else if (response.status === 401) {
        // User is not authenticated
        setWishlist([])
      } else {
        console.error('Failed to fetch wishlist:', response.status)
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addToWishlist = async (productId: string) => {
    // Check if user is authenticated before making API call
    if (!isUserAuthenticated()) {
      // Redirect to login page with wishlist message
      if (typeof window !== 'undefined') {
        window.location.href = '/login?message=wishlist'
      }
      return false
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
        credentials: 'include'
      })

      if (response.ok) {
        const newItem = await response.json()
        setWishlist(prev => [newItem, ...prev])
        return true
      } else if (response.status === 401) {
        // Redirect to login page with wishlist message
        if (typeof window !== 'undefined') {
          window.location.href = '/login?message=wishlist'
        }
        return false
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add to wishlist')
        return false
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      toast.error('Failed to add to wishlist')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromWishlist = async (productId: string) => {
    // Check if user is authenticated before making API call
    if (!isUserAuthenticated()) {
      // Redirect to login page with wishlist message
      if (typeof window !== 'undefined') {
        window.location.href = '/login?message=wishlist'
      }
      return false
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setWishlist(prev => prev.filter(item => item.product.id !== productId))
        return true
      } else if (response.status === 401) {
        // Redirect to login page with wishlist message
        if (typeof window !== 'undefined') {
          window.location.href = '/login?message=wishlist'
        }
        return false
      } else {
        toast.error('Failed to remove from wishlist')
        return false
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      toast.error('Failed to remove from wishlist')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.product.id === productId)
  }

  const toggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId)
    } else {
      return await addToWishlist(productId)
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [])

  return {
    wishlist,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    fetchWishlist
  }
}
