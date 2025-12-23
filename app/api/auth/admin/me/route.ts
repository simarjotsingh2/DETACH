import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get admin token from cookies
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      // Check if this is a browser request (has user-agent) vs static generation
      const userAgent = request.headers.get('user-agent')
      
      if (userAgent) {
        // This is a browser request - admin is not logged in
        return NextResponse.json(
          { error: 'No admin authentication token found' },
          { status: 401 }
        )
      } else {
        // This is static generation - return empty admin data
        return NextResponse.json({
          admin: {
            id: '',
            email: '',
            firstName: '',
            lastName: '',
            phoneNumber: null,
            address: null,
            city: null,
            state: null,
            zipCode: null,
            country: null,
            profileImage: null,
            bio: null,
            department: null,
            permissions: [],
            isActive: true,
            lastLoginAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        })
      }
    }

    // Verify token
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid admin token' },
        { status: 401 }
      )
    }

    // Get admin from database
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        profileImage: true,
        bio: true,
        department: true,
        permissions: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      )
    }

    if (!admin.isActive) {
      return NextResponse.json(
        { error: 'Admin account is deactivated' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        phoneNumber: admin.phoneNumber,
        address: admin.address,
        city: admin.city,
        state: admin.state,
        zipCode: admin.zipCode,
        country: admin.country,
        profileImage: admin.profileImage,
        bio: admin.bio,
        department: admin.department,
        permissions: admin.permissions,
        isActive: admin.isActive,
        lastLoginAt: admin.lastLoginAt,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      }
    })

  } catch (error) {
    console.error('Get admin data error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 