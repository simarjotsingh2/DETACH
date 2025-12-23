import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("user-token")?.value
    
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    console.log('Decoded token:', decoded)
    
    if (!decoded || decoded.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Request body:', body)

    // Only update fields that are provided
    const updateData: any = {}
    
    if (body.profileImage !== undefined) updateData.profileImage = body.profileImage
    if (body.name !== undefined) updateData.name = body.name
    if (body.email !== undefined) updateData.email = body.email
    if (body.phoneNumber !== undefined) updateData.phoneNumber = body.phoneNumber
    if (body.countryCode !== undefined) updateData.countryCode = body.countryCode
    if (body.address !== undefined) updateData.address = body.address
    if (body.city !== undefined) updateData.city = body.city
    if (body.state !== undefined) updateData.state = body.state
    if (body.zipCode !== undefined) updateData.zipCode = body.zipCode
    if (body.country !== undefined) updateData.country = body.country
    if (body.landmark !== undefined) updateData.landmark = body.landmark
    if (body.areaOrStreet !== undefined) updateData.areaOrStreet = body.areaOrStreet

    console.log('Update data:', updateData)

    const userId = decoded.id || decoded.userId
    console.log('User ID:', userId)

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in token" },
        { status: 400 }
      )
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    console.log('Updated user:', updatedUser)
    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("user-token")?.value

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    console.log('Decoded token:', decoded)

    if (!decoded || decoded.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Request body:', body)

    // Only update fields that are provided
    const updateData: any = {}

    if (body.profileImage !== undefined) updateData.profileImage = body.profileImage
    if (body.name !== undefined) updateData.name = body.name
    if (body.email !== undefined) updateData.email = body.email
    if (body.phoneNumber !== undefined) updateData.phoneNumber = body.phoneNumber
    if (body.countryCode !== undefined) updateData.countryCode = body.countryCode
    if (body.address !== undefined) updateData.address = body.address
    if (body.city !== undefined) updateData.city = body.city
    if (body.state !== undefined) updateData.state = body.state
    if (body.zipCode !== undefined) updateData.zipCode = body.zipCode
    if (body.country !== undefined) updateData.country = body.country
    if (body.landmark !== undefined) updateData.landmark = body.landmark
    if (body.areaOrStreet !== undefined) updateData.areaOrStreet = body.areaOrStreet

    console.log('Update data:', updateData)

    const userId = decoded.id || decoded.userId
    console.log('User ID:', userId)

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in token" },
        { status: 400 }
      )
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    console.log('Updated user:', updatedUser)
    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 