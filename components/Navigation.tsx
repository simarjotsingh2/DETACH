'use client'

import { clearAllCartData, getCartCount } from '@/lib/cart'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import {
  Heart,
  LogOut,
  Menu,
  ShoppingBag,
  X
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import GlassSurface from './GlassSurface'


interface User {
  id: string
  name: string
  email: string
  role: string
  profileImage?: string
}

export default function Navigation() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [cartCount, setCartCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isWishlistGlowing, setIsWishlistGlowing] = useState(false)

  // glass nav animation states
  const [hidden, setHidden] = useState(false)     // hide on scroll down
  const [elevated, setElevated] = useState(false) // denser glass + shrink when scrolled
  const lastY = useRef(0)

  // progress bar
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 })

  useEffect(() => {
    fetchUserData()
  }, [])

  // Refresh cart count when user changes
  useEffect(() => {
    if (user) {
      loadCartCount()
    } else {
      setCartCount(0)
    }
  }, [user])


  const [glassW, setGlassW] = useState(0)
const glassH = elevated ? 60 : 68
const glassRadius = 18

useEffect(() => {
  const calc = () => {
    const max = 1240 // feel free to increase if you want wider bar
    const inner = Math.min(window.innerWidth - 24, max) // 12px side gap each
    setGlassW(Math.max(inner, 320))
  }
  calc()
  window.addEventListener('resize', calc)
  return () => window.removeEventListener('resize', calc)
}, [])



  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setElevated(y > 8)
      // hide when scrolling down beyond a threshold, reveal when scrolling up
      if (y > lastY.current && y > 120) setHidden(true)
      else setHidden(false)
      lastY.current = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const loadCartCount = async () => {
    try {
      const count = await getCartCount()
      setCartCount(count)
    } catch (error) {
      console.error('Error loading cart count:', error)
      setCartCount(0)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      if (response.ok) {
        setUser(null)
        setCartCount(0)
        clearAllCartData()
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('admin-token')
          localStorage.removeItem('current_user_id')
        }
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

  const getUserInitials = (name: string): string => {
    if (!name) return 'U'
    return name.split(' ').map(w => w.charAt(0)).join('').toUpperCase()
  }

  const toggleMenu = () => setIsMenuOpen(s => !s)

  // flying heart glow
  useEffect(() => {
    const handleFlyingHeartComplete = () => {
      setIsWishlistGlowing(true)
      setTimeout(() => setIsWishlistGlowing(false), 1000)
    }
    window.addEventListener('flyingHeartComplete', handleFlyingHeartComplete)
    return () => window.removeEventListener('flyingHeartComplete', handleFlyingHeartComplete)
  }, [])

  const linkBase =
    "relative text-gray-200/90 hover:text-white transition-colors duration-300 " +
    // animated underline
    "after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full " +
    "after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 " +
    "after:bg-gradient-to-r after:from-fuchsia-500 after:via-violet-500 after:to-indigo-500"

  return (
  <>
    {/* Scroll progress bar */}
    <motion.div
      className="fixed left-0 right-0 top-0 z-[60] h-[2px] bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500"
      style={{ scaleX: progress, transformOrigin: '0% 50%' }}
    />

    {/* Glass Navbar using React Bits GlassSurface */}
    <motion.nav
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: hidden ? -80 : 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 160, damping: 18 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
  <div
    className="mx-3 mt-3">
        {/* wait until width measured on client */}
        {glassW > 0 && (
          <GlassSurface
            width={glassW}
            height={glassH}
            borderRadius={glassRadius}
            //👇 tweak these for stronger/weaker glass distortion
            displace={120}
            distortionScale={-90}
            redOffset={3}
            greenOffset={10}
            blueOffset={18}
            brightness={-30}
            opacity={0.85}
            mixBlendMode="screen"
            className="!overflow-visible"
          >
            {/* Inner nav content (unchanged) */}
            <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">DΣT</span>
                  <span className="text-white">ΛCH</span>
                </span>
              </Link>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center space-x-8 ml-10">
                <Link href="/" className={linkBase}>Home</Link>
                <Link href="/shop" className={linkBase}>Shop</Link>
                <Link href="/about" className={linkBase}>About</Link>
                <Link href="/contact" className={linkBase}>Contact</Link>
              </div>

              {/* Right actions */}
              <div className="ml-auto hidden md:flex items-center space-x-2">
                {/* Cart */}
                <Link
                  href="/cart"
                  className="relative p-2 rounded-xl hover:bg-white/6 transition-colors"
                >
                  <ShoppingBag className="w-6 h-6 text-gray-200" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Wishlist */}
                <Link
                  href="/wishlist"
                  className={`p-2 rounded-xl hover:bg-white/6 transition-colors ${isWishlistGlowing ? 'text-red-500' : 'text-gray-200'}`}
                >
                  <motion.div
                    animate={isWishlistGlowing ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Heart className={`w-6 h-6 ${isWishlistGlowing ? 'fill-red-500' : ''}`} />
                  </motion.div>
                </Link>

                {/* User */}
                {loading ? (
                  <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse" />
                ) : user ? (
                  <div className="relative group">
                    <button className="w-9 h-9 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 p-[2px]">
                      <span className="block w-full h-full rounded-full bg-black/60 overflow-hidden">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="w-full h-full grid place-items-center text-white text-xs font-bold">
                            {getUserInitials(user.name)}
                          </span>
                        )}
                      </span>
                    </button>

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-3 w-56 rounded-xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200">
                      <div className="p-3 border-b border-white/10">
                        <p className="text-sm text-white font-medium">{user.name}</p>
                        <p className="text-xs text-gray-300/80 truncate">{user.email}</p>
                      </div>
                      <Link
                        href={user.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard'}
                        className="block px-4 py-3 text-sm text-gray-200/90 hover:text-white hover:bg-white/5 rounded-t-none transition-colors"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-200/90 hover:text-white hover:bg-white/5 rounded-b-xl transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="ml-1 inline-flex items-center justify-center h-9 px-4 rounded-full text-white font-semibold bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:opacity-95 transition"
                  >
                    Login
                  </Link>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={toggleMenu}
                className="md:hidden ml-auto p-2 rounded-xl hover:bg-white/10 text-gray-200 transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </GlassSurface>
        )}
      </div>
    </motion.nav>

    {/* Mobile Menu (glassy) */}
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="fixed top-[76px] left-0 right-0 z-40 md:hidden px-3"
        >
          <div className="rounded-2xl border border-white/10 bg-black/55 backdrop-blur-2xl shadow-2xl">
            <div className="px-5 py-4 space-y-3">
              <Link href="/" onClick={() => setIsMenuOpen(false)} className={linkBase}>Home</Link>
              <Link href="/shop" onClick={() => setIsMenuOpen(false)} className={linkBase}>Shop</Link>
              <Link href="/about" onClick={() => setIsMenuOpen(false)} className={linkBase}>About</Link>
              <Link href="/contact" onClick={() => setIsMenuOpen(false)} className={linkBase}>Contact</Link>

              <div className="pt-4 mt-2 border-t border-white/10 flex items-center gap-4">
                <Link
                  href="/cart"
                  onClick={() => setIsMenuOpen(false)}
                  className="relative p-2 rounded-xl hover:bg-white/10 text-gray-200 transition"
                >
                  <ShoppingBag className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-200 transition"
                >
                  <Heart className="w-6 h-6" />
                </Link>

                {user ? (
                  <div className="ml-auto flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-white/20">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="w-full h-full grid place-items-center bg-white/10 text-white text-xs font-semibold">
                          {getUserInitials(user.name)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-xl hover:bg-white/10 text-gray-200 transition"
                      title="Logout"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="ml-auto inline-flex items-center justify-center h-9 px-4 rounded-full text-white font-semibold bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:opacity-95 transition"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
) 
}