import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Clean expired cart items (older than 2 hours)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    
    const deletedItems = await prisma.cart.deleteMany({
      where: {
        addedAt: {
          lt: twoHoursAgo
        }
      }
    })

    return NextResponse.json({ 
      message: 'Cart cleanup completed',
      deletedItems: deletedItems.count
    })
  } catch (error) {
    console.error('Cart cleanup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
