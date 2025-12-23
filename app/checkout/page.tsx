'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Script from 'next/script'
import { 
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  CheckCircle,
  User,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  Plus,
  X,
  Package,
  ChevronDown
} from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { getCartItems, getCartTotal, isUserAuthenticated, clearCart, removeFromCart } from '@/lib/cart'
import { CartItem } from '@/lib/cart'
import toast from 'react-hot-toast'

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
  landmark?: string
  areaOrStreet?: string
  profileImage?: string
  createdAt: string
  updatedAt: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [paymentStep, setPaymentStep] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [productDetails, setProductDetails] = useState<{[key: string]: {originalPrice: number, price: number}}>({})
  
  const [activeAddressTab, setActiveAddressTab] = useState('home')
  const [promoCode, setPromoCode] = useState('')
  
  // User and delivery address states
  const [user, setUser] = useState<User | null>(null)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [addressFormData, setAddressFormData] = useState({
    fullName: '',
    mobileNumber: '',
    pincode: '',
    flatHouseBuilding: '',
    areaOrStreet: '',
    landmark: '',
    townCity: '',
    state: '',
    country: 'India',
    isDefault: false
  })
  const [isLocationLoading, setIsLocationLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    // Billing Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Shipping Address
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    
    // Payment Information
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    
    // Order Notes
    orderNotes: ''
  })

  const [addresses] = useState([
    {
      id: 'home',
      type: 'Home',
      address: '123, Street Name, City, State - 700001',
      isDefault: true
    },
    {
      id: 'work',
      type: 'Work',
      address: 'Office Bldg, City - 700001',
      isDefault: false
    }
  ])

  useEffect(() => {
    const loadCheckoutData = async () => {
      if (!isUserAuthenticated()) {
        router.push('/login')
        return
      }

      try {
        const items = await getCartItems()
        const cartTotal = await getCartTotal()
        
        if (items.length === 0) {
          router.push('/cart')
          return
        }
        
        setCartItems(items)
        setTotal(cartTotal)
        
        // Fetch product details for savings calculation
        await fetchProductDetails(items)
        
        // Fetch user data for delivery address
        await fetchUserData()
      } catch (error) {
        console.error('Error loading checkout data:', error)
        toast.error('Failed to load checkout data')
        router.push('/cart')
      } finally {
        setLoading(false)
      }
    }

    loadCheckoutData()
  }, [router])

  // Handle form population when user data changes and we're in edit mode
  useEffect(() => {
    if (isEditingAddress && user && showAddressModal) {
      console.log('User data updated, re-populating form for edit mode')
      console.log('Updated user data:', {
        areaOrStreet: user.areaOrStreet,
        landmark: user.landmark
      })
      setAddressFormData({
        fullName: user.name || '',
        mobileNumber: user.phoneNumber || '',
        pincode: user.zipCode || '',
        flatHouseBuilding: user.address || '',
        areaOrStreet: user.areaOrStreet || '',
        landmark: user.landmark || '',
        townCity: user.city || '',
        state: user.state || '',
        country: user.country || 'India',
        isDefault: true
      })
    }
  }, [user, isEditingAddress, showAddressModal])

  const fetchProductDetails = async (items: CartItem[]) => {
    try {
      const productIds = Array.from(new Set(items.map(item => item.productId)))
      const response = await fetch('/api/products/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIds })
      })

      if (response.ok) {
        const products = await response.json()
        const productMap: {[key: string]: {originalPrice: number, price: number}} = {}
        
        products.forEach((product: any) => {
          productMap[product.id] = {
            originalPrice: product.originalPrice || product.price,
            price: product.price
          }
        })
        
        setProductDetails(productMap)
      }
    } catch (error) {
      console.error('Error fetching product details:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Delivery Address functions
  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched user data:', data.user)
        console.log('Area/Street:', data.user?.areaOrStreet)
        console.log('Landmark:', data.user?.landmark)
        setUser(data.user)
        console.log('User state updated with landmark and areaOrStreet')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const handleAutofillLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser')
      return
    }

    setIsLocationLoading(true)
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        })
      })

      const { latitude, longitude } = position.coords
      
      // Use a reverse geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      )
      
      if (response.ok) {
        const data = await response.json()
        
        setAddressFormData(prev => ({
          ...prev,
          townCity: data.city || data.locality || '',
          state: data.principalSubdivision || '',
          country: data.countryName || 'India',
          areaOrStreet: data.localityInfo?.administrative?.[0]?.name || ''
        }))
        
        toast.success('Location autofilled successfully!')
      } else {
        toast.error('Failed to fetch location details')
      }
    } catch (error) {
      console.error('Error getting location:', error)
      toast.error('Failed to get your location')
    } finally {
      setIsLocationLoading(false)
    }
  }

  const handleSaveAddress = async () => {
    console.log('Saving address with data:', addressFormData)
    
    // Validate required fields
    if (!addressFormData.areaOrStreet.trim()) {
      toast.error('Please enter Area, Street, Sector, or Village')
      return
    }
    
    if (!addressFormData.landmark.trim()) {
      toast.error('Please enter a Landmark')
      return
    }

    try {
      const requestBody = {
        name: addressFormData.fullName,
        phoneNumber: addressFormData.mobileNumber,
        address: addressFormData.flatHouseBuilding,
        areaOrStreet: addressFormData.areaOrStreet,
        landmark: addressFormData.landmark,
        city: addressFormData.townCity,
        state: addressFormData.state,
        zipCode: addressFormData.pincode,
        country: addressFormData.country
      }
      
      console.log('Sending request body:', requestBody)
      
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include'
      })

      if (response.ok) {
        toast.success(isEditingAddress ? 'Address updated successfully!' : 'Address saved successfully!')
        setShowAddressModal(false)
        setIsEditingAddress(false)
        // Reset only the new fields, keep profile data
        setAddressFormData(prev => ({
          ...prev,
          areaOrStreet: '',
          landmark: '',
          isDefault: false
        }))
        fetchUserData() // Refresh user data
      } else {
        toast.error(isEditingAddress ? 'Failed to update address' : 'Failed to save address')
      }
    } catch (error) {
      console.error('Error saving address:', error)
      toast.error(isEditingAddress ? 'Failed to update address' : 'Failed to save address')
    }
  }

  const openAddressModal = (isEdit = false) => {
    console.log('Opening address modal in edit mode:', isEdit)
    setIsEditingAddress(isEdit)
    
    // If editing, refresh user data to ensure we have the latest information
    if (isEdit) {
      console.log('Refreshing user data for edit mode...')
      fetchUserData()
    }
    
    if (isEdit && user) {
      console.log('Pre-populating form with current address data for editing')
      console.log('User data:', {
        areaOrStreet: user.areaOrStreet,
        landmark: user.landmark
      })
      // Pre-populate form with user's current address data for editing
      setAddressFormData({
        fullName: user.name || '',
        mobileNumber: user.phoneNumber || '',
        pincode: user.zipCode || '',
        flatHouseBuilding: user.address || '',
        areaOrStreet: user.areaOrStreet || '',
        landmark: user.landmark || '',
        townCity: user.city || '',
        state: user.state || '',
        country: user.country || 'India',
        isDefault: true // Set to true for editing existing address
      })
    } else if (user) {
      console.log('Pre-populating form with profile data for new address')
      // Pre-populate form with user's profile data for new address
      setAddressFormData({
        fullName: user.name || '',
        mobileNumber: user.phoneNumber || '',
        pincode: user.zipCode || '',
        flatHouseBuilding: user.address || '',
        areaOrStreet: '', // New field - empty initially for new address
        landmark: '', // New field - empty initially for new address
        townCity: user.city || '',
        state: user.state || '',
        country: user.country || 'India',
        isDefault: false
      })
    }
    setShowAddressModal(true)
  }

  const hasAddress = () => {
    return user?.address || user?.city || user?.state || user?.zipCode
  }

  const handlePlaceOrder = async () => {
    // Validate delivery address
    if (!hasAddress()) {
      toast.error('Please add a delivery address before placing order')
      return
    }

    if (!user?.areaOrStreet || !user?.landmark) {
      toast.error('Please complete your delivery address with Area/Street and Landmark')
      return
    }

    // Proceed to payment step
    setPaymentStep(true)
    
    // Load Razorpay script if not already loaded
    if (!razorpayLoaded) {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => setRazorpayLoaded(true)
      document.body.appendChild(script)
    } else {
      initiatePayment()
    }
  }

  const initiatePayment = async () => {
    setProcessing(true)
    
    try {
      // Create Razorpay order
      const orderResponse = await fetch('/api/payment/razorpay/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: finalTotal,
          currency: 'INR',
          receipt: `order_${Date.now()}`,
          notes: {
            userId: user?.id,
            items: cartItems.length
          }
        })
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json()
        throw new Error(errorData.error || 'Failed to create payment order')
      }

      const { orderId, amount, currency, keyId } = await orderResponse.json()

      // Prepare order data for verification
      const orderData = {
        items: cartItems.map(item => ({
          id: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize
        })),
        totalPrice: finalTotal
      }

      // Open Razorpay Checkout
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'Edgy Fashion',
        description: `Order for ${cartItems.length} item(s)`,
        order_id: orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phoneNumber || ''
        },
        notes: {
          address: `${user?.address || ''}, ${user?.areaOrStreet || ''}, ${user?.city || ''}, ${user?.state || ''} - ${user?.zipCode || ''}`,
          landmark: user?.landmark || ''
        },
        theme: {
          color: '#dc2626'
        },
        handler: async function (response: any) {
          await verifyPayment(response, orderData)
        },
        modal: {
          ondismiss: function() {
            setProcessing(false)
            setPaymentStep(false)
            toast.error('Payment cancelled')
          }
        }
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()

    } catch (error) {
      console.error('Payment initiation error:', error)
      toast.error('Failed to initiate payment. Please try again.')
      setProcessing(false)
      setPaymentStep(false)
    }
  }

  const verifyPayment = async (paymentResponse: any, orderData: any) => {
    try {
      const verifyResponse = await fetch('/api/payment/razorpay/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          orderData: orderData
        })
      })

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json()
        throw new Error(errorData.error || 'Payment verification failed')
      }

      const result = await verifyResponse.json()
      
      // Payment successful - show success page
      setOrderComplete(true)
      setPaymentStep(false)
      toast.success('Payment successful! Order placed.')
      
    } catch (error) {
      console.error('Payment verification error:', error)
      toast.error('Payment verification failed. Please contact support if amount was debited.')
      setProcessing(false)
      setPaymentStep(false)
    }
  }

  // Handle Razorpay script load
  useEffect(() => {
    if (razorpayLoaded && paymentStep) {
      initiatePayment()
    }
  }, [razorpayLoaded, paymentStep])

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading checkout...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-12">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-white mb-4">Order Confirmed!</h1>
                <p className="text-gray-300 mb-6">
                  Thank you for your order. You will receive a confirmation email shortly.
                </p>
                <p className="text-sm text-gray-400 mb-8">
                  Order #: ROT-{Date.now().toString().slice(-8)}
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => router.push('/shop')}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded transition-colors"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={() => router.push('/user/dashboard')}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded transition-colors"
                  >
                    View Orders
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const shippingCost = total > 50 ? 0 : 9.99
  const tax = total * 0.08
  const finalTotal = total + shippingCost + tax

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Navigation */}
      <div className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and main nav */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <div className="bg-red-600 text-white px-2 py-1 text-sm font-bold rounded">
                  ROT
                </div>
              </div>
              <nav className="hidden md:flex space-x-6">
                <a href="/" className="text-gray-300 hover:text-white text-sm">Home</a>
                <a href="/shop" className="text-gray-300 hover:text-white text-sm">Shop</a>
                <a href="/contact" className="text-gray-300 hover:text-white text-sm">Contact</a>
              </nav>
            </div>
            
            {/* Right side - Help, Orders, Account */}
            <div className="flex items-center space-x-6">
              <a href="/help" className="text-gray-300 hover:text-white text-sm">Help</a>
              <a href="/user/dashboard#orders" className="text-gray-300 hover:text-white text-sm">Orders</a>
              <a href="/user/dashboard" className="text-gray-300 hover:text-white text-sm">Account</a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back to cart */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to cart
        </button>

        {/* Secure checkout heading */}
        <h1 className="text-white text-xl font-semibold mb-8">Secure checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Progress + Trust Bar */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-24 rounded bg-gray-700">
                    <div className="h-2 w-2/3 rounded bg-red-600" />
                  </div>
                  <p className="text-gray-300 text-sm">
                    {paymentStep ? 'Step 3 of 3: Payment' : 'Step 2 of 3: Delivery & Review'}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-gray-400 text-xs">SSL Secure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-gray-400 text-xs">Free shipping on orders above ₹1000+</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-gray-400 text-xs">7‑day returns</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-red-500" />
                <h2 className="text-white text-lg font-semibold">Delivery Address</h2>
              </div>

              {hasAddress() ? (
                <div className="space-y-6">
                  {/* Address Tabs */}
                  <div className="flex gap-1">
                    <button className="px-4 py-2 text-sm rounded bg-gray-700 text-white">
                      Home
                    </button>
                    <button className="px-4 py-2 text-sm rounded text-gray-400 hover:text-white">
                      Work
                    </button>
                  </div>

                  {/* Address Card */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-white font-semibold">Home</h3>
                          <button className="px-3 py-1 text-xs bg-gray-600 text-white rounded">
                            Default here
                          </button>
                        </div>
                        <p className="text-white text-sm">
                          {user?.address && `${user.address}, `}
                          {user?.areaOrStreet && `${user.areaOrStreet}, `}
                          {user?.city && `${user.city}, `}
                          {user?.state && `${user.state} - `}
                          {user?.zipCode}
                        </p>
                        {user?.landmark && (
                          <p className="text-gray-400 text-sm mt-1">
                            Landmark: {user.landmark}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            console.log('Edit button clicked')
                            openAddressModal(true)
                          }}
                          className="p-2 text-white hover:bg-gray-600 rounded transition-colors duration-200"
                          title="Edit address"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this address?')) {
                              // TODO: Implement delete functionality
                              toast.error('Delete functionality not implemented yet')
                            }
                          }}
                          className="p-2 text-white hover:bg-gray-600 rounded transition-colors duration-200"
                          title="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => openAddressModal()}
                    className="text-red-500 hover:text-red-400 transition-colors duration-200"
                  >
                    Add new address
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No delivery address added yet</p>
                  <button
                    onClick={() => openAddressModal()}
                    className="text-red-500 hover:text-red-400 transition-colors duration-200"
                  >
                    Add a new delivery address
                  </button>
                </div>
              )}
            </div>

            {/* Product Preview Section */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Package className="w-5 h-5 text-red-500" />
                <h2 className="text-white text-lg font-semibold">Review Your Items</h2>
              </div>

              {/* Savings Banner */}
              {cartItems.length > 0 && (
                <div className="bg-green-900 border border-green-700 rounded-lg p-3 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-300 text-sm font-medium">
                      You are saving ₹{cartItems.reduce((totalSavings, item) => {
                        const productDetail = productDetails[item.productId]
                        if (productDetail) {
                          const originalPrice = productDetail.originalPrice
                          const currentPrice = productDetail.price
                          const itemSavings = (originalPrice - currentPrice) * item.quantity
                          return totalSavings + itemSavings
                        }
                        return totalSavings
                      }, 0).toFixed(2)} on this order
                    </span>
                  </div>
                </div>
              )}

              {/* Product Items */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-white text-sm font-medium mb-1">{item.name}</h3>
                            <p className="text-gray-400 text-xs mb-2">ROT Brand</p>
                          </div>
                          <button 
                            className="text-gray-400 hover:text-white transition-colors"
                            onClick={async () => {
                              try {
                                const result = await removeFromCart(item.productId, item.selectedSize)
                                if (result.success) {
                                  // Remove item from local state
                                  const updatedItems = cartItems.filter(cartItem => cartItem.id !== item.id)
                                  setCartItems(updatedItems)
                                  
                                  // Recalculate total
                                  const newTotal = updatedItems.reduce((sum, cartItem) => sum + (cartItem.price * cartItem.quantity), 0)
                                  setTotal(newTotal)
                                  
                                  toast.success('Item removed from cart')
                                } else {
                                  toast.error(result.message || 'Failed to remove item')
                                }
                              } catch (error) {
                                console.error('Error removing item:', error)
                                toast.error('Failed to remove item')
                              }
                            }}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Size and Quantity */}
                        <div className="flex items-center gap-4 mb-3">
                          {item.selectedSize && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 text-xs">Size:</span>
                              <span className="text-white text-xs font-medium">
                                {item.selectedSize}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-xs">Qty:</span>
                            <span className="text-white text-xs font-medium">
                              {item.quantity}
                            </span>
                          </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-green-400 text-xs">
                            Delivery by {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>

                        {/* Pricing */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm font-semibold">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Offer Applied Banner */}
              {cartItems.length > 1 && (
                <div className="bg-blue-900 border border-blue-700 rounded-lg p-3 mt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300 text-sm">
                      Buy 2 for ₹999 offer applied!
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Order Notes and Promo Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Notes */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-white text-sm font-medium mb-3">Order notes (optional)</h3>
                <textarea
                  name="orderNotes"
                  value={formData.orderNotes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Any instructions for the delivery person..."
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 text-sm focus:border-red-500 focus:outline-none resize-none"
                />
              </div>

              {/* Promo Code */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-white text-sm font-medium mb-3">Have a promo code?</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                  />
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors">
                    Apply
                  </button>
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-300 text-xs">Secure payments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-300 text-xs">Easy returns within 7 days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-4 pt-4">
              <button 
                onClick={handlePlaceOrder}
                disabled={processing || !hasAddress()}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded text-sm font-medium transition-colors disabled:opacity-50"
              >
                {processing ? (
                  paymentStep ? 'Processing Payment...' : 'Preparing Order...'
                ) : (
                  'Proceed to Payment'
                )}
              </button>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-lg font-semibold">Order Summary</h2>
                <span className="text-gray-400 text-sm">{cartItems.length} items</span>
              </div>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-400 text-xs">Qty: {item.quantity}</span>
                        <button 
                          className="text-gray-400 hover:text-white text-xs"
                          onClick={async () => {
                            try {
                              const result = await removeFromCart(item.productId, item.selectedSize)
                              if (result.success) {
                                // Remove item from local state
                                const updatedItems = cartItems.filter(cartItem => cartItem.id !== item.id)
                                setCartItems(updatedItems)
                                
                                // Recalculate total
                                const newTotal = updatedItems.reduce((sum, cartItem) => sum + (cartItem.price * cartItem.quantity), 0)
                                setTotal(newTotal)
                                
                                toast.success('Item removed from cart')
                              } else {
                                toast.error(result.message || 'Failed to remove item')
                              }
                            } catch (error) {
                              console.error('Error removing item:', error)
                              toast.error('Failed to remove item')
                            }
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="text-white font-semibold text-sm">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Subtotal</span>
                  <span className="text-white text-sm">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Shipping</span>
                  <span className="text-white text-sm">
                    {shippingCost === 0 ? '₹0.00' : `₹${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Tax</span>
                  <span className="text-white text-sm">₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-600 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-white">Total</span>
                    <span className="text-xl font-bold text-white">
                      ₹{finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={processing || !hasAddress()}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {processing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {paymentStep ? 'Processing Payment...' : 'Preparing Order...'}
                  </div>
                ) : (
                  `Place Order - ₹${finalTotal.toFixed(2)}`
                )}
              </button>

              {/* Security Features */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-300 text-xs">Secure SSL Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-300 text-xs">Free shipping on orders over ₹1000</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-300 text-xs">7 day easy returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">
                {isEditingAddress ? 'Edit address' : 'Add an address'}
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <h4 className="text-lg font-medium text-white mb-6">
                {isEditingAddress ? 'Update your delivery address' : 'Enter a new delivery address'}
              </h4>
              
              {/* Info Banner */}
              <div className={`${isEditingAddress ? 'bg-blue-900 border-blue-700' : 'bg-green-900 border-green-700'} rounded-lg p-4 mb-4`}>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-5 h-5 ${isEditingAddress ? 'text-blue-400' : 'text-green-400'}`} />
                  <span className={`text-sm ${isEditingAddress ? 'text-blue-200' : 'text-green-200'}`}>
                    {isEditingAddress 
                      ? 'Your current address information is pre-filled. Update the fields as needed and click "Update address" to save changes.'
                      : 'Your profile information has been pre-filled. You only need to add the Area/Street and Landmark details.'
                    }
                  </span>
                </div>
              </div>
              
              {/* Autofill Banner */}
              <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-blue-200">Save time. Autofill your current location.</span>
                  <button
                    onClick={handleAutofillLocation}
                    disabled={isLocationLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLocationLoading ? 'Loading...' : 'Autofill'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Country/Region */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Country/Region
                  </label>
                  <select
                    value={addressFormData.country}
                    onChange={(e) => setAddressFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full input-field"
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full name (First and Last name) <span className="text-green-400 text-xs">(from profile)</span>
                  </label>
                  <input
                    type="text"
                    value={addressFormData.fullName}
                    onChange={(e) => setAddressFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full input-field"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mobile number <span className="text-green-400 text-xs">(from profile)</span>
                  </label>
                  <input
                    type="tel"
                    value={addressFormData.mobileNumber}
                    onChange={(e) => setAddressFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                    className="w-full input-field"
                  />
                  <p className="text-xs text-gray-400 mt-1">May be used to assist delivery</p>
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pincode <span className="text-green-400 text-xs">(from profile)</span>
                  </label>
                  <input
                    type="text"
                    value={addressFormData.pincode}
                    onChange={(e) => setAddressFormData(prev => ({ ...prev, pincode: e.target.value }))}
                    placeholder="6 digits [0-9] PIN code"
                    className="w-full input-field"
                  />
                </div>

                {/* Flat, House no., Building, Company, Apartment */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Flat, House no., Building, Company, Apartment <span className="text-green-400 text-xs">(from profile)</span>
                  </label>
                  <input
                    type="text"
                    value={addressFormData.flatHouseBuilding}
                    onChange={(e) => setAddressFormData(prev => ({ ...prev, flatHouseBuilding: e.target.value }))}
                    className="w-full input-field"
                  />
                </div>

                {/* Area, Street, Sector, Village */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Area, Street, Sector, Village <span className="text-red-400 text-xs">* (required)</span>
                  </label>
                  <input
                    type="text"
                    value={addressFormData.areaOrStreet}
                    onChange={(e) => setAddressFormData(prev => ({ ...prev, areaOrStreet: e.target.value }))}
                    placeholder="Enter area, street, sector, or village"
                    className="w-full input-field border-red-500 focus:border-red-400"
                    required
                  />
                </div>

                {/* Landmark */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Landmark <span className="text-red-400 text-xs">* (required)</span>
                  </label>
                  <input
                    type="text"
                    value={addressFormData.landmark}
                    onChange={(e) => setAddressFormData(prev => ({ ...prev, landmark: e.target.value }))}
                    placeholder="E.g. near apollo hospital"
                    className="w-full input-field border-red-500 focus:border-red-400"
                    required
                  />
                </div>

                {/* Town/City */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Town/City <span className="text-green-400 text-xs">(from profile)</span>
                  </label>
                  <input
                    type="text"
                    value={addressFormData.townCity}
                    onChange={(e) => setAddressFormData(prev => ({ ...prev, townCity: e.target.value }))}
                    className="w-full input-field"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    State <span className="text-green-400 text-xs">(from profile)</span>
                  </label>
                  <select
                    value={addressFormData.state}
                    onChange={(e) => setAddressFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full input-field"
                  >
                    <option value="">Choose a state</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Assam">Assam</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Chhattisgarh">Chhattisgarh</option>
                    <option value="Goa">Goa</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                    <option value="Jharkhand">Jharkhand</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Sikkim">Sikkim</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Tripura">Tripura</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Uttarakhand">Uttarakhand</option>
                    <option value="West Bengal">West Bengal</option>
                  </select>
                </div>

                {/* Make this my default address */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={addressFormData.isDefault}
                    onChange={(e) => setAddressFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                    className="w-4 h-4 text-accent-600 bg-gray-700 border-gray-600 rounded focus:ring-accent-500 focus:ring-2"
                  />
                  <label htmlFor="isDefault" className="ml-2 text-sm text-gray-300">
                    Make this my default address
                  </label>
                </div>

              </div>

              <div className="mt-8">
                <button
                  onClick={handleSaveAddress}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  {isEditingAddress ? 'Update address' : 'Save this address'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
