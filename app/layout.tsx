import { FlyingHeartProvider } from '@/lib/FlyingHeartContext'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ROT KIT | Streetwear & Urban Style',
  description: 'Discover the latest in edgy streetwear fashion. Premium quality clothing with bold designs for the urban rebel.',
  keywords: 'streetwear, urban fashion, edgy clothing, street style, fashion brand',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="module"
          src="https://unpkg.com/@google/model-viewer@3.3.0/dist/model-viewer.min.js"
        ></script>
      </head>
      <body className={`${inter.className} antialiased`}>
        <FlyingHeartProvider>
          {children}
        </FlyingHeartProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a1a',
              color: '#fafafa',
              border: '1px solid #374151',
            },
          }}
        />
      </body>
    </html>
  )
}
