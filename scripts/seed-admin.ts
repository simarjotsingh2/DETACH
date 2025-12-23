import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedAdmin() {
  try {
    console.log('🌱 Starting admin seeding...')
    
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: 'admin1@email.com' }
    })

    if (existingAdmin) {
      console.log('✅ Admin already exists with email: admin1@email.com')
      console.log('📧 Email: admin1@email.com')
      console.log('🔑 Password: Admin@69')
      console.log(' Admin ID:', existingAdmin.id)
      return existingAdmin
    }

    // Hash the password
    console.log('🔐 Hashing password...')
    const hashedPassword = await bcrypt.hash('Admin@69', 12)

    // Create admin
    console.log('👤 Creating admin user...')
    const admin = await prisma.admin.create({
      data: {
        email: 'admin1@email.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: '+1234567890',
        address: '123 Admin Street',
        city: 'Admin City',
        state: 'Admin State',
        zipCode: '12345',
        country: 'Admin Country',
        bio: 'Main administrator of Edgy Fashion e-commerce platform',
        department: 'Management',
        permissions: ['all'],
        isActive: true
      }
    })

    console.log('✅ Admin seeded successfully!')
    console.log('📧 Email: admin1@email.com')
    console.log('🔑 Password: Admin@69')
    console.log(' Admin ID:', admin.id)
    
    return admin
    
  } catch (error) {
    console.error('❌ Error seeding admin:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding
seedAdmin()
  .then(() => {
    console.log(' Admin seeding completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Admin seeding failed:', error)
    process.exit(1)
  }) 