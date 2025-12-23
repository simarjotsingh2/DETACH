// Enhanced cart service that integrates with database and handles stock reservation
import { CartItem } from './cart'

export interface DatabaseCartItem {
  id: string
  userId: string
  productId: string
  quantity: number
  sizes?: string
  addedAt: Date
  product: {
    id: string
    name: string
    price: number
    originalPrice?: number
    imageUrls: string[]
    stock: number
  }
}

export class CartService {
  private static instance: CartService
  private cleanupInterval: NodeJS.Timeout | null = null

  private constructor() {
    this.startCleanupService()
  }

  public static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService()
    }
    return CartService.instance
  }

  // Start background cleanup service
  private startCleanupService() {
    // Run cleanup every hour
    this.cleanupInterval = setInterval(async () => {
      try {
        await this.cleanupExpiredCartItems()
      } catch (error) {
        console.error('Cart cleanup error:', error)
      }
    }, 60 * 60 * 1000) // 1 hour
  }

  // Clean up expired cart items
  private async cleanupExpiredCartItems() {
    try {
      const response = await fetch('/api/cart/cleanup', {
        method: 'POST',
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Cart cleanup completed:', result)
      }
    } catch (error) {
      console.error('Failed to cleanup cart:', error)
    }
  }

  // Add item to database cart (for authenticated users)
  public async addToDbCart(productId: string, quantity: number = 1, sizes?: string): Promise<boolean> {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity, sizes }),
      })

      if (response.ok) {
        return true
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add to cart')
      }
    } catch (error) {
      console.error('Error adding to database cart:', error)
      return false
    }
  }

  // Get database cart items (for authenticated users)
  public async getDbCart(): Promise<DatabaseCartItem[]> {
    try {
      const response = await fetch('/api/cart')
      
      if (response.ok) {
        const data = await response.json()
        return data.cartItems || []
      } else {
        console.error('Failed to fetch cart items')
        return []
      }
    } catch (error) {
      console.error('Error fetching database cart:', error)
      return []
    }
  }

  // Remove item from database cart
  public async removeFromDbCart(productId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      return response.ok
    } catch (error) {
      console.error('Error removing from database cart:', error)
      return false
    }
  }

  // Clear entire database cart
  public async clearDbCart(): Promise<boolean> {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      return response.ok
    } catch (error) {
      console.error('Error clearing database cart:', error)
      return false
    }
  }

  // Sync local cart with database cart (for when user logs in)
  public async syncLocalToDbCart(localCartItems: CartItem[]): Promise<void> {
    for (const item of localCartItems) {
      try {
        await this.addToDbCart(item.id, item.quantity)
      } catch (error) {
        console.error(`Failed to sync item ${item.id}:`, error)
      }
    }
  }

  // Convert database cart items to local cart format
  public dbCartToLocalCart(dbItems: DatabaseCartItem[]): CartItem[] {
    return dbItems.map(item => ({
      id: item.productId,
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      imageUrl: item.product.imageUrls[0] || '/placeholder.jpg',
      quantity: item.quantity,
      selectedSize: item.sizes,
      addedAt: new Date(item.addedAt).getTime()
    }))
  }

  // Stop cleanup service
  public stopCleanupService() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// Initialize the cart service
export const cartService = CartService.getInstance()
