import { verifyOTP } from "@/lib/otp";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body  = await request.json();
    // 🔧 Normalize inputs
    const email = String(body.email || "").trim().toLowerCase();
    const otp   = String(body.otp   || "").replace(/\s/g, "");

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const verificationResult = await verifyOTP(email, otp);

    if (!verificationResult.success) {
      return NextResponse.json(
        {
          error: verificationResult.message,
          attemptsLeft: verificationResult.attemptsLeft,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: verificationResult.message,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
