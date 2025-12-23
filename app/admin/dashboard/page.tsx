'use client'

import AddProductModal from '@/components/admin/AddProductModal'
import EditProductModal from '@/components/admin/EditProductModal'
import { clearAllCartData } from '@/lib/cart'
import { motion } from 'framer-motion'
import {
  Camera,
  CheckCircle,
  DollarSign,
  Edit,
  Eye,
  Key,
  Lock,
  LogOut,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Star,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  XCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

// Define admin type
interface Admin {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  profileImage?: string
  bio?: string
  department?: string
  permissions: string[]
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

// Define types
interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  stock: number
  category: string
  imageUrls: string[]
  sizes: string[]
  isFeatured: boolean
  discount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Order {
  id: string
  userId: string
  totalPrice: number
  status: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
  }
  items: {
    id: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
      imageUrls: string[]
    }
  }[]
}

interface User {
  id: string
  name: string
  email: string
  role: string
  phoneNumber?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  _count: {
    orders: number
  }
}

interface Analytics {
  overview: {
    totalUsers: number
    totalOrders: number
    totalRevenue: number
    monthlyGrowth: number
    weeklyOrderGrowth: number
    monthlyRevenueGrowth: number
    monthlyProductGrowth: number
  }
  recentOrders: Order[]
  topProducts: any[]
  dailyStats: any[]
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [wishlistItems, setWishlistItems] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [websitePage, setWebsitePage] = useState('home')
  const [iframeKey, setIframeKey] = useState(0)
  const [productPositions, setProductPositions] = useState<{[key: string]: number}>({})
  const router = useRouter()

  // Add these state variables after the existing useState declarations
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    department: '',
    bio: '',
    profileImage: ''
  })

  // Add these state variables after the existing useState declarations
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // Order details modal state
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderDetails, setOrderDetails] = useState<any>(null)

  // Add this useEffect to populate profile data when admin loads
  useEffect(() => {
    if (admin) {
      setProfileData({
        firstName: admin.firstName || '',
        lastName: admin.lastName || '',
        email: admin.email || '',
        phoneNumber: admin.phoneNumber || '',
        department: admin.department || '',
        bio: admin.bio || '',
        profileImage: admin.profileImage || ''
      })
    }
  }, [admin])

  // Check admin authentication on component mount
  useEffect(() => {
    checkAdminAuth()
  }, [])

  // Load all data immediately when admin is authenticated
  useEffect(() => {
    if (admin) {
      const loadAllData = async () => {
        try {
          await Promise.all([
            loadProducts(),
            loadUsers(),
            loadOrders(),
            loadAnalytics(),
            loadWishlist()
          ])
        } catch (error) {
          console.error('Error loading initial data:', error)
          toast.error('Failed to load some data')
        }
      }
      loadAllData()
    }
  }, [admin])

  useEffect(() => {
    if (admin && activeTab !== 'overview') {
      loadData()
    }
  }, [admin, activeTab])

  const checkAdminAuth = async () => {
    try {
      const response = await fetch('/api/auth/admin/me', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setAdmin(data.admin)
      } else {
        // If not authenticated, redirect to admin login
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error checking admin auth:', error)
      router.push('/admin')
    } finally {
      setIsLoading(false)
    }
  }

  const loadData = async () => {
    try {
      switch (activeTab) {
        case 'products':
          await loadProducts()
          break
        case 'orders':
          await loadOrders()
          break
        case 'users':
          await loadUsers()
          await loadWishlist()
          break
        case 'analytics':
          await loadAnalytics()
          break
        case 'overview':
          await loadAnalytics()
          break
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    }
  }

  const loadProducts = async () => {
    const response = await fetch('/api/products')
    if (response.ok) {
      const data = await response.json()
      setProducts(data.products || [])
    }
  }

  const loadOrders = async () => {
    const response = await fetch('/api/orders')
    if (response.ok) {
      const data = await response.json()
      setOrders(data.orders || [])
    }
  }

  const loadUsers = async () => {
    const response = await fetch('/api/admin/users')
    if (response.ok) {
      const data = await response.json()
      setUsers(data.users || [])
    }
  }

  const loadAnalytics = async () => {
    const response = await fetch('/api/admin/analytics')
    if (response.ok) {
      const data = await response.json()
      setAnalytics(data)
    }
  }

  const loadWishlist = async () => {
    const response = await fetch('/api/admin/wishlist')
    if (response.ok) {
      const data = await response.json()
      setWishlistItems(data.wishlistItems || [])
    }
  }

  const handleLogout = async () => {
    try {
      // Clear all cart data
      clearAllCartData()
      
      const response = await fetch('/api/auth/admin/logout', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        toast.success('Logged out successfully!')
        router.push('/admin')
      } else {
        toast.error('Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout failed')
    }
  }

  const handleAddProduct = async (newProduct: any) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
        credentials: 'include'
      })

      if (response.ok) {
        const product = await response.json()
        setProducts([...products, product])
    setIsAddModalOpen(false)
    toast.success('Product added successfully!')
      } else {
        toast.error('Failed to add product')
      }
    } catch (error) {
      console.error('Error adding product:', error)
      toast.error('Failed to add product')
    }
  }

  const handleEditProduct = async (updatedProduct: any) => {
    try {
      const response = await fetch(`/api/admin/products/${updatedProduct.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
        credentials: 'include'
      })

      if (response.ok) {
        const product = await response.json()
        setProducts(products.map(p => p.id === product.id ? product : p))
    setIsEditModalOpen(false)
    setSelectedProduct(null)
    toast.success('Product updated successfully!')
      } else {
        toast.error('Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Failed to update product')
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: 'DELETE',
          credentials: 'include'
        })

        if (response.ok) {
      setProducts(products.filter(p => p.id !== productId))
      toast.success('Product deleted successfully!')
        } else {
          toast.error('Failed to delete product')
        }
      } catch (error) {
        console.error('Error deleting product:', error)
        toast.error('Failed to delete product')
      }
    }
  }

  const openEditModal = (product: Product) => {
    setSelectedProduct(product)
    setIsEditModalOpen(true)
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        setOrders(orders.map(o => o.id === orderId ? updatedOrder : o))
        toast.success('Order status updated successfully!')
      } else {
        toast.error('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    }
  }

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, isActive }),
        credentials: 'include'
      })

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, isActive } : u))
        toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully!`)
      } else {
        toast.error('Failed to update user status')
      }
    } catch (error) {
      console.error('Error updating user status:', error)
      toast.error('Failed to update user status')
    }
  }

  const handleProductPositionChange = async (productId: string, newPosition: number) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ displayOrder: newPosition }),
        credentials: 'include'
      })

      if (response.ok) {
        setProductPositions(prev => ({ ...prev, [productId]: newPosition }))
        toast.success('Product position updated successfully!')
      } else {
        toast.error('Failed to update product position')
      }
    } catch (error) {
      console.error('Error updating product position:', error)
      toast.error('Failed to update product position')
    }
  }

  // Add profile picture upload function
  const handleProfileImageUpload = async (file: File) => {
    try {
      console.log('Starting upload for file:', file.name)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'admin')

      const response = await fetch('/api/upload/profile', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Upload successful, URL:', data.url)
        
        // Update local state immediately
        setProfileData(prev => {
          console.log('Updating profileData with:', data.url)
          return { ...prev, profileImage: data.url }
        })
        setAdmin(prev => {
          console.log('Updating admin with:', data.url)
          return prev ? { ...prev, profileImage: data.url } : null
        })
        
        // Save to database
        const saveResponse = await fetch('/api/admin/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ profileImage: data.url }),
          credentials: 'include'
        })
        
        if (saveResponse.ok) {
          toast.success('Profile picture uploaded and saved successfully!')
        } else {
          toast.error('Image uploaded but failed to save to database')
        }
      } else {
        const errorData = await response.json()
        console.error('Upload failed:', errorData)
        toast.error('Failed to upload profile picture')
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      toast.error('Failed to upload profile picture')
    }
  }

  // Update the handleProfileUpdate function
  const handleProfileUpdate = async () => {
    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
        credentials: 'include'
      })

      if (response.ok) {
        const updatedAdmin = await response.json()
        setAdmin(updatedAdmin)
        toast.success('Profile updated successfully!')
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  // Add this debugging useEffect to see the current state
  useEffect(() => {
    console.log('Admin profileImage:', admin?.profileImage)
    console.log('ProfileData profileImage:', profileData.profileImage)
  }, [admin?.profileImage, profileData.profileImage])

  // Function to fetch detailed order information
  const handleViewOrderDetails = async (order: Order) => {
    try {
      setSelectedOrder(order)
      setShowOrderModal(true)
      
      // Fetch detailed order information
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const detailedOrder = await response.json()
        setOrderDetails(detailedOrder)
      } else {
        toast.error('Failed to fetch order details')
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      toast.error('Failed to fetch order details')
    }
  }

  // Add this function to handle password change
  const handlePasswordChange = async () => {
    try {
      // Validation
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        toast.error('All fields are required')
        return
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('New passwords do not match')
        return
      }

      if (passwordData.newPassword.length < 6) {
        toast.error('New password must be at least 6 characters')
        return
      }

      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
        credentials: 'include'
      })

      if (response.ok) {
        toast.success('Password updated successfully!')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Failed to update password')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!admin) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-900 to-primary-800 border-b border-primary-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
              <span className="text-2xl font-display font-bold text-gradient">
                EDGY FASHION
              </span>
                  <div className="text-sm text-gray-400">Admin Portal</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 bg-primary-800/50 rounded-lg px-3 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">Live</span>
              </div>
              <button
                onClick={() => window.open('/', '_blank')}
                className="px-4 py-2 bg-gradient-to-r from-accent-600 to-accent-700 text-white text-sm rounded-lg hover:from-accent-700 hover:to-accent-800 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                title="View Website"
              >
                <span>🌐</span>
                <span>View Site</span>
              </button>
              <div className="flex items-center space-x-3 bg-primary-800/30 rounded-lg px-4 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  {admin.profileImage ? (
                    <img 
                      src={admin.profileImage} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-sm">
                      {admin.firstName[0]}{admin.lastName[0]}
                    </span>
                  )}
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-white">
                    {admin.firstName} {admin.lastName}
                  </div>
                  <div className="text-xs text-gray-400">Administrator</div>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
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
        <div className="flex flex-wrap gap-2 bg-gradient-to-r from-primary-900 to-primary-800 border border-primary-700 rounded-xl p-2 mb-8 shadow-lg">
          {[
            { id: 'overview', name: 'Overview', icon: '📊' },
            { id: 'products', name: 'Products', icon: '📦' },
            { id: 'orders', name: 'Orders', icon: '📋' },
            { id: 'users', name: 'Users', icon: '👥' },
            { id: 'analytics', name: 'Analytics', icon: '📈' },
            { id: 'website', name: 'Website', icon: '🌐' },
            { id: 'profile', name: 'Your Details', icon: '👤' },
            { id: 'settings', name: 'Settings', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-accent-600 to-accent-700 text-white shadow-lg transform scale-105'
                  : 'text-gray-300 hover:text-white hover:bg-primary-700/50 hover:transform hover:scale-105'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-primary-900 to-primary-800 border border-primary-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">Total Products</p>
                    <p className="text-3xl font-bold text-white">{products.length}</p>
                    <p className={`text-xs mt-1 ${(analytics?.overview?.monthlyProductGrowth ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(analytics?.overview?.monthlyProductGrowth ?? 0) > 0 ? '+' : ''}{(analytics?.overview?.monthlyProductGrowth ?? 0).toFixed(1)}% this month
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                    <Package className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary-900 to-primary-800 border border-primary-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">Total Orders</p>
                    <p className="text-3xl font-bold text-white">{analytics?.overview.totalOrders || 0}</p>
                    <p className={`text-xs mt-1 ${(analytics?.overview?.weeklyOrderGrowth ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(analytics?.overview?.weeklyOrderGrowth ?? 0) > 0 ? '+' : ''}{(analytics?.overview?.weeklyOrderGrowth ?? 0).toFixed(1)}% this week
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl">
                    <ShoppingCart className="w-8 h-8 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary-900 to-primary-800 border border-primary-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-white">₹{(analytics?.overview.totalRevenue || 0).toLocaleString()}</p>
                    <p className={`text-xs mt-1 ${(analytics?.overview?.monthlyRevenueGrowth ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(analytics?.overview?.monthlyRevenueGrowth ?? 0) > 0 ? '+' : ''}{(analytics?.overview?.monthlyRevenueGrowth ?? 0).toFixed(1)}% this month
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl">
                    <DollarSign className="w-8 h-8 text-yellow-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary-900 to-primary-800 border border-primary-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">Monthly Growth</p>
                    <p className={`text-3xl font-bold ${(analytics?.overview?.monthlyGrowth ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(analytics?.overview?.monthlyGrowth ?? 0) > 0 ? '+' : ''}{(analytics?.overview?.monthlyGrowth ?? 0).toFixed(1)}%
                    </p>
                    <p className={`text-xs mt-1 ${(analytics?.overview?.monthlyGrowth ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(analytics?.overview?.monthlyGrowth ?? 0) >= 0 ? '↗ Growing' : '↘ Declining'}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl">
                    {(analytics?.overview?.monthlyGrowth ?? 0) >= 0 ? (
                      <TrendingUp className="w-8 h-8 text-green-400" />
                    ) : (
                      <TrendingDown className="w-8 h-8 text-red-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-primary-900 border border-primary-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="btn-primary"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Product
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 space-y-4 lg:space-y-0">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Product Management</h2>
                <p className="text-gray-400">Manage your product catalog and display order</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setActiveTab('website')}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center space-x-2"
                >
                  <span>👁️</span>
                  <span>Preview Shop</span>
                </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-lg hover:from-accent-700 hover:to-accent-800 transition-all duration-200 flex items-center space-x-2 shadow-lg"
              >
                  <Plus className="w-5 h-5" />
                  <span>Add Product</span>
              </button>
              </div>
            </div>

            {/* Product Positioning Controls */}
            <div className="bg-gradient-to-r from-primary-900 to-primary-800 border border-primary-700 rounded-xl p-6 mb-6 shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <span>🎯</span>
                <span>Shop Display Order</span>
              </h3>
              <p className="text-gray-400 mb-4">Drag and drop or use the controls below to arrange products in your shop</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products
                  .sort((a, b) => (productPositions[a.id] || 0) - (productPositions[b.id] || 0))
                  .map((product, index) => (
                  <div key={product.id} className="bg-primary-800/50 border border-primary-600 rounded-lg p-4 hover:bg-primary-800 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <img
                            src={product.imageUrls[0] || '/placeholder.jpg'}
                            alt={product.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                          <div>
                            <div className="text-sm font-medium text-white truncate">{product.name}</div>
                            <div className="text-xs text-gray-400">₹{product.price}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleProductPositionChange(product.id, Math.max(0, (productPositions[product.id] || index) - 1))}
                          className="p-1 text-gray-400 hover:text-white hover:bg-primary-700 rounded transition-colors duration-200"
                          disabled={index === 0}
                        >
                          <TrendingUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleProductPositionChange(product.id, (productPositions[product.id] || index) + 1)}
                          className="p-1 text-gray-400 hover:text-white hover:bg-primary-700 rounded transition-colors duration-200"
                          disabled={index === products.length - 1}
                        >
                          <TrendingDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary-900 to-primary-800 border border-primary-700 rounded-xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-primary-800 to-primary-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-700/50">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-primary-800/50 transition-all duration-200 group">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <img
                                className="h-12 w-12 rounded-xl object-cover shadow-lg"
                                src={product.imageUrls[0] || '/placeholder.jpg'}
                              alt={product.name}
                            />
                              {product.isFeatured && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                                  <Star className="w-3 h-3 text-yellow-900" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white flex items-center space-x-2">
                                <span>{product.name}</span>
                                {product.discount > 0 && (
                                  <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
                                    -{product.discount}%
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {product.description.slice(0, 50)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-full">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm text-white">
                            <div className="font-bold text-lg">₹{product.price}</div>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <div className="text-xs text-gray-400 line-through">
                                ₹{product.originalPrice}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              product.stock > 10 ? 'bg-green-400' :
                              product.stock > 0 ? 'bg-yellow-400' :
                              'bg-red-400'
                            }`}></div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              product.stock > 10 ? 'bg-green-500/20 text-green-400' :
                              product.stock > 0 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {product.stock} units
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            product.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {product.isActive ? '✓ Active' : '✗ Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(product)}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all duration-200 group-hover:scale-110"
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 group-hover:scale-110"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Order Management</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-primary-800 border border-primary-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-primary-800 border border-primary-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="bg-primary-900 border border-primary-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-800">
                    {orders
                      .filter(order => 
                        (statusFilter === 'ALL' || order.status === statusFilter) &&
                        (searchTerm === '' || 
                         order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()))
                      )
                      .map((order) => (
                      <tr key={order.id} className="hover:bg-primary-800 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">
                          #{order.id.slice(-8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">{order.user.name}</div>
                            <div className="text-sm text-gray-400">{order.user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex -space-x-2">
                            {order.items.slice(0, 3).map((item, index) => (
                              <img
                                key={index}
                                className="h-8 w-8 rounded-full border-2 border-primary-800 object-cover"
                                src={item.product.imageUrls[0] || '/placeholder.jpg'}
                                alt={item.product.name}
                                title={`${item.product.name} x${item.quantity}`}
                              />
                            ))}
                            {order.items.length > 3 && (
                              <div className="h-8 w-8 rounded-full border-2 border-primary-800 bg-primary-700 flex items-center justify-center text-xs text-gray-300">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                          ₹{order.totalPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className={`px-3 py-1 text-xs rounded-full border-0 focus:ring-2 focus:ring-accent-500 ${
                              order.status === 'PENDING' ? 'bg-yellow-600/20 text-yellow-400' :
                              order.status === 'PROCESSING' ? 'bg-blue-600/20 text-blue-400' :
                              order.status === 'SHIPPED' ? 'bg-purple-600/20 text-purple-400' :
                              order.status === 'OUT_FOR_DELIVERY' ? 'bg-orange-600/20 text-orange-400' :
                              order.status === 'DELIVERED' ? 'bg-green-600/20 text-green-400' :
                              'bg-red-600/20 text-red-400'
                            }`}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewOrderDetails(order)}
                            className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">User Management</h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-primary-800 border border-primary-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
            </div>

            <div className="bg-primary-900 border border-primary-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-800">
                    {users
                      .filter(user => 
                        searchTerm === '' || 
                        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((user) => (
                      <tr key={user.id} className="hover:bg-primary-800 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">{user.name}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">
                            {user.phoneNumber || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">
                            {user.city && user.state ? `${user.city}, ${user.state}` : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {user._count.orders}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.isActive ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleToggleUserStatus(user.id, !user.isActive)}
                            className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 ${
                              user.isActive 
                                ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' 
                                : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                            }`}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Wishlist Section */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <span>❤️</span>
                  <span>User Wishlists</span>
                </h3>
                <div className="text-sm text-gray-400">
                  {wishlistItems.length} wishlist items
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary-900 to-primary-800 border border-primary-700 rounded-xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-primary-800 to-primary-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                          Added Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-700/50">
                      {wishlistItems.map((item) => (
                        <tr key={item.id} className="hover:bg-primary-800/50 transition-all duration-200 group">
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {item.user.name[0]}{item.user.name.split(' ')[1]?.[0] || ''}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-white">{item.user.name}</div>
                                <div className="text-xs text-gray-400">{item.user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <img
                                className="h-12 w-12 rounded-xl object-cover shadow-lg"
                                src={item.product.imageUrls[0] || '/placeholder.jpg'}
                                alt={item.product.name}
                              />
                              <div>
                                <div className="text-sm font-semibold text-white">{item.product.name}</div>
                                <div className="text-xs text-gray-400 truncate max-w-xs">
                                  {item.product.description?.slice(0, 50)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-sm text-white">
                              <div className="font-bold text-lg">₹{item.product.price}</div>
                              {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                                <div className="text-xs text-gray-400 line-through">
                                  ₹{item.product.originalPrice}
                                </div>
                              )}
                              {item.product.discount > 0 && (
                                <div className="text-xs text-green-400">
                                  -{item.product.discount}% off
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-full">
                              {item.product.category}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${
                                item.product.isActive ? 'bg-green-400' : 'bg-red-400'
                              }`}></div>
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                item.product.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {item.product.isActive ? 'Available' : 'Unavailable'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {wishlistItems.length === 0 && (
                <div className="bg-gradient-to-r from-primary-900 to-primary-800 border border-primary-700 rounded-xl p-12 text-center">
                  <div className="text-6xl mb-4">❤️</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Wishlist Items</h3>
                  <p className="text-gray-400">Users haven't added any products to their wishlist yet.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Analytics Dashboard</h2>
            
            {analytics && (
              <div className="space-y-6">
                {/* Recent Orders */}
                <div className="bg-primary-900 border border-primary-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Orders</h3>
                  <div className="space-y-4">
                    {analytics.recentOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-primary-800 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-white font-medium">
                            #{order.id.slice(-8)}
            </div>
                          <div className="text-sm text-gray-300">
                            {order.user.name}
                          </div>
                          <div className="text-sm text-gray-400">
                            {order.items.length} items
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-white font-medium">
                            ₹{order.totalPrice.toFixed(2)}
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            order.status === 'PENDING' ? 'bg-yellow-600/20 text-yellow-400' :
                            order.status === 'PROCESSING' ? 'bg-blue-600/20 text-blue-400' :
                            order.status === 'SHIPPED' ? 'bg-purple-600/20 text-purple-400' :
                            order.status === 'DELIVERED' ? 'bg-green-600/20 text-green-400' :
                            'bg-red-600/20 text-red-400'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Products */}
                <div className="bg-primary-900 border border-primary-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Top Selling Products</h3>
                  <div className="space-y-4">
                    {analytics.topProducts.map((item, index) => (
                      <div key={item.productId} className="flex items-center justify-between p-4 bg-primary-800 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="text-lg font-bold text-accent-400">
                            #{index + 1}
                          </div>
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={item.product?.imageUrls[0] || '/placeholder.jpg'}
                            alt={item.product?.name}
                          />
                          <div>
                            <div className="text-sm text-white font-medium">
                              {item.product?.name}
                            </div>
                            <div className="text-sm text-gray-400">
                              ₹{item.product?.price}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-white font-medium">
                          {item._sum.quantity} sold
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Website Preview Tab */}
        {activeTab === 'website' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 space-y-4 lg:space-y-0">
              <h2 className="text-2xl font-bold text-white">Website Preview</h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex flex-wrap gap-2 bg-primary-800 rounded-lg p-1">
                  {[
                    { id: 'home', name: 'Home', icon: '🏠' },
                    { id: 'shop', name: 'Shop', icon: '🛍️' },
                    { id: 'about', name: 'About', icon: 'ℹ️' },
                    { id: 'contact', name: 'Contact', icon: '📞' },
                    { id: 'login', name: 'Login', icon: '🔐' },
                    { id: 'cart', name: 'Cart', icon: '🛒' }
                  ].map((page) => (
                    <button
                      key={page.id}
                      onClick={() => setWebsitePage(page.id)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 flex items-center space-x-1 ${
                        websitePage === page.id
                          ? 'bg-accent-600 text-white'
                          : 'text-gray-300 hover:text-white hover:bg-primary-700'
                      }`}
                    >
                      <span>{page.icon}</span>
                      <span className="hidden sm:inline">{page.name}</span>
                    </button>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIframeKey(prev => prev + 1)}
                    className="px-3 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 flex items-center space-x-2"
                    title="Refresh Preview"
                  >
                    <span>🔄</span>
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                  <button
                    onClick={() => window.open('/', '_blank')}
                    className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <span>🌐</span>
                    <span>Open in New Tab</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-primary-900 border border-primary-800 rounded-lg overflow-hidden">
              <div className="h-[80vh] w-full relative">
                <iframe
                  key={iframeKey}
                  src={`/${websitePage === 'home' ? '' : websitePage}`}
                  className="w-full h-full border-0"
                  title={`Website Preview - ${websitePage.charAt(0).toUpperCase() + websitePage.slice(1)}`}
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                />
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-sm">
                  Preview: {websitePage.charAt(0).toUpperCase() + websitePage.slice(1)}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary-900 border border-primary-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => window.open('/admin/dashboard', '_blank')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-primary-800 rounded transition-colors duration-200"
                  >
                    🔧 Open Admin Dashboard
                  </button>
                  <button
                    onClick={() => window.open('/api/products', '_blank')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-primary-800 rounded transition-colors duration-200"
                  >
                    📊 View Products API
                  </button>
                  <button
                    onClick={() => window.open('/api/orders', '_blank')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-primary-800 rounded transition-colors duration-200"
                  >
                    📋 View Orders API
                  </button>
                </div>
              </div>

              <div className="bg-primary-900 border border-primary-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Website Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Website Status</span>
                    <span className="px-2 py-1 text-xs bg-green-600/20 text-green-400 rounded-full">
                      Online
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Products</span>
                    <span className="text-sm text-white">{products.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Orders</span>
                    <span className="text-sm text-white">{orders.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Users</span>
                    <span className="text-sm text-white">{users.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-primary-900 border border-primary-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Navigation</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('products')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-primary-800 rounded transition-colors duration-200"
                  >
                    📦 Manage Products
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-primary-800 rounded transition-colors duration-200"
                  >
                    📋 Manage Orders
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-primary-800 rounded transition-colors duration-200"
                  >
                    👥 Manage Users
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-primary-800 rounded transition-colors duration-200"
                  >
                    📊 View Analytics
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Your Details Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="bg-gradient-to-r from-primary-900 to-primary-800 border border-primary-700 rounded-xl p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-accent-600/20 rounded-lg">
                  <User className="w-8 h-8 text-accent-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Your Details</h2>
                  <p className="text-gray-400">Manage your personal information and profile</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Image */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Profile Picture</h3>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-primary-800 rounded-full flex items-center justify-center border-2 border-primary-700 overflow-hidden">
                        {(profileData.profileImage || admin?.profileImage) ? (
                          <img 
                            src={profileData.profileImage || admin?.profileImage} 
                            alt="Profile" 
                            className="w-full h-full rounded-full object-cover"
                            onError={(e) => {
                              console.error('Image failed to load:', profileData.profileImage || admin?.profileImage)
                              e.currentTarget.style.display = 'none'
                            }}
                            onLoad={() => console.log('Image loaded successfully:', profileData.profileImage || admin?.profileImage)}
                          />
                        ) : (
                          <User className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleProfileImageUpload(file)
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <button className="absolute -bottom-2 -right-2 p-2 bg-accent-600 hover:bg-accent-700 rounded-full transition-colors">
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div>
                      <button 
                        onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                        className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors"
                      >
                        Upload Photo
                      </button>
                      <p className="text-sm text-gray-400 mt-2">JPG, PNG up to 2MB</p>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-4 py-3 bg-primary-800 border border-primary-700 rounded-lg text-white focus:border-accent-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-4 py-3 bg-primary-800 border border-primary-700 rounded-lg text-white focus:border-accent-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-primary-800 border border-primary-700 rounded-lg text-white focus:border-accent-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={profileData.phoneNumber}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="Enter phone number"
                      className="w-full px-4 py-3 bg-primary-800 border border-primary-700 rounded-lg text-white focus:border-accent-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                    <input
                      type="text"
                      value={profileData.department}
                      onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Enter department"
                      className="w-full px-4 py-3 bg-primary-800 border border-primary-700 rounded-lg text-white focus:border-accent-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself"
                      rows={3}
                      className="w-full px-4 py-3 bg-primary-800 border border-primary-700 rounded-lg text-white focus:border-accent-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={handleProfileUpdate}
                      className="px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors"
                    >
                      Save Changes
                    </button>
                    <button 
                      onClick={() => setProfileData({
                        firstName: admin?.firstName || '',
                        lastName: admin?.lastName || '',
                        email: admin?.email || '',
                        phoneNumber: admin?.phoneNumber || '',
                        department: admin?.department || '',
                        bio: admin?.bio || '',
                        profileImage: admin?.profileImage || ''
                      })}
                      className="px-6 py-3 border border-primary-700 hover:border-primary-600 text-gray-300 hover:text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="bg-gradient-to-r from-primary-900 to-primary-800 border border-primary-700 rounded-xl p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-accent-600/20 rounded-lg">
                  <Settings className="w-8 h-8 text-accent-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Settings</h2>
                  <p className="text-gray-400">Manage your account settings and preferences</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Change Password */}
                <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Lock className="w-6 h-6 text-accent-400" />
                    <h3 className="text-lg font-semibold text-white">Change Password</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter current password"
                        className="w-full px-4 py-3 bg-primary-900 border border-primary-700 rounded-lg text-white focus:border-accent-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password"
                        className="w-full px-4 py-3 bg-primary-900 border border-primary-700 rounded-lg text-white focus:border-accent-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm new password"
                        className="w-full px-4 py-3 bg-primary-900 border border-primary-700 rounded-lg text-white focus:border-accent-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-end">
                      <button 
                        onClick={handlePasswordChange}
                        className="px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Key className="w-6 h-6 text-accent-400" />
                    <h3 className="text-lg font-semibold text-white">Account Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Admin ID</label>
                      <input
                        type="text"
                        value={admin.id}
                        className="w-full px-4 py-3 bg-primary-900 border border-primary-700 rounded-lg text-gray-400 cursor-not-allowed"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Account Status</label>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${admin.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-white">{admin.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Created At</label>
                      <input
                        type="text"
                        value={new Date(admin.createdAt).toLocaleDateString()}
                        className="w-full px-4 py-3 bg-primary-900 border border-primary-700 rounded-lg text-gray-400 cursor-not-allowed"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Last Login</label>
                      <input
                        type="text"
                        value={admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleDateString() : 'Never'}
                        className="w-full px-4 py-3 bg-primary-900 border border-primary-700 rounded-lg text-gray-400 cursor-not-allowed"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-accent-400" />
                    <h3 className="text-lg font-semibold text-white">Permissions</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {admin.permissions.map((permission, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-300 capitalize">{permission}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddProductModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddProduct}
        />
      )}

      {isEditModalOpen && selectedProduct && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onEdit={handleEditProduct}
          product={selectedProduct}
        />
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-primary-900 border border-primary-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary-700">
              <div>
                <h3 className="text-xl font-semibold text-white">Order Details</h3>
                <p className="text-gray-400 text-sm">Order ID: {selectedOrder.id}</p>
              </div>
              <button
                onClick={() => {
                  setShowOrderModal(false)
                  setSelectedOrder(null)
                  setOrderDetails(null)
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {orderDetails ? (
                <div className="space-y-6">
                  {/* Order Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Order Status</h4>
                      <span className={`px-3 py-1 text-sm rounded-full ${
                        orderDetails.status === 'PENDING' ? 'bg-yellow-600/20 text-yellow-400' :
                        orderDetails.status === 'PROCESSING' ? 'bg-blue-600/20 text-blue-400' :
                        orderDetails.status === 'SHIPPED' ? 'bg-purple-600/20 text-purple-400' :
                        orderDetails.status === 'OUT_FOR_DELIVERY' ? 'bg-orange-600/20 text-orange-400' :
                        orderDetails.status === 'DELIVERED' ? 'bg-green-600/20 text-green-400' :
                        'bg-red-600/20 text-red-400'
                      }`}>
                        {orderDetails.status}
                      </span>
                    </div>
                    <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Total Amount</h4>
                      <p className="text-2xl font-bold text-accent-400">₹{orderDetails.totalPrice.toFixed(2)}</p>
                    </div>
                    <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Order Date</h4>
                      <p className="text-white">{new Date(orderDetails.createdAt).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-400">{new Date(orderDetails.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-accent-400" />
                      Customer Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-sm font-medium text-gray-400 mb-2">Personal Details</h5>
                        <div className="space-y-2">
                          <p className="text-white"><span className="text-gray-400">Name:</span> {orderDetails.user.name}</p>
                          <p className="text-white"><span className="text-gray-400">Email:</span> {orderDetails.user.email}</p>
                          {orderDetails.user.phoneNumber && (
                            <p className="text-white"><span className="text-gray-400">Phone:</span> {orderDetails.user.phoneNumber}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-400 mb-2">Shipping Address</h5>
                        <div className="space-y-2">
                          {orderDetails.user.address && (
                            <p className="text-white">{orderDetails.user.address}</p>
                          )}
                          <div className="flex gap-2">
                            {orderDetails.user.city && <span className="text-white">{orderDetails.user.city}</span>}
                            {orderDetails.user.state && <span className="text-white">{orderDetails.user.state}</span>}
                            {orderDetails.user.zipCode && <span className="text-white">{orderDetails.user.zipCode}</span>}
                          </div>
                          {orderDetails.user.country && (
                            <p className="text-white">{orderDetails.user.country}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-accent-400" />
                      Order Items ({orderDetails.items.length})
                    </h4>
                    <div className="space-y-4">
                      {orderDetails.items.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-primary-900/50 rounded-lg">
                          <img
                            src={item.product.imageUrls[0] || '/placeholder.jpg'}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h5 className="text-white font-medium">{item.product.name}</h5>
                            <div className="flex items-center gap-4 mt-1">
                              <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                              <p className="text-sm text-gray-400">Price: ₹{item.price}</p>
                              {item.sizes && (
                                <p className="text-sm text-gray-400">Size: {item.sizes}</p>
                              )}
                            </div>
                            <p className="text-sm text-gray-400">Category: {item.product.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Order Total */}
                    <div className="mt-6 pt-4 border-t border-primary-700">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-white">Total Amount:</span>
                        <span className="text-2xl font-bold text-accent-400">₹{orderDetails.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  {(orderDetails.paymentId || orderDetails.paymentOrderId) && (
                    <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-accent-400" />
                        Payment Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {orderDetails.paymentId && (
                          <div>
                            <p className="text-sm text-gray-400">Payment ID</p>
                            <p className="text-white font-mono text-sm">{orderDetails.paymentId}</p>
                          </div>
                        )}
                        {orderDetails.paymentOrderId && (
                          <div>
                            <p className="text-sm text-gray-400">Payment Order ID</p>
                            <p className="text-white font-mono text-sm">{orderDetails.paymentOrderId}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <select
                      value={orderDetails.status}
                      onChange={(e) => {
                        handleUpdateOrderStatus(orderDetails.id, e.target.value)
                        setOrderDetails({...orderDetails, status: e.target.value})
                      }}
                      className="px-4 py-2 bg-primary-800 border border-primary-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors duration-200"
                    >
                      Print Order
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-white">Loading order details...</div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
