export interface CartItem {
  id: string
  name: string
  price: number
  imageUrl: string
  quantity: number
  addedAt: number // timestamp
  productId: string
  sizes?: string[]
  selectedSize?: string
}

// Check if user is authenticated
export function isUserAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return !!window.localStorage.getItem('current_user_id')
  } catch {
    return false
  }
}

// Get current user ID from localStorage
function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem('current_user_id')
  } catch {
    return null
  }
}

// Set current user ID in localStorage
export function setCurrentUserId(userId: string | null) {
  if (typeof window === 'undefined') return
  try {
    if (userId) {
      window.localStorage.setItem('current_user_id', userId)
    } else {
      window.localStorage.removeItem('current_user_id')
    }
  } catch (error) {
    console.error('Error setting user ID:', error)
  }
}

// Add item to cart (database-based)
export async function addToCart(item: Omit<CartItem, 'quantity' | 'addedAt' | 'productId'>, quantity: number = 1, selectedSize?: string): Promise<{ success: boolean; message?: string; availableStock?: number; requiresLogin?: boolean }> {
  try {
    // Check if user is authenticated
    if (!isUserAuthenticated()) {
      // Redirect to login page with cart message
      if (typeof window !== 'undefined') {
        window.location.href = '/login?message=cart'
      }
      return { 
        success: false, 
        requiresLogin: true,
        message: 'Please login to add products to the cart'
      }
    }

    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        productId: item.id,
        quantity: quantity,
        sizes: selectedSize
      })
    })

    if (response.ok) {
      return { success: true }
    } else {
      const error = await response.json()
      return { 
        success: false, 
        message: error.error || 'Failed to add to cart',
        availableStock: error.availableStock
      }
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    return { 
      success: false, 
      message: 'Failed to add to cart' 
    }
  }
}

// Get cart items (database-based)
export async function getCartItems(): Promise<CartItem[]> {
  try {
    if (!isUserAuthenticated()) {
      return []
    }

    const response = await fetch('/api/cart', {
      credentials: 'include'
    })

    if (response.ok) {
      const data = await response.json()
      return data.cartItems.map((item: any) => ({
        id: `${item.product.id}:${item.sizes ?? ''}`,
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        imageUrl: item.product.imageUrls[0] || '/placeholder.jpg',
        quantity: item.quantity,
        addedAt: new Date(item.addedAt).getTime(),
        sizes: item.product.sizes || [],
        selectedSize: item.sizes
      }))
    } else {
      console.error('Failed to fetch cart items')
      return []
    }
  } catch (error) {
    console.error('Error fetching cart items:', error)
    return []
  }
}

// Update cart item quantity (database-based)
export async function updateQuantity(productId: string, quantity: number, selectedSize?: string): Promise<{ success: boolean; message?: string }> {
  try {
    if (!isUserAuthenticated()) {
      return { 
        success: false, 
        message: 'Please login to update cart' 
      }
    }

    const response = await fetch('/api/cart', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        productId: productId,
        quantity: quantity,
        sizes: selectedSize
      })
    })

    if (response.ok) {
      return { success: true }
    } else {
      const error = await response.json()
      return { 
        success: false, 
        message: error.error || 'Failed to update quantity' 
      }
    }
  } catch (error) {
    console.error('Error updating quantity:', error)
    return { 
      success: false, 
      message: 'Failed to update quantity' 
    }
  }
}

// Remove item from cart (database-based)
export async function removeFromCart(productId: string, selectedSize?: string): Promise<{ success: boolean; message?: string }> {
  try {
    if (!isUserAuthenticated()) {
      return { 
        success: false, 
        message: 'Please login to remove items from cart' 
      }
    }

    const response = await fetch('/api/cart', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        productId: productId,
        sizes: selectedSize
      })
    })

    if (response.ok) {
      return { success: true }
    } else {
      const error = await response.json()
      return { 
        success: false, 
        message: error.error || 'Failed to remove item' 
      }
    }
  } catch (error) {
    console.error('Error removing from cart:', error)
    return { 
      success: false, 
      message: 'Failed to remove item' 
    }
  }
}

// Clear entire cart (database-based)
export async function clearCart(): Promise<{ success: boolean; message?: string }> {
  try {
    if (!isUserAuthenticated()) {
      return { 
        success: false, 
        message: 'Please login to clear cart' 
      }
    }

    const response = await fetch('/api/cart', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({})
    })

    if (response.ok) {
      return { success: true }
    } else {
      const error = await response.json()
      return { 
        success: false, 
        message: error.error || 'Failed to clear cart' 
      }
    }
  } catch (error) {
    console.error('Error clearing cart:', error)
    return { 
      success: false, 
      message: 'Failed to clear cart' 
    }
  }
}

// Get cart count (database-based)
export async function getCartCount(): Promise<number> {
  try {
    const cartItems = await getCartItems()
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  } catch (error) {
    console.error('Error getting cart count:', error)
    return 0
  }
}

// Get cart total (database-based)
export async function getCartTotal(): Promise<number> {
  try {
    const cartItems = await getCartItems()
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  } catch (error) {
    console.error('Error getting cart total:', error)
    return 0
  }
}

// Clear all cart data (for logout)
export function clearAllCartData() {
  if (typeof window === 'undefined') return
  try {
    // Clear localStorage cart data (for backward compatibility)
    const keys = Object.keys(window.localStorage)
    keys.forEach(key => {
      if (key.startsWith('rk_cart_v3_')) {
        window.localStorage.removeItem(key)
      }
    })
    window.localStorage.removeItem('current_user_id')
  } catch (error) {
    console.error('Error clearing cart data:', error)
  }
}

// Legacy functions for backward compatibility
export function readCart(): CartItem[] {
  // This function is now async in the new system
  // Return empty array for backward compatibility
  return []
}

export function writeCart(items: CartItem[]): void {
  // This function is now handled by API calls
  // No-op for backward compatibility
}

export function cartCount(): number {
  // This function is now async in the new system
  // Return 0 for backward compatibility
  return 0
}

export function cartTotal(): number {
  // This function is now async in the new system
  // Return 0 for backward compatibility
  return 0
}


