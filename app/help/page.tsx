'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  MessageCircle,
  Clock,
  Package,
  CreditCard,
  Shield,
  Truck,
  RotateCcw,
  User,
  ShoppingCart,
  HelpCircle,
  ExternalLink
} from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Topics', icon: HelpCircle },
    { id: 'orders', name: 'Orders & Shipping', icon: Package },
    { id: 'account', name: 'Account & Profile', icon: User },
    { id: 'payment', name: 'Payment & Billing', icon: CreditCard },
    { id: 'returns', name: 'Returns & Refunds', icon: RotateCcw },
    { id: 'technical', name: 'Technical Support', icon: Shield }
  ]

  const faqs = [
    {
      id: 1,
      category: 'orders',
      question: 'How do I track my order?',
      answer: 'You can track your order by logging into your account and visiting the "Orders" section. You\'ll find tracking information and real-time updates on your order status. You can also use the tracking number sent to your email.'
    },
    {
      id: 2,
      category: 'orders',
      question: 'What are your shipping options and delivery times?',
      answer: 'We offer several shipping options: Standard (5-7 business days), Express (2-3 business days), and Overnight (1 business day). Free shipping is available on orders over ₹50. Delivery times may vary based on your location and product availability.'
    },
    {
      id: 3,
      category: 'returns',
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for most items. Items must be in original condition with tags attached. Some restrictions apply to certain products like undergarments and personalized items. Return shipping is free for defective items.'
    },
    {
      id: 4,
      category: 'returns',
      question: 'How do I initiate a return?',
      answer: 'To start a return, log into your account, go to "Orders", find the item you want to return, and click "Return Item". Follow the prompts to print a return label and drop off at any authorized location.'
    },
    {
      id: 5,
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and UPI payments. All transactions are secured with SSL encryption for your safety.'
    },
    {
      id: 6,
      category: 'payment',
      question: 'Is my payment information secure?',
      answer: 'Yes, we use industry-standard SSL encryption and tokenized payment processing. Your card information is never stored on our servers. We are PCI DSS compliant and follow strict security protocols.'
    },
    {
      id: 7,
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Click "Sign Up" in the top navigation, fill in your details, and verify your email address. Having an account allows you to track orders, save addresses, and access exclusive member benefits.'
    },
    {
      id: 8,
      category: 'account',
      question: 'I forgot my password. How do I reset it?',
      answer: 'Click "Forgot Password" on the login page, enter your email address, and we\'ll send you a reset link. Follow the instructions in the email to create a new password.'
    },
    {
      id: 9,
      category: 'technical',
      question: 'The website is not loading properly. What should I do?',
      answer: 'Try clearing your browser cache and cookies, disable browser extensions, or try a different browser. If the problem persists, contact our technical support team with details about your browser and device.'
    },
    {
      id: 10,
      category: 'orders',
      question: 'Can I modify or cancel my order?',
      answer: 'Orders can be modified or cancelled within 1 hour of placement. After that, orders enter processing and cannot be changed. Contact customer service immediately if you need to make changes.'
    }
  ]

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email',
      contact: 'support@rotbrand.com',
      availability: '24/7 - Response within 24 hours'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak with our team',
      contact: '+1 (555) 123-4567',
      availability: 'Mon-Fri: 9 AM - 8 PM EST'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Instant messaging support',
      contact: 'Available on website',
      availability: 'Mon-Fri: 9 AM - 6 PM EST'
    }
  ]

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <div className="pt-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-primary-900 to-black py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              How can we help you?
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-300 mb-8"
            >
              Find answers to common questions or get in touch with our support team
            </motion.p>
            
            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative max-w-2xl mx-auto"
            >
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-primary-800 border border-primary-700 text-white rounded-lg pl-12 pr-4 py-4 focus:border-accent-500 focus:outline-none transition-colors"
              />
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-primary-900 border border-primary-800 rounded-lg p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-white mb-4">Help Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const Icon = category.icon
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeCategory === category.id
                            ? 'bg-accent-600 text-white'
                            : 'text-gray-300 hover:bg-primary-800 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{category.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-primary-900 border border-primary-800 rounded-lg p-6 hover:border-accent-500 transition-colors cursor-pointer"
                >
                  <Package className="w-8 h-8 text-accent-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Track Your Order</h3>
                  <p className="text-gray-300 text-sm mb-4">Get real-time updates on your order status</p>
                  <a href="/user/dashboard#orders" className="text-accent-400 hover:text-accent-300 text-sm font-medium flex items-center gap-1">
                    Go to Orders <ExternalLink className="w-3 h-3" />
                  </a>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-primary-900 border border-primary-800 rounded-lg p-6 hover:border-accent-500 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-8 h-8 text-accent-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Start a Return</h3>
                  <p className="text-gray-300 text-sm mb-4">Easy returns within 30 days</p>
                  <a href="/user/dashboard#orders" className="text-accent-400 hover:text-accent-300 text-sm font-medium flex items-center gap-1">
                    Return Item <ExternalLink className="w-3 h-3" />
                  </a>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-primary-900 border border-primary-800 rounded-lg p-6 hover:border-accent-500 transition-colors cursor-pointer"
                >
                  <User className="w-8 h-8 text-accent-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Manage Account</h3>
                  <p className="text-gray-300 text-sm mb-4">Update your profile and preferences</p>
                  <a href="/user/dashboard" className="text-accent-400 hover:text-accent-300 text-sm font-medium flex items-center gap-1">
                    Go to Account <ExternalLink className="w-3 h-3" />
                  </a>
                </motion.div>
              </div>

              {/* FAQ Section */}
              <div className="bg-primary-900 border border-primary-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
                
                {filteredFAQs.length === 0 ? (
                  <div className="text-center py-8">
                    <HelpCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No questions found matching your search.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredFAQs.map((faq) => (
                      <motion.div
                        key={faq.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border border-primary-700 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFAQ(faq.id)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-primary-800 transition-colors"
                        >
                          <span className="text-white font-medium">{faq.question}</span>
                          {expandedFAQ === faq.id ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        {expandedFAQ === faq.id && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="border-t border-primary-700"
                          >
                            <div className="p-4 bg-primary-800">
                              <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact Support */}
              <div className="bg-primary-900 border border-primary-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Contact Support</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {contactMethods.map((method, index) => {
                    const Icon = method.icon
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="bg-primary-800 border border-primary-700 rounded-lg p-6 text-center hover:border-accent-500 transition-colors"
                      >
                        <Icon className="w-8 h-8 text-accent-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">{method.title}</h3>
                        <p className="text-gray-300 text-sm mb-3">{method.description}</p>
                        <p className="text-accent-400 font-medium mb-2">{method.contact}</p>
                        <p className="text-gray-400 text-xs">{method.availability}</p>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Additional Resources */}
              <div className="bg-primary-900 border border-primary-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Additional Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Policies & Guidelines</h3>
                    <div className="space-y-2">
                      <a href="/privacy" className="block text-accent-400 hover:text-accent-300 text-sm">Privacy Policy</a>
                      <a href="/terms" className="block text-accent-400 hover:text-accent-300 text-sm">Terms of Service</a>
                      <a href="/shipping" className="block text-accent-400 hover:text-accent-300 text-sm">Shipping Information</a>
                      <a href="/returns" className="block text-accent-400 hover:text-accent-300 text-sm">Return Policy</a>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Shopping Help</h3>
                    <div className="space-y-2">
                      <a href="/size-guide" className="block text-accent-400 hover:text-accent-300 text-sm">Size Guide</a>
                      <a href="/care-instructions" className="block text-accent-400 hover:text-accent-300 text-sm">Care Instructions</a>
                      <a href="/gift-cards" className="block text-accent-400 hover:text-accent-300 text-sm">Gift Cards</a>
                      <a href="/loyalty" className="block text-accent-400 hover:text-accent-300 text-sm">Loyalty Program</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
