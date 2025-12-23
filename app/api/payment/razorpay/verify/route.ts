import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendOrderConfirmationEmail } from '@/lib/email'
import crypto from 'crypto'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication - check both user and admin tokens
    const token = request.cookies.get('user-token')?.value || request.cookies.get('admin-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
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


    const body = await request.json()
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderData // Cart items, total, user info for creating DB order
    } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment verification data' },
        { status: 400 }
      )
    }

    // Verify payment signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) {
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      )
    }

    const body_to_verify = razorpay_order_id + '|' + razorpay_payment_id
    const expected_signature = crypto
      .createHmac('sha256', keySecret)
      .update(body_to_verify.toString())
      .digest('hex')

    if (expected_signature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      )
    }

    // Payment verified successfully - now create order in database directly
    if (orderData && orderData.items && orderData.totalPrice) {
      try {
        // Create order directly in database instead of HTTP call
        const result = await prisma.$transaction(async (tx) => {
          // Create the order
          const order = await tx.order.create({
            data: {
              userId: decoded.id,
              totalPrice: parseFloat(orderData.totalPrice),
              items: {
                create: orderData.items.map((item: any) => ({
                  productId: item.id,
                  quantity: item.quantity,
                  price: item.price,
                  sizes: item.selectedSize || ''
                }))
              }
            },
            include: {
              items: {
                include: {
                  product: true
                }
              }
            }
          })

          // Update product stock atomically
          for (const item of orderData.items) {
            await tx.product.update({
              where: { id: item.id },
              data: {
                stock: {
                  decrement: item.quantity
                }
              }
            })
          }

          // Clear user's cart after successful order
          await tx.cart.deleteMany({
            where: {
              userId: decoded.id
            }
          })

          return order
        })

        // Fire-and-forget order confirmation email (no UI impact if email fails)
        try {
          const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
            .toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
          await sendOrderConfirmationEmail({
            email: decoded.email,
            name: decoded.name || 'Customer',
            orderId: result.id,
            items: result.items.map((it: any) => ({
              name: it.product.name,
              imageUrl: Array.isArray(it.product.imageUrls) && it.product.imageUrls.length ? it.product.imageUrls[0] : '',
              quantity: it.quantity,
              price: it.price,
              size: it.sizes || undefined,
            })),
            totalPrice: result.totalPrice,
            estimatedDelivery,
          })
        } catch (mailErr) {
          console.error('Order confirmation email failed:', mailErr)
        }

        return NextResponse.json({
          success: true,
          message: 'Payment verified and order created successfully',
          orderId: result.id,
          paymentId: razorpay_payment_id
        })

      } catch (orderError) {
        console.error('Order creation error after payment:', orderError)
        return NextResponse.json(
          { error: 'Payment successful but order creation failed. Please contact support.' },
          { status: 500 }
        )
      }
    }

    // If no order data provided, just verify payment
    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
