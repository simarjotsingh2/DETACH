import { prisma } from "@/lib/db";
import { sendOTPEmail } from "@/lib/email";
import { canResendOTP, generateOTP, storeOTP } from "@/lib/otp";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = String(body.email ?? "").trim().toLowerCase();
    const name  = String(body.name  ?? "").trim();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    // 1) Check user existence (Prisma)
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 400 }
        );
      }
    } catch (err: any) {
      console.error("[send-otp] prisma.user.findUnique failed:", err?.message || err);
      return NextResponse.json({ error: "Database error (user lookup)" }, { status: 500 });
    }

    // 2) Resend cooldown
    try {
      const resendCheck = await canResendOTP(email);
      if (!resendCheck.canResend) {
        return NextResponse.json(
          {
            error: `Please wait ${resendCheck.waitTime} seconds before requesting a new OTP`,
            waitTime: resendCheck.waitTime,
          },
          { status: 429 }
        );
      }
    } catch (err: any) {
      console.error("[send-otp] canResendOTP failed:", err?.message || err);
      return NextResponse.json({ error: "Database error (cooldown)" }, { status: 500 });
    }

    // 3) Generate + store OTP (Prisma)
    const otp = generateOTP();
    try {
      await storeOTP(email, otp, 5); // 5 minutes
    } catch (err: any) {
      console.error("[send-otp] storeOTP failed:", err?.message || err);
      return NextResponse.json({ error: "Database error (store OTP)" }, { status: 500 });
    }

    // 4) Send email (SMTP)
    try {
      const emailResult = await sendOTPEmail(email, otp, name);
      if (!emailResult.success) {
        console.error("[send-otp] sendOTPEmail returned error:", emailResult.message);
        return NextResponse.json({ error: emailResult.message }, { status: 500 });
      }
    } catch (err: any) {
      console.error("[send-otp] sendOTPEmail threw:", err?.message || err);
      return NextResponse.json({ error: "Email service error" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully to your email address",
    });
  } catch (error: any) {
    console.error("[send-otp] unhandled error:", error?.message || error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
