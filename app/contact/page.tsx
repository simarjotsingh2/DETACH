"use client"

import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, MapPin, Phone, Send, CheckCircle, XCircle, X } from 'lucide-react'
import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message })
    // Auto-hide success alert after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        setAlert({ type: null, message: '' })
      }, 5000)
    }
  }

  const dismissAlert = () => {
    setAlert({ type: null, message: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.message) {
      showAlert('error', 'Please fill in all fields')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          _subject: `Contact Form Submission from ${formData.name}`,
          _replyto: formData.email
        })
      })

      if (response.ok) {
        showAlert('success', 'Message sent successfully! We\'ll get back to you soon.')
        setFormData({ name: "", email: "", message: "" })
      } else {
        showAlert('error', 'Failed to send message. Please try again.')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      showAlert('error', 'Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-black">
      <Navigation />

      {/* Custom Alert */}
      <AnimatePresence>
        {alert.type && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-4 right-4 z-50 max-w-md"
          >
            <div className={`relative p-4 rounded-xl shadow-2xl border-l-4 ${
              alert.type === 'success' 
                ? 'bg-gradient-to-r from-green-900/90 to-green-800/90 border-green-400 backdrop-blur-sm' 
                : 'bg-gradient-to-r from-red-900/90 to-red-800/90 border-red-400 backdrop-blur-sm'
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {alert.type === 'success' ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <h3 className={`text-sm font-semibold ${
                    alert.type === 'success' ? 'text-green-100' : 'text-red-100'
                  }`}>
                    {alert.type === 'success' ? 'Success!' : 'Error'}
                  </h3>
                  <p className={`mt-1 text-sm ${
                    alert.type === 'success' ? 'text-green-200' : 'text-red-200'
                  }`}>
                    {alert.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button
                    onClick={dismissAlert}
                    className={`rounded-full p-1 transition-colors duration-200 ${
                      alert.type === 'success' 
                        ? 'text-green-300 hover:text-green-100 hover:bg-green-700/30' 
                        : 'text-red-300 hover:text-red-100 hover:bg-red-700/30'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Progress bar for success alerts */}
              {alert.type === 'success' && (
                <div className="mt-3 w-full bg-green-700/30 rounded-full h-1">
                  <motion.div
                    className="bg-green-400 h-1 rounded-full"
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 5, ease: "linear" }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative pt-28 md:pt-32 pb-16 border-b border-primary-800 bg-gradient-to-b from-black via-primary-900/40 to-black">
        <div className="container-custom px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
              <span className="text-white">CONTACT</span> <span className="text-gradient">US</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed">
              Questions, collaborations, or feedback—drop us a line.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 card"
            >
              <h2 className="text-2xl font-semibold text-white mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Name</label>
                  <input
                    name="name"
                    className="input-field w-full"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email</label>
                  <input
                    name="email"
                    className="input-field w-full"
                    placeholder="you@example.com"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Message</label>
                  <textarea
                    name="message"
                    className="input-field w-full min-h-[140px]"
                    placeholder="Tell us what's on your mind..."
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="card"
            >
              <h2 className="text-2xl font-semibold text-white mb-6">Contact info</h2>
              <div className="space-y-5 text-gray-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-accent-400 mt-0.5" />
                  <div>
                    123 Street Style Ave
                    <br /> Urban District, City 12345
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-accent-400" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-accent-400" />
                  <a href="mailto:info@edgyfashion.com" className="hover:text-accent-400 transition-colors">info@edgyfashion.com</a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}


