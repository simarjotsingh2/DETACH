import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/cart - Starting request')
    
    const token = request.cookies.get('user-token')?.value
    console.log('Token found:', !!token)
    
    if (!token) {
      console.log('No token provided')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    console.log('Token decoded:', !!decoded)
    
    if (!decoded) {
      console.log('Invalid token')
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Request body:', body)
    
    const { productId, quantity, sizes } = body
    const sizeValue: string = sizes || ''

    if (!productId || !quantity || quantity < 1) {
      console.log('Invalid request data:', { productId, quantity })
      return NextResponse.json(
        { error: 'Product ID and valid quantity are required' },
        { status: 400 }
      )
    }

    // Check if product exists and calculate available stock
    console.log('Looking for product with ID:', productId)
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      console.log('Product not found:', productId)
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    console.log('Product found:', product.name)

    // Calculate reserved stock (items in carts)
    console.log('Calculating reserved stock for product:', productId)
    const reservedStock = await prisma.cart.aggregate({
      where: { productId: productId },
      _sum: { quantity: true }
    })

    const totalReserved = reservedStock._sum.quantity || 0
    const availableStock = product.stock - totalReserved
    console.log('Stock info:', { total: product.stock, reserved: totalReserved, available: availableStock })

    if (availableStock < quantity) {
      return NextResponse.json(
        { error: `Only ${availableStock} items available in stock` },
        { status: 400 }
      )
    }

    // Check if item already exists in cart with same size
    console.log('Checking existing cart item for user:', decoded.id, 'product:', productId, 'size:', sizes)
    const existingCartItem = await prisma.cart.findUnique({
      where: {
        userId_productId_sizes: {
          userId: decoded.id,
          productId: productId,
          sizes: sizeValue
        }
      }
    })
    console.log('Existing cart item:', existingCartItem ? 'found' : 'not found')

    if (existingCartItem) {
      // Update quantity and timestamp
      const newQuantity = existingCartItem.quantity + quantity
      
      if (product.stock < newQuantity) {
        return NextResponse.json(
          { error: 'Insufficient stock for requested quantity' },
          { status: 400 }
        )
      }

      const updatedCartItem = await prisma.cart.update({
        where: {
          userId_productId_sizes: {
            userId: decoded.id,
            productId: productId,
            sizes: sizeValue
          }
        },
        data: {
          quantity: newQuantity,
          sizes: sizeValue,
          addedAt: new Date()
        }
      })

      return NextResponse.json(updatedCartItem)
    } else {
      // Create new cart item
      const cartItem = await prisma.cart.create({
        data: {
          userId: decoded.id,
          productId: productId,
          quantity: quantity,
          sizes: sizeValue
        }
      })

      return NextResponse.json(cartItem)
    }
  } catch (error) {
    console.error('Cart operation error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('user-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Clean expired cart items first
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    await prisma.cart.deleteMany({
      where: {
        addedAt: {
          lt: twoHoursAgo
        }
      }
    })

    // Get current cart items with product details
    const cartItems = await prisma.cart.findMany({
      where: {
        userId: decoded.id
      },
      include: {
        product: true
      }
    })

    return NextResponse.json({ cartItems })
  } catch (error) {
    console.error('Cart fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('user-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { productId, quantity, sizes } = await request.json()
    const sizeValue: string = sizes || ''

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Product ID and quantity are required' },
        { status: 400 }
      )
    }

    if (quantity < 0) {
      return NextResponse.json(
        { error: 'Quantity must be non-negative' },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Prefer the specific size variant if provided
    let existingCartItem = sizes !== undefined ? await prisma.cart.findUnique({
      where: {
        userId_productId_sizes: {
          userId: decoded.id,
          productId: productId,
          sizes: sizeValue
        }
      }
    }) : await prisma.cart.findFirst({
      where: {
        userId: decoded.id,
        productId: productId
      }
    })

    if (!existingCartItem) {
      // If updating size to a new variant (sizes provided) and current variant not found,
      // try to find any existing record for this product to reassign its size.
      if (sizes !== undefined) {
        const anyItem = await prisma.cart.findFirst({
          where: {
            userId: decoded.id,
            productId: productId
          }
        })
        if (!anyItem) {
          return NextResponse.json(
            { error: 'Item not found in cart' },
            { status: 404 }
          )
        }
        existingCartItem = anyItem
      } else {
        return NextResponse.json(
          { error: 'Item not found in cart' },
          { status: 404 }
        )
      }
    }

    if (quantity === 0) {
      // Remove item from cart
      await prisma.cart.delete({
        where: {
          userId_productId_sizes: {
            userId: decoded.id,
            productId: productId,
            sizes: sizeValue
          }
        }
      })
    } else {
      // Check stock availability
      if (quantity > product.stock) {
        return NextResponse.json(
          { error: `Only ${product.stock} items available in stock` },
          { status: 400 }
        )
      }

      // Update quantity and possibly size
      if (sizes === undefined || existingCartItem.sizes === sizeValue) {
        // Simple quantity update on the same variant
        await prisma.cart.update({
          where: { id: existingCartItem.id },
          data: {
            quantity: quantity,
            addedAt: new Date()
          }
        })
      } else {
        // Changing size: if a target variant exists, update that one; else reassign current record's size
        const targetVariant = await prisma.cart.findUnique({
          where: {
            userId_productId_sizes: {
              userId: decoded.id,
              productId: productId,
              sizes: sizeValue
            }
          }
        })

        if (targetVariant) {
          // Update target variant's quantity and delete the old one
          await prisma.cart.update({
            where: { id: targetVariant.id },
            data: {
              quantity: quantity,
              addedAt: new Date()
            }
          })
          await prisma.cart.delete({
            where: { id: existingCartItem.id }
          })
        } else {
          // Reassign the current record's size
          await prisma.cart.update({
            where: { id: existingCartItem.id },
            data: {
              sizes: sizeValue,
              quantity: quantity,
              addedAt: new Date()
            }
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('user-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    let productId = null
    let sizes: string | null = null
    
    try {
      const body = await request.json()
      productId = body.productId
      sizes = body.sizes ?? null
    } catch (error) {
      // No body or invalid JSON, treat as clear cart request
      productId = null
    }

    if (productId) {
      const sizeValue: string = sizes || ''
      try {
        if (sizes !== null) {
          // Remove specific size variant
          await prisma.cart.delete({
            where: {
              userId_productId_sizes: {
                userId: decoded.id,
                productId: productId,
                sizes: sizeValue
              }
            }
          })
        } else {
          // Remove all sizes for this product
          await prisma.cart.deleteMany({
            where: {
              userId: decoded.id,
              productId: productId
            }
          })
        }
      } catch (deleteError) {
        console.error('Error deleting cart item:', deleteError)
        return NextResponse.json(
          { error: 'Item not found in cart' },
          { status: 404 }
        )
      }
    } else {
      // Clear entire cart
      await prisma.cart.deleteMany({
        where: {
          userId: decoded.id
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
