import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    console.log('Decoded token:', decoded)
    
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Request body:', body)

    // Only update fields that are provided
    const updateData: any = {}
    
    if (body.profileImage !== undefined) updateData.profileImage = body.profileImage
    if (body.firstName !== undefined) updateData.firstName = body.firstName
    if (body.lastName !== undefined) updateData.lastName = body.lastName
    if (body.email !== undefined) updateData.email = body.email
    if (body.phoneNumber !== undefined) updateData.phoneNumber = body.phoneNumber
    if (body.department !== undefined) updateData.department = body.department
    if (body.bio !== undefined) updateData.bio = body.bio

    console.log('Update data:', updateData)
    
    // Try different possible admin ID fields
    const adminId = decoded.adminId || decoded.id || decoded.userId
    console.log('Admin ID:', adminId)

    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID not found in token' },
        { status: 400 }
      )
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: updateData
    })

    console.log('Updated admin:', updatedAdmin)
    return NextResponse.json(updatedAdmin)
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 