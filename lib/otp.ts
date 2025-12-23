import { prisma } from "@/lib/db";
import crypto from "crypto";

export interface OTPData {
  otp: string;
  expiresAt: number;
  attempts: number;
}

const RESEND_COOLDOWN_MS = 60_000; // 1 min
const ATTEMPT_LIMIT = 3;

/** 6-digit numeric OTP */
export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Save/replace OTP for an email with expiration time.
 * Works with UNIQUE(email) by using Prisma UPSERT.
 */
export async function storeOTP(
  email: string,
  otp: string,
  expirationMinutes = 5
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

  // Keeps exactly one row per email
  await prisma.oTPVerification.upsert({
    where: { email: normalizedEmail },   // email must be UNIQUE in your Prisma model
    update: {
      otp,
      attempts: 0,                       // reset attempts on new code
      expiresAt,
      updatedAt: new Date(),             // @updatedAt will set this too—explicit is fine
    },
    create: {
      id: crypto.randomUUID(),           // no pgcrypto needed
      email: normalizedEmail,
      otp,
      attempts: 0,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

/** 1-minute resend cooldown based on last update */
export async function canResendOTP(
  email: string
): Promise<{ canResend: boolean; waitTime?: number }> {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    // Use findUnique because email is UNIQUE in the Prisma model
    const rec = await prisma.oTPVerification.findUnique({
      where: { email: normalizedEmail },
      select: { createdAt: true, updatedAt: true },
    });

    // No row yet → can send
    if (!rec) return { canResend: true };

    // Use updatedAt if present, otherwise createdAt (older DBs)
    const lastMs = (rec.updatedAt ?? rec.createdAt).getTime();
    const remainingMs = lastMs + 60_000 - Date.now(); // 60s cooldown

    if (remainingMs <= 0) return { canResend: true };
    return { canResend: false, waitTime: Math.ceil(remainingMs / 1000) };
  } catch (err) {
    // If the read fails for any reason, log and allow sending rather than 500'ing
    console.error("[canResendOTP] DB read failed:", err);
    return { canResend: true };
  }
}

/**
 * Verify OTP for an email.
 * - fails if not found or expired
 * - increments attempts on wrong code
 * - marks verified by setting attempts = -1 (your convention)
 */
export async function verifyOTP(
  email: string,
  inputOTP: string
): Promise<{ success: boolean; message: string; attemptsLeft?: number }> {
  const normalizedEmail = email.trim().toLowerCase();
  const rec = await prisma.oTPVerification.findUnique({ where: { email: normalizedEmail } });

  if (!rec) {
    return { success: false, message: "No OTP found for this email. Please request a new one." };
  }

  if (Date.now() > rec.expiresAt.getTime()) {
    await prisma.oTPVerification.delete({ where: { email: normalizedEmail } });
    return { success: false, message: "OTP has expired. Please request a new one." };
  }

  if (rec.attempts >= ATTEMPT_LIMIT) {
    await prisma.oTPVerification.delete({ where: { email: normalizedEmail } });
    return { success: false, message: "Too many failed attempts. Please request a new OTP." };
  }

  if (rec.otp === inputOTP) {
    await prisma.oTPVerification.update({
      where: { email: normalizedEmail },
      data: { attempts: -1, updatedAt: new Date() }
    });
    return { success: true, message: "OTP verified successfully!" };
  }

  const nextAttempts = rec.attempts + 1;
  await prisma.oTPVerification.update({
    where: { email: normalizedEmail },
    data: { attempts: nextAttempts, updatedAt: new Date() }
  });

  return {
    success: false,
    message: "Invalid OTP. Please try again.",
    attemptsLeft: Math.max(0, ATTEMPT_LIMIT - nextAttempts)
  };
}

/** Used by signup: confirm it's verified and still valid */
export async function isOTPVerified(email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const rec = await prisma.oTPVerification.findUnique({
    where: { email: normalizedEmail },
    select: { attempts: true, expiresAt: true }
  });
  if (!rec) return false;
  return rec.attempts === -1 && Date.now() <= rec.expiresAt.getTime();
}

/** Delete OTP after successful registration */
export async function deleteOTP(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  await prisma.oTPVerification.delete({ where: { email: normalizedEmail } }).catch(() => {});
}

/** Optional: clean up expired rows periodically */
export async function cleanupExpiredOTPs(): Promise<void> {
  await prisma.oTPVerification.deleteMany({ where: { expiresAt: { lt: new Date() } } }).catch(() => {});
}

/** Dev helper */
export async function getOTPData(email: string): Promise<OTPData | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const rec = await prisma.oTPVerification.findUnique({
    where: { email: normalizedEmail },
    select: { otp: true, expiresAt: true, attempts: true }
  });
  return rec ? { otp: rec.otp, expiresAt: rec.expiresAt.getTime(), attempts: rec.attempts } : null;
}
