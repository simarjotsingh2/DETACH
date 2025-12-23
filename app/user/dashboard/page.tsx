'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ShoppingCart, 
  Package, 
  Heart,
  User,
  Settings,
  LogOut,
  Eye,
  Star,
  Truck,
  CreditCard,
  MapPin,
  Bell,
  Home,
  Camera,
  ChevronDown,
  Trash2,
  ShoppingBag,
  Lock,
  EyeOff,
  Plus,
  Minus,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useWishlist } from '@/lib/useWishlist'
import { addToCart, readCart, writeCart, CartItem, updateQuantity, removeFromCart, isUserAuthenticated, setCurrentUserId, clearAllCartData, getCartItems, getCartTotal } from '@/lib/cart'

// Define user type
interface User {
  id: string
  name: string
  email: string
  role: string
  phoneNumber?: string
  countryCode?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  profileImage?: string
  createdAt: string
  updatedAt: string
}

interface Stats {
  totalOrders: number
  totalSpent: number
  wishlistItems: number
  loyaltyPoints: number
}

interface Order {
  id: string
  totalPrice: number
  status: string
  createdAt: string
  items: {
    id: string
    quantity: number
    price: number
    sizes: string
    product: {
      id: string
      name: string
      imageUrls: string[]
      category: string
    }
  }[]
}

export default function UserDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalSpent: 0, wishlistItems: 0, loyaltyPoints: 0 })
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartTotal, setCartTotal] = useState(0)
  const [cartLoading, setCartLoading] = useState(false)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null)
  
  // Profile form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    countryCode: '+91',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  })
  const [profileLoading, setProfileLoading] = useState(false)
  
  // Settings form states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Image upload states
  const [imageUploading, setImageUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Wishlist states (for size selection modal)
  const [showSizeModal, setShowSizeModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [addingToCart, setAddingToCart] = useState(false)
  const [isRemoving, setIsRemoving] = useState<string | null>(null)

  const { wishlist, addToWishlist, removeFromWishlist, fetchWishlist } = useWishlist()

  useEffect(() => {
    fetchUserData()
  }, [])

  // Populate profile form when user data is loaded
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        countryCode: user.countryCode || '+91',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zipCode || '',
        country: user.country || 'India'
      })
    }
  }, [user])

  // Load orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders()
    }
  }, [activeTab])

  // Load cart items when cart tab is active
  useEffect(() => {
    if (activeTab === 'cart') {
      loadCartItems()
    }
  }, [activeTab])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setStats(data.stats)
        setCurrentUserId(data.user.id)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadOrders = async () => {
    setOrdersLoading(true)
    try {
      const response = await fetch('/api/orders', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        toast.error('Failed to load orders')
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setOrdersLoading(false)
    }
  }

  const loadCartItems = async () => {
    setCartLoading(true)
    try {
      const items = await getCartItems()
      const total = await getCartTotal()
      setCartItems(items)
      setCartTotal(total)
    } catch (error) {
      console.error('Error loading cart items:', error)
      toast.error('Failed to load cart items')
    } finally {
      setCartLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        clearAllCartData()
        setCurrentUserId(null)
        toast.success('Logged out successfully')
        router.push('/')
      } else {
        toast.error('Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout failed')
    }
  }

  const goHome = () => {
    window.location.href = '/'
  }

  const handleTrackOrder = (order: Order) => {
    setSelectedOrderForTracking(order)
    setShowTrackingModal(true)
  }

  const handleViewInvoice = (order: Order) => {
    setSelectedOrderForInvoice(order)
    setShowInvoiceModal(true)
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate phone number
    if (profileForm.phoneNumber && profileForm.phoneNumber.length !== 10) {
      toast.error('Phone number must be exactly 10 digits')
      return
    }
    
    setProfileLoading(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(profileForm)
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        toast.success('Profile updated successfully!')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long')
      return
    }

    setPasswordLoading(true)

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      if (response.ok) {
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        toast.success('Password changed successfully!')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to change password')
      }
    } catch (error) {
      console.error('Password change error:', error)
      toast.error('Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setImageUploading(true)

    try {
      // Convert image to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64Image = e.target?.result as string

        try {
          const response = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
              profileImage: base64Image
            })
          })

          if (response.ok) {
            const data = await response.json()
            setUser(data.user)
            toast.success('Profile image updated successfully!')
          } else {
            const errorData = await response.json()
            toast.error(errorData.error || 'Failed to update profile image')
          }
        } catch (error) {
          console.error('Image upload error:', error)
          toast.error('Failed to update profile image')
        } finally {
          setImageUploading(false)
        }
      }

      reader.onerror = () => {
        toast.error('Failed to read image file')
        setImageUploading(false)
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error('Failed to upload image')
      setImageUploading(false)
    }
  }

  const handleCameraClick = () => {
    fileInputRef.current?.click()
  }

  // Wishlist handlers
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
      handleAddToCartFromWishlist(product, '')
    }
  }

  const handleAddToCartFromWishlist = async (product: any, size: string = '') => {
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
    handleAddToCartFromWishlist(selectedProduct, selectedSize)
  }

  const getTrackingSteps = (status: string) => {
    const steps = [
      { id: 'placed', label: 'Order Placed', completed: true },
      { id: 'packed', label: 'Order Packed', completed: false },
      { id: 'transit', label: 'In Transit', completed: false },
      { id: 'delivery', label: 'Out for delivery', completed: false },
      { id: 'delivered', label: 'Delivered', completed: false }
    ]

    switch (status) {
      case 'PENDING':
        return steps
      case 'PROCESSING':
        steps[1].completed = true
        return steps
      case 'SHIPPED':
        steps[1].completed = true
        steps[2].completed = true
        return steps
      case 'OUT_FOR_DELIVERY':
        steps[1].completed = true
        steps[2].completed = true
        steps[3].completed = true
        return steps
      case 'DELIVERED':
        return steps.map(step => ({ ...step, completed: true }))
      default:
        return steps
    }
  }

  const getUserInitials = (name: string): string => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((word: string) => word.charAt(0))
      .join('')
      .toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please log in</h1>
          <button 
            onClick={() => router.push('/login')}
            className="btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .bg-black, .bg-primary-900, .bg-primary-800, .bg-primary-700 {
            background-color: white !important;
            color: black !important;
          }
          .text-white, .text-gray-400, .text-gray-300 {
            color: black !important;
          }
          .border-primary-800, .border-primary-700 {
            border-color: #e5e7eb !important;
          }
          .bg-accent-400, .bg-accent-600 {
            background-color: #6366f1 !important;
            color: white !important;
          }
          .bg-green-600 {
            background-color: #10b981 !important;
            color: white !important;
          }
          .bg-blue-600 {
            background-color: #3b82f6 !important;
            color: white !important;
          }
          .bg-purple-600 {
            background-color: #8b5cf6 !important;
            color: white !important;
          }
          .bg-pink-600 {
            background-color: #ec4899 !important;
            color: white !important;
          }
          .bg-orange-600 {
            background-color: #f97316 !important;
            color: white !important;
          }
          .bg-yellow-600 {
            background-color: #eab308 !important;
            color: black !important;
          }
          .bg-red-600 {
            background-color: #ef4444 !important;
            color: white !important;
          }
          .bg-gray-50 {
            background-color: #f9fafb !important;
          }
          .bg-gray-100 {
            background-color: #f3f4f6 !important;
          }
          .bg-gray-200 {
            background-color: #e5e7eb !important;
          }
          .bg-gray-300 {
            background-color: #d1d5db !important;
          }
          .text-gray-500 {
            color: #6b7280 !important;
          }
          .text-gray-600 {
            color: #4b5563 !important;
          }
          .text-gray-700 {
            color: #374151 !important;
          }
          .text-gray-800 {
            color: #1f2937 !important;
          }
          .text-gray-900 {
            color: #111827 !important;
          }
          .text-accent-400 {
            color: #6366f1 !important;
          }
          .text-blue-400 {
            color: #3b82f6 !important;
          }
          .text-purple-400 {
            color: #8b5cf6 !important;
          }
          .text-green-400 {
            color: #10b981 !important;
          }
          .text-orange-400 {
            color: #f97316 !important;
          }
          .text-yellow-400 {
            color: #eab308 !important;
          }
          .text-red-400 {
            color: #ef4444 !important;
          }
          .text-purple-100 {
            color: #e9d5ff !important;
          }
          .text-yellow-100 {
            background-color: #fef3c7 !important;
            color: #92400e !important;
          }
          .text-blue-100 {
            background-color: #dbeafe !important;
            color: #1e40af !important;
          }
          .text-purple-100 {
            background-color: #e9d5ff !important;
            color: #6b21a8 !important;
          }
          .text-green-100 {
            background-color: #d1fae5 !important;
            color: #047857 !important;
          }
          .text-orange-100 {
            background-color: #fed7aa !important;
            color: #9a3412 !important;
          }
          .text-red-100 {
            background-color: #fecaca !important;
            color: #991b1b !important;
          }
          .border-gray-200 {
            border-color: #e5e7eb !important;
          }
          .border-gray-300 {
            border-color: #d1d5db !important;
          }
          .divide-y > :not([hidden]) ~ :not([hidden]) {
            border-color: #e5e7eb !important;
          }
          .divide-gray-200 > :not([hidden]) ~ :not([hidden]) {
            border-color: #e5e7eb !important;
          }
          .bg-gradient-to-r {
            background: linear-gradient(to right, #8b5cf6, #ec4899) !important;
          }
          .from-purple-600 {
            --tw-gradient-from: #9333ea !important;
          }
          .to-pink-600 {
            --tw-gradient-to: #db2777 !important;
          }
          .bg-primary-800\/50 {
            background-color: rgba(30, 41, 59, 0.5) !important;
          }
          .bg-primary-900\/50 {
            background-color: rgba(15, 23, 42, 0.5) !important;
          }
          .bg-yellow-600\/20 {
            background-color: rgba(234, 179, 8, 0.2) !important;
          }
          .bg-blue-600\/20 {
            background-color: rgba(59, 130, 246, 0.2) !important;
          }
          .bg-purple-600\/20 {
            background-color: rgba(139, 92, 246, 0.2) !important;
          }
          .bg-orange-600\/20 {
            background-color: rgba(249, 115, 22, 0.2) !important;
          }
          .bg-green-600\/20 {
            background-color: rgba(16, 185, 129, 0.2) !important;
          }
          .bg-red-600\/20 {
            background-color: rgba(239, 68, 68, 0.2) !important;
          }
          .bg-accent-600\/20 {
            background-color: rgba(99, 102, 241, 0.2) !important;
          }
          .bg-accent-400 {
            background-color: #6366f1 !important;
          }
          .bg-accent-600 {
            background-color: #4f46e5 !important;
          }
          .bg-green-600 {
            background-color: #059669 !important;
          }
          .bg-blue-600 {
            background-color: #2563eb !important;
          }
          .bg-purple-600 {
            background-color: #7c3aed !important;
          }
          .bg-pink-600 {
            background-color: #db2777 !important;
          }
          .bg-orange-600 {
            background-color: #ea580c !important;
          }
          .bg-yellow-600 {
            background-color: #d97706 !important;
          }
          .bg-red-600 {
            background-color: #dc2626 !important;
          }
          .text-accent-400 {
            color: #6366f1 !important;
          }
          .text-blue-400 {
            color: #3b82f6 !important;
          }
          .text-purple-400 {
            color: #8b5cf6 !important;
          }
          .text-green-400 {
            color: #10b981 !important;
          }
          .text-orange-400 {
            color: #f97316 !important;
          }
          .text-yellow-400 {
            color: #eab308 !important;
          }
          .text-red-400 {
            color: #ef4444 !important;
          }
          .text-purple-100 {
            color: #e9d5ff !important;
          }
          .text-yellow-100 {
            background-color: #fef3c7 !important;
            color: #92400e !important;
          }
          .text-blue-100 {
            background-color: #dbeafe !important;
            color: #1e40af !important;
          }
          .text-purple-100 {
            background-color: #e9d5ff !important;
            color: #6b21a8 !important;
          }
          .text-green-100 {
            background-color: #d1fae5 !important;
            color: #047857 !important;
          }
          .text-orange-100 {
            background-color: #fed7aa !important;
            color: #9a3412 !important;
          }
          .text-red-100 {
            background-color: #fecaca !important;
            color: #991b1b !important;
          }
          .border-gray-200 {
            border-color: #e5e7eb !important;
          }
          .border-gray-300 {
            border-color: #d1d5db !important;
          }
          .divide-y > :not([hidden]) ~ :not([hidden]) {
            border-color: #e5e7eb !important;
          }
          .divide-gray-200 > :not([hidden]) ~ :not([hidden]) {
            border-color: #e5e7eb !important;
          }
          .bg-gradient-to-r {
            background: linear-gradient(to right, #8b5cf6, #ec4899) !important;
          }
          .from-purple-600 {
            --tw-gradient-from: #9333ea !important;
          }
          .to-pink-600 {
            --tw-gradient-to: #db2777 !important;
          }
          .bg-primary-800\/50 {
            background-color: rgba(30, 41, 59, 0.5) !important;
          }
          .bg-primary-900\/50 {
            background-color: rgba(15, 23, 42, 0.5) !important;
          }
          .bg-yellow-600\/20 {
            background-color: rgba(234, 179, 8, 0.2) !important;
          }
          .bg-blue-600\/20 {
            background-color: rgba(59, 130, 246, 0.2) !important;
          }
          .bg-purple-600\/20 {
            background-color: rgba(139, 92, 246, 0.2) !important;
          }
          .bg-orange-600\/20 {
            background-color: rgba(249, 115, 22, 0.2) !important;
          }
          .bg-green-600\/20 {
            background-color: rgba(16, 185, 129, 0.2) !important;
          }
          .bg-red-600\/20 {
            background-color: rgba(239, 68, 68, 0.2) !important;
          }
          .bg-accent-600\/20 {
            background-color: rgba(99, 102, 241, 0.2) !important;
          }
        }
      `}</style>
      {/* Header */}
      <header className="bg-primary-900 border-b border-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-white">ROT KIT</h1>
              <div className="h-6 w-px bg-primary-700"></div>
              <h2 className="text-lg text-gray-300">My Account</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={goHome}
                className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
                title="Home"
              >
                <Home className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-accent-400 flex items-center justify-center text-white font-semibold text-sm">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getUserInitials(user.name)
                  )}
                </div>
                <span className="text-white font-medium">{user.name}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-primary-900 p-1 rounded-lg mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'orders', label: 'Orders', icon: Package },
            { id: 'wishlist', label: 'Wishlist', icon: Heart },
            { id: 'cart', label: 'Cart', icon: ShoppingCart },
            { id: 'profile', label: 'Profile', icon: Settings },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-accent-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-primary-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-primary-900 border border-primary-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Orders</p>
                    <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-accent-600/20 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-accent-400" />
                  </div>
                </div>
              </div>

              <div className="bg-primary-900 border border-primary-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Spent</p>
                    <p className="text-2xl font-bold text-white">₹{stats.totalSpent.toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 bg-accent-600/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-accent-400" />
                  </div>
                </div>
              </div>

              <div className="bg-primary-900 border border-primary-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Wishlist Items</p>
                    <p className="text-2xl font-bold text-white">{wishlist.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-accent-600/20 rounded-lg flex items-center justify-center">
                    <Heart className="w-6 h-6 text-accent-400" />
                  </div>
                </div>
              </div>

              <div className="bg-primary-900 border border-primary-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Loyalty Points</p>
                    <p className="text-2xl font-bold text-white">{stats.loyaltyPoints}</p>
                  </div>
                  <div className="w-12 h-12 bg-accent-600/20 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-accent-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-primary-900 border border-primary-800 rounded-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Recent Orders</h3>
                {stats.totalOrders > 0 && (
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-accent-400 hover:text-accent-300 transition-colors duration-200"
                  >
                    View All →
                  </button>
                )}
              </div>
              {stats.totalOrders === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-6">No orders yet</p>
                  <button
                    onClick={() => router.push('/shop')}
                    className="btn-primary"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-400 text-center">
                    You have {stats.totalOrders} order{stats.totalOrders !== 1 ? 's' : ''}. 
                    Click "View All" to see your order history.
                  </p>
                  <div className="text-center">
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="btn-primary"
                    >
                      View My Orders
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Your Orders</h2>
            
            {ordersLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-accent-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-6">No orders found</p>
                <button
                  onClick={() => router.push('/shop')}
                  className="btn-primary"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-primary-900 border border-primary-800 rounded-lg p-6">
                    {/* Order Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold">Order #{order.id.slice(-8)}</h3>
                        <p className="text-gray-400 text-sm">
                          {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-accent-400 font-bold text-lg">₹{order.totalPrice.toFixed(2)}</p>
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          order.status === 'PENDING' ? 'bg-yellow-600/20 text-yellow-400' :
                          order.status === 'PROCESSING' ? 'bg-blue-600/20 text-blue-400' :
                          order.status === 'SHIPPED' ? 'bg-purple-600/20 text-purple-400' :
                          order.status === 'OUT_FOR_DELIVERY' ? 'bg-orange-600/20 text-orange-400' :
                          order.status === 'DELIVERED' ? 'bg-green-600/20 text-green-400' :
                          'bg-red-600/20 text-red-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-primary-800/50 rounded-lg">
                          <img
                            src={item.product.imageUrls[0] || '/placeholder.jpg'}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="text-white font-medium text-sm">{item.product.name}</h4>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span>Qty: {item.quantity}</span>
                              <span>₹{item.price}</span>
                              {item.sizes && <span>Size: {item.sizes}</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Actions */}
                    <div className="mt-4 pt-4 border-t border-primary-700 flex justify-between items-center">
                      <div className="text-sm text-gray-400">
                        {order.status === 'DELIVERED' ? 'Delivered' : 
                         order.status === 'OUT_FOR_DELIVERY' ? 'Out for Delivery' :
                         order.status === 'SHIPPED' ? 'In Transit' :
                         order.status === 'PROCESSING' ? 'Being Prepared' :
                         'Order Placed'}
                      </div>
                      <div className="flex gap-2">
                        {order.status === 'DELIVERED' && (
                          <button className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white text-sm rounded-lg transition-colors duration-200">
                            Reorder
                          </button>
                        )}
                        <button 
                          onClick={() => handleTrackOrder(order)}
                          className="px-4 py-2 border border-primary-600 text-gray-300 hover:text-white hover:border-primary-500 text-sm rounded-lg transition-colors duration-200"
                        >
                          Track Order
                        </button>
                        <button 
                          onClick={() => handleViewInvoice(order)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors duration-200 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Invoice
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                  <span>❤️</span>
                  <span>My Wishlist</span>
                </h2>
                <p className="text-gray-400 mt-1">
                  {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
                </p>
              </div>
              <Link
                href="/wishlist"
                className="text-accent-400 hover:text-accent-300 transition-colors duration-200"
              >
                View Full Wishlist →
              </Link>
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
                <button
                  onClick={() => router.push('/shop')}
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Start Shopping</span>
                </button>
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
        )}

        {/* Cart Tab */}
        {activeTab === 'cart' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Your Cart</h2>
              <Link
                href="/cart"
                className="text-accent-400 hover:text-accent-300 transition-colors duration-200"
              >
                View Full Cart →
              </Link>
            </div>

            {cartLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-accent-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading cart...</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-6">Your cart is empty</p>
                <button
                  onClick={() => router.push('/shop')}
                  className="btn-primary"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cart Items */}
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.sizes || item.selectedSize || 'no-size'}`} className="bg-primary-900 border border-primary-800 rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-primary-700 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.imageUrl || '/placeholder.jpg'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium text-sm truncate">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-accent-400 font-bold">₹{item.price}</span>
                            {item.selectedSize && (
                              <span className="text-xs text-gray-400">Size: {item.selectedSize}</span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)}
                            className="w-8 h-8 rounded-full bg-primary-700 hover:bg-primary-600 text-gray-300 hover:text-white transition-colors duration-200 flex items-center justify-center"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          
                          <span className="w-8 text-center text-white font-medium">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
                            className="w-8 h-8 rounded-full bg-primary-700 hover:bg-primary-600 text-gray-300 hover:text-white transition-colors duration-200 flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-white font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.id, item.selectedSize)}
                          className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-colors duration-200 flex items-center justify-center"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Total */}
                <div className="bg-primary-900 border border-primary-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-white">Total</span>
                    <span className="text-2xl font-bold text-accent-400">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  
                  {/* Go to Cart Button */}
                  <Link
                    href="/cart"
                    className="w-full btn-primary py-3 text-center block"
                  >
                    Go to Cart
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white">Profile Information</h2>
            
            <div className="bg-primary-900 border border-primary-800 rounded-lg p-8">
              {/* Profile Header */}
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-accent-400 flex items-center justify-center text-white font-bold text-xl">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getUserInitials(user.name)
                    )}
                  </div>
                  <button 
                    onClick={handleCameraClick}
                    disabled={imageUploading}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent-600 rounded-full flex items-center justify-center text-white hover:bg-accent-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Upload profile image"
                  >
                    {imageUploading ? (
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Camera className="w-3 h-3" />
                    )}
                  </button>
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{user.name}</h3>
                  <p className="text-gray-400">{user.email}</p>
                </div>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-primary-800 border border-primary-700 text-white rounded-lg focus:border-accent-500 focus:outline-none transition-colors duration-300"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-primary-800 border border-primary-700 text-white rounded-lg focus:border-accent-500 focus:outline-none transition-colors duration-300"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  {/* Country Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Country Code
                    </label>
                    <div className="relative">
                      <select
                        value={profileForm.countryCode}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, countryCode: e.target.value }))}
                        className="w-full px-4 py-3 bg-primary-800 border border-primary-700 text-white rounded-lg focus:border-accent-500 focus:outline-none transition-colors duration-300 appearance-none cursor-pointer"
                      >
                        <option value="+91">+91 (India)</option>
                        <option value="+1">+1 (USA)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+61">+61 (Australia)</option>
                        <option value="+86">+86 (China)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phoneNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                        if (value.length <= 10) {
                          setProfileForm(prev => ({ ...prev, phoneNumber: value }));
                        }
                      }}
                      maxLength={10}
                      className={`w-full px-4 py-3 bg-primary-800 border ${
                        profileForm.phoneNumber && profileForm.phoneNumber.length !== 10 
                          ? 'border-red-500' 
                          : 'border-primary-700'
                      } text-white rounded-lg focus:border-accent-500 focus:outline-none transition-colors duration-300`}
                      placeholder="Enter 10-digit phone number"
                    />
                    {profileForm.phoneNumber && profileForm.phoneNumber.length > 0 && profileForm.phoneNumber.length !== 10 && (
                      <p className="text-red-400 text-sm mt-1">
                        Phone number must be exactly 10 digits ({profileForm.phoneNumber.length}/10)
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-3 bg-primary-800 border border-primary-700 text-white rounded-lg focus:border-accent-500 focus:outline-none transition-colors duration-300"
                      placeholder="Enter your address"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-4 py-3 bg-primary-800 border border-primary-700 text-white rounded-lg focus:border-accent-500 focus:outline-none transition-colors duration-300"
                      placeholder="Enter your city"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={profileForm.state}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full px-4 py-3 bg-primary-800 border border-primary-700 text-white rounded-lg focus:border-accent-500 focus:outline-none transition-colors duration-300"
                      placeholder="Enter your state"
                    />
                  </div>

                  {/* ZIP Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={profileForm.zipCode}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, zipCode: e.target.value }))}
                      className="w-full px-4 py-3 bg-primary-800 border border-primary-700 text-white rounded-lg focus:border-accent-500 focus:outline-none transition-colors duration-300"
                      placeholder="Enter your ZIP code"
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={profileForm.country}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full px-4 py-3 bg-primary-800 border border-primary-700 text-white rounded-lg focus:border-accent-500 focus:outline-none transition-colors duration-300"
                      placeholder="Enter your country"
                    />
                  </div>
                </div>

                {/* Update Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="w-full md:w-auto px-8 py-3 bg-accent-600 hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium"
                  >
                    {profileLoading ? 'Updating Profile...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white">Account Settings</h2>
            
            <div className="bg-primary-900 border border-primary-800 rounded-lg p-8">
              <div className="space-y-8">
                {/* Change Password Section */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-6">Change Password</h3>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full px-4 py-3 pr-12 bg-primary-800 border border-primary-700 text-white rounded-lg focus:border-accent-500 focus:outline-none transition-colors duration-300"
                          placeholder="Enter your current password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-4 py-3 pr-12 bg-primary-800 border border-primary-700 text-white rounded-lg focus:border-accent-500 focus:outline-none transition-colors duration-300"
                          placeholder="Enter your new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-4 py-3 pr-12 bg-primary-800 border border-primary-700 text-white rounded-lg focus:border-accent-500 focus:outline-none transition-colors duration-300"
                          placeholder="Confirm your new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Change Password Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="px-8 py-3 bg-accent-600 hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium"
                      >
                        {passwordLoading ? 'Changing Password...' : 'Change Password'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Account Actions */}
                <div className="pt-8 border-t border-primary-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Account Actions</h3>
                  <div className="space-y-4">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Tracking Modal */}
      {showTrackingModal && selectedOrderForTracking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-primary-900 border border-primary-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary-700">
              <div>
                <h3 className="text-xl font-semibold text-white">Order Tracking</h3>
                <p className="text-gray-400 text-sm">Tracking ID #{selectedOrderForTracking.id.slice(-8)}</p>
              </div>
              <button
                onClick={() => {
                  setShowTrackingModal(false)
                  setSelectedOrderForTracking(null)
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 text-center">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Order Number</p>
                  <p className="text-white font-semibold">{selectedOrderForTracking.id.slice(-8)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Order Placed</p>
                  <p className="text-white font-semibold">{new Date(selectedOrderForTracking.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Order Delivered</p>
                  <p className="text-white font-semibold">
                    {selectedOrderForTracking.status === 'DELIVERED' 
                      ? new Date(selectedOrderForTracking.createdAt).toLocaleDateString()
                      : 'Pending'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">No of Items</p>
                  <p className="text-white font-semibold">{selectedOrderForTracking.items.length} items</p>
                </div>
                <div className="md:col-span-4">
                  <p className="text-sm text-gray-400 mb-1">Status</p>
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    selectedOrderForTracking.status === 'PENDING' ? 'bg-yellow-600/20 text-yellow-400' :
                    selectedOrderForTracking.status === 'PROCESSING' ? 'bg-blue-600/20 text-blue-400' :
                    selectedOrderForTracking.status === 'SHIPPED' ? 'bg-purple-600/20 text-purple-400' :
                    selectedOrderForTracking.status === 'OUT_FOR_DELIVERY' ? 'bg-orange-600/20 text-orange-400' :
                    selectedOrderForTracking.status === 'DELIVERED' ? 'bg-green-600/20 text-green-400' :
                    'bg-red-600/20 text-red-400'
                  }`}>
                    {selectedOrderForTracking.status}
                  </span>
                </div>
              </div>

              {/* Tracking Progress */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-white mb-6">Order Tracking</h4>
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-6 left-6 right-6 h-1 bg-primary-700">
                    <div 
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-500"
                      style={{ 
                        width: `${(getTrackingSteps(selectedOrderForTracking.status).filter(s => s.completed).length - 1) * 25}%` 
                      }}
                    ></div>
                  </div>
                  
                  {/* Tracking Steps */}
                  <div className="flex justify-between relative">
                    {getTrackingSteps(selectedOrderForTracking.status).map((step, index) => (
                      <div key={step.id} className="flex flex-col items-center">
                        {/* Step Icon */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                          step.completed 
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                            : 'bg-primary-700 text-gray-400'
                        }`}>
                          {step.id === 'placed' && <ShoppingCart className="w-6 h-6" />}
                          {step.id === 'packed' && <Package className="w-6 h-6" />}
                          {step.id === 'transit' && <Truck className="w-6 h-6" />}
                          {step.id === 'delivery' && <ShoppingBag className="w-6 h-6" />}
                          {step.id === 'delivered' && <Home className="w-6 h-6" />}
                        </div>
                        
                        {/* Step Label */}
                        <div className="text-center">
                          <p className={`text-sm font-medium mb-1 ${
                            step.completed ? 'text-white' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </p>
                          <p className="text-xs text-gray-500">
                            {step.completed 
                              ? new Date(selectedOrderForTracking.createdAt).toLocaleDateString()
                              : 'Pending'
                            }
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-4">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrderForTracking.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-primary-900/50 rounded-lg">
                      <img
                        src={item.product.imageUrls[0] || '/placeholder.jpg'}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h5 className="text-white font-medium text-sm">{item.product.name}</h5>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>Qty: {item.quantity}</span>
                          <span>₹{item.price}</span>
                          {item.sizes && <span>Size: {item.sizes}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Total */}
                <div className="mt-4 pt-4 border-t border-primary-700">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-white">Total Amount:</span>
                    <span className="text-xl font-bold text-accent-400">₹{selectedOrderForTracking.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && selectedOrderForInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Invoice Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">INVOICE</h2>
                  <p className="text-purple-100 mt-1">#{selectedOrderForInvoice.id.slice(-8)}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">ROT KIT</div>
                  <p className="text-purple-100 text-sm">Fashion & Lifestyle</p>
                </div>
              </div>
            </div>

            {/* Invoice Content */}
            <div className="p-8">
              {/* Company & Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Company Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">From</h3>
                  <div className="text-gray-600">
                    <p className="font-semibold text-gray-800">ROT KIT</p>
                    <p>123 Fashion Street</p>
                    <p>Mumbai, Maharashtra 400001</p>
                    <p>India</p>
                    <p className="mt-2">Email: support@rotkit.com</p>
                    <p>Phone: +91 98765 43210</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Bill To</h3>
                  <div className="text-gray-600">
                    <p className="font-semibold text-gray-800">{user?.name}</p>
                    <p>{user?.email}</p>
                    {user?.phoneNumber && <p>Phone: {user.phoneNumber}</p>}
                    {user?.address && <p>{user.address}</p>}
                    {user?.city && <p>{user.city}</p>}
                    {user?.state && <p>{user.state}</p>}
                    {user?.zipCode && <p>{user.zipCode}</p>}
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Details</h3>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Order Number:</span>
                      <span className="font-semibold">#{selectedOrderForInvoice.id.slice(-8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Order Date:</span>
                      <span className="font-semibold">{new Date(selectedOrderForInvoice.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Order Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        selectedOrderForInvoice.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        selectedOrderForInvoice.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                        selectedOrderForInvoice.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                        selectedOrderForInvoice.status === 'OUT_FOR_DELIVERY' ? 'bg-orange-100 text-orange-800' :
                        selectedOrderForInvoice.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedOrderForInvoice.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Info</h3>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="font-semibold">Online Payment</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transaction ID:</span>
                      <span className="font-semibold">RZP{selectedOrderForInvoice.id.slice(-8)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h3>
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrderForInvoice.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={item.product.imageUrls[0] || '/placeholder.jpg'}
                                alt={item.product.name}
                                className="w-10 h-10 rounded-lg object-cover mr-3"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                                <div className="text-sm text-gray-500">{item.product.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.sizes || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{item.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-end">
                  <div className="w-64">
                    <div className="flex justify-between text-gray-600 mb-2">
                      <span>Subtotal:</span>
                      <span>₹{selectedOrderForInvoice.totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 mb-2">
                      <span>Shipping:</span>
                      <span>₹0.00</span>
                    </div>
                    <div className="flex justify-between text-gray-600 mb-2">
                      <span>Tax:</span>
                      <span>₹0.00</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Total:</span>
                        <span>₹{selectedOrderForInvoice.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center text-gray-500 text-sm">
                  <p>Thank you for shopping with ROT KIT!</p>
                  <p className="mt-1">For any queries, please contact support@rotkit.com</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowInvoiceModal(false)
                  setSelectedOrderForInvoice(null)
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Invoice
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Size Selection Modal for Wishlist */}
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
