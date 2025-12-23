import crypto from 'crypto'
import { prisma } from '@/lib/db'

export interface OTPData {
  otp: string
  expiresAt: number
  attempts: number
}

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString()
}

/**
 * Store OTP for an email with expiration time
 */
export async function storeOTP(email: string, otp: string, expirationMinutes: number = 5): Promise<void> {
  const expiresAt = new Date(Date.now() + (expirationMinutes * 60 * 1000))
  
  // Use raw SQL to avoid Prisma model issues
  await prisma.$executeRaw`
    INSERT INTO otp_verifications (id, email, otp, attempts, "expiresAt", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), ${email.toLowerCase()}, ${otp}, 0, ${expiresAt}, NOW(), NOW())
    ON CONFLICT (email) 
    DO UPDATE SET 
      otp = ${otp}, 
      attempts = 0, 
      "expiresAt" = ${expiresAt}, 
      "updatedAt" = NOW()
  `
}

/**
 * Verify OTP for an email
 */
export async function verifyOTP(email: string, inputOTP: string): Promise<{ 
  success: boolean; 
  message: string; 
  attemptsLeft?: number 
}> {
  const normalizedEmail = email.toLowerCase()
  
  try {
    // Get OTP data using raw SQL
    const result = await prisma.$queryRaw<Array<{
      id: string;
      email: string;
      otp: string;
      attempts: number;
      expiresAt: Date;
    }>>`
      SELECT id, email, otp, attempts, "expiresAt"
      FROM otp_verifications 
      WHERE email = ${normalizedEmail}
    `

    console.log('OTP Verification Debug:', {
      email: normalizedEmail,
      inputOTP,
      hasOtpData: result.length > 0,
      otpData: result.length > 0 ? { 
        storedOTP: result[0].otp, 
        expiresAt: result[0].expiresAt.toLocaleString(), 
        attempts: result[0].attempts,
        isExpired: Date.now() > result[0].expiresAt.getTime()
      } : null
    })

    if (result.length === 0) {
      return {
        success: false,
        message: 'No OTP found for this email. Please request a new one.'
      }
    }

    const otpData = result[0]

    // Check if OTP has expired
    if (Date.now() > otpData.expiresAt.getTime()) {
      await prisma.$executeRaw`DELETE FROM otp_verifications WHERE email = ${normalizedEmail}`
      return {
        success: false,
        message: 'OTP has expired. Please request a new one.'
      }
    }

    // Check attempts limit (max 3 attempts)
    if (otpData.attempts >= 3) {
      await prisma.$executeRaw`DELETE FROM otp_verifications WHERE email = ${normalizedEmail}`
      return {
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      }
    }

    // Verify OTP
    if (otpData.otp === inputOTP) {
      await prisma.$executeRaw`DELETE FROM otp_verifications WHERE email = ${normalizedEmail}`
      return {
        success: true,
        message: 'OTP verified successfully!'
      }
    }

    // Increment attempts
    await prisma.$executeRaw`
      UPDATE otp_verifications 
      SET attempts = attempts + 1, "updatedAt" = NOW()
      WHERE email = ${normalizedEmail}
    `

    return {
      success: false,
      message: 'Invalid OTP. Please try again.',
      attemptsLeft: 3 - (otpData.attempts + 1)
    }
  } catch (error) {
    console.error('OTP verification error:', error)
    return {
      success: false,
      message: 'An error occurred during verification. Please try again.'
    }
  }
}

/**
 * Check if OTP can be resent (1 minute cooldown)
 */
export async function canResendOTP(email: string): Promise<{ canResend: boolean; waitTime?: number }> {
  const normalizedEmail = email.toLowerCase()
  
  try {
    const result = await prisma.$queryRaw<Array<{
      createdAt: Date;
    }>>`
      SELECT "createdAt"
      FROM otp_verifications 
      WHERE email = ${normalizedEmail}
    `

    if (result.length === 0) {
      return { canResend: true }
    }

    // Check if 1 minute has passed since OTP was created
    const oneMinuteAgo = Date.now() - (1 * 60 * 1000)
    const otpCreatedAt = result[0].createdAt.getTime()

    if (otpCreatedAt < oneMinuteAgo) {
      return { canResend: true }
    }

    const waitTime = Math.ceil((oneMinuteAgo - otpCreatedAt) / 1000) * -1
    return { 
      canResend: false, 
      waitTime: waitTime 
    }
  } catch (error) {
    console.error('Can resend OTP error:', error)
    return { canResend: true }
  }
}

/**
 * Clean up expired OTPs (should be called periodically)
 */
export async function cleanupExpiredOTPs(): Promise<void> {
  try {
    await prisma.$executeRaw`
      DELETE FROM otp_verifications 
      WHERE "expiresAt" < NOW()
    `
  } catch (error) {
    console.error('Cleanup expired OTPs error:', error)
  }
}

/**
 * Get OTP data for an email (for testing purposes)
 */
export async function getOTPData(email: string): Promise<OTPData | null> {
  try {
    const result = await prisma.$queryRaw<Array<{
      otp: string;
      expiresAt: Date;
      attempts: number;
    }>>`
      SELECT otp, "expiresAt", attempts
      FROM otp_verifications 
      WHERE email = ${email.toLowerCase()}
    `
    
    if (result.length === 0) return null
    
    return {
      otp: result[0].otp,
      expiresAt: result[0].expiresAt.getTime(),
      attempts: result[0].attempts
    }
  } catch (error) {
    console.error('Get OTP data error:', error)
    return null
  }
}
