import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, generateToken } from '@/lib/auth'
import { isOTPVerified, deleteOTP } from '@/lib/otp'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, otp, role = 'CUSTOMER' } = await request.json()

    if (!name || !email || !password || !otp) {
      return NextResponse.json(
        { error: 'Name, email, password and OTP are required' },
        { status: 400 }
      )
    }

    // Check if OTP is verified
    const otpVerified = await isOTPVerified(email)
    if (!otpVerified) {
      return NextResponse.json(
        { error: 'Please verify your email with OTP first' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER'
      }
    })

    // Clean up OTP after successful registration
    await deleteOTP(email)

    // Send welcome email (don't wait for it to complete)
    sendWelcomeEmail(user.email, user.name).catch(error => {
      console.error('Failed to send welcome email:', error)
    })

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    const response = NextResponse.json({
      message: 'Account created successfully! Welcome to ROT KIT.',
      user: userWithoutPassword,
      token
    }, { status: 201 })

    // Set appropriate cookie based on user role
    const cookieName = user.role === 'ADMIN' ? 'admin-token' : 'user-token'
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

