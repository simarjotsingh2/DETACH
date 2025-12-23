import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    const where: any = {}
    if (category && category !== 'ALL') where.category = category
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    if (featured === 'true') where.isFeatured = true

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        // NOTE: no select -> modelUrls & hasModel will be returned automatically
      }),
      prisma.product.count({ where })
    ])

    return NextResponse.json({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    if (!name || !description || price === undefined || stock === undefined || !category) {
      return NextResponse.json(
        { error: 'Name, description, price, stock, and category are required' },
        { status: 400 }
      )
    }

    const validImageUrls = Array.isArray(imageUrls)
      ? imageUrls.filter((u: string) => u && u.trim() !== '')
      : []

    // NEW: basic sanity for .glb list (optional – keeps empty array if not provided)
    const validModelUrls: string[] = Array.isArray(modelUrls)
      ? modelUrls.filter((u: string) => typeof u === 'string' && u.trim() !== '')
      : []

    const validSizes = Array.isArray(sizes) ? sizes : []

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        originalPrice: originalPrice !== undefined && originalPrice !== null
          ? Number(originalPrice)
          : null,
        stock: Number(stock),
        category,
        imageUrls: validImageUrls,
        sizes: validSizes,
        isFeatured: Boolean(isFeatured),
        discount: discount !== undefined && discount !== null ? Number(discount) : 0,
        isActive: isActive === undefined ? true : Boolean(isActive),
        displayOrder: displayOrder !== undefined && displayOrder !== null ? Number(displayOrder) : 0,
        // NEW 👇
        modelUrls: validModelUrls,
        hasModel: validModelUrls.length > 0
      } as any
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
