import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true, name: true }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Calculate reserved stock from all carts (including expired ones for safety)
    const reservedStock = await prisma.cart.aggregate({
      where: { productId: productId },
      _sum: { quantity: true }
    })

    const totalReserved = reservedStock._sum.quantity || 0
    const availableStock = Math.max(0, product.stock - totalReserved)

    return NextResponse.json({
      totalStock: product.stock,
      reservedStock: totalReserved,
      availableStock: availableStock,
      productName: product.name
    })
  } catch (error) {
    console.error('Stock check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
