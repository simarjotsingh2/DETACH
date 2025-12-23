import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

type Params = { params: { id: string } }

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const product = await prisma.product.findUnique({ where: { id: params.id } })
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    return NextResponse.json(product)
  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const token = request.cookies.get('admin-token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      price,
      originalPrice,
      stock,
      category,
      imageUrls,
      sizes,
      isFeatured,
      discount,
      isActive,
      displayOrder,
      // NEW 👇
      modelUrls
    } = body

    const updateData: any = {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: Number(price) }),
      ...(originalPrice !== undefined && { originalPrice: originalPrice === null ? null : Number(originalPrice) }),
      ...(stock !== undefined && { stock: Number(stock) }),
      ...(category !== undefined && { category }),
      ...(imageUrls !== undefined && { imageUrls }),
      ...(sizes !== undefined && { sizes }),
      ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
      ...(discount !== undefined && { discount: Number(discount) }),
      ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) }),
      // NEW 👇
      ...(modelUrls !== undefined && { modelUrls }),
      ...(modelUrls !== undefined && { hasModel: Array.isArray(modelUrls) && modelUrls.length > 0 })
    }

    const product = await prisma.product.update({ where: { id: params.id }, data: updateData })
    return NextResponse.json(product)
  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const token = request.cookies.get('admin-token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.product.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Product deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
