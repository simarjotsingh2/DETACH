'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store token in localStorage for authentication
        if (data.token) {
          localStorage.setItem('admin-token', data.token)
        }
        
        toast.success('Admin login successful!')
        router.push('/admin/dashboard')
      } else {
        toast.error(data.error || 'Admin login failed')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-4xl font-display font-bold text-gradient">
            EDGY FASHION
          </span>
          <p className="text-gray-400 mt-2">Admin Portal</p>
        </div>

        {/* Login Form */}
        <div className="bg-primary-900 border border-primary-800 rounded-lg p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-accent-600/20 rounded-lg">
              <Shield className="w-8 h-8 text-accent-500" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-8">
            ADMIN LOGIN
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-primary-800 border border-primary-700 text-white rounded-lg focus:border-accent-500 focus:outline-none transition-colors duration-300"
                  placeholder="admin1@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-primary-800 border border-primary-700 text-white rounded-lg focus:border-accent-500 focus:outline-none transition-colors duration-300"
                  placeholder="Enter admin password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'SIGN IN AS ADMIN'}
            </button>
          </form>

          {/* Admin Info */}
          <div className="mt-6 p-4 bg-primary-800 rounded-lg">
            <p className="text-sm text-gray-400 text-center">
              <strong>Default Admin Credentials:</strong><br />
              Email: admin1@email.com<br />
              Password: Admin@2003
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            © 2024 Edgy Fashion. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
