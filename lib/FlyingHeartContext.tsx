'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart } from 'lucide-react'

interface FlyingHeartContextType {
  triggerFlyingHeart: (startPosition: { x: number; y: number }) => void
}

const FlyingHeartContext = createContext<FlyingHeartContextType | undefined>(undefined)

export const useFlyingHeart = () => {
  const context = useContext(FlyingHeartContext)
  if (!context) {
    throw new Error('useFlyingHeart must be used within a FlyingHeartProvider')
  }
  return context
}

interface FlyingHeartProviderProps {
  children: React.ReactNode
}

export const FlyingHeartProvider = ({ children }: FlyingHeartProviderProps) => {
  const [flyingHearts, setFlyingHearts] = useState<Array<{ id: string; startPosition: { x: number; y: number } }>>([])

  const triggerFlyingHeart = useCallback((startPosition: { x: number; y: number }) => {
    const id = Math.random().toString(36).substr(2, 9)
    setFlyingHearts(prev => [...prev, { id, startPosition }])
    
    console.log('💖 Creating flying heart with ID:', id, 'at position:', startPosition)
    
    // Remove the heart after animation completes and trigger glow
    setTimeout(() => {
      setFlyingHearts(prev => prev.filter(heart => heart.id !== id))
      // Trigger the glow effect
      window.dispatchEvent(new CustomEvent('flyingHeartComplete'))
      console.log('💖 Flying heart animation completed!')
    }, 4000) // Increased duration for longer visible path
  }, [])

  return (
    <FlyingHeartContext.Provider value={{ triggerFlyingHeart }}>
      {children}
      
      {/* Flying Hearts */}
      <AnimatePresence>
        {flyingHearts.map((heart) => {
          // Calculate target position (wishlist icon in navigation)
          const targetX = typeof window !== 'undefined' ? window.innerWidth - 80 : 0
          const targetY = 20
          
          console.log('💖 Rendering flying heart:', heart.id, 'from', heart.startPosition, 'to', { x: targetX, y: targetY })
          
          return (
            <motion.div
              key={heart.id}
              className="fixed pointer-events-none"
              style={{
                zIndex: 99999,
                left: 0,
                top: 0
              }}
              initial={{
                x: heart.startPosition.x - 20,
                y: heart.startPosition.y - 20,
                scale: 0,
                opacity: 0
              }}
              animate={{
                x: targetX,
                y: targetY,
                scale: [0, 2, 1.5, 1.2],
                opacity: [0, 1, 1, 1, 1, 0.8, 0],
                rotate: [0, 20, -20, 15, -15, 0]
              }}
              exit={{ 
                opacity: 0,
                scale: 0
              }}
              transition={{
                duration: 4,
                ease: [0.25, 0.46, 0.45, 0.94],
                times: [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1]
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 30px #ef4444, 0 0 60px #ef4444, 0 0 90px #ef4444',
                  border: '3px solid #ffffff'
                }}
              >
                <Heart 
                  className="w-6 h-6 text-white fill-white" 
                  style={{
                    filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))'
                  }}
                />
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </FlyingHeartContext.Provider>
  )
} 