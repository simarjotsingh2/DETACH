"use client";

import AnoAI from "@/components/animated-shader-background";
import { setCurrentUserId } from "@/lib/cart";
import { motion } from "framer-motion";
import { Eye, EyeOff, Heart, Lock, Mail, ShoppingCart, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import "./page.css"; // Import the CSS file for styling


function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [alertMessage, setAlertMessage] = useState<{ type: "cart" | "wishlist" | null; show: boolean }>({ type: null, show: false });

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get("message");
    if (message === "cart" || message === "wishlist") {
      setAlertMessage({ type: message as "cart" | "wishlist", show: true });
      setTimeout(() => setAlertMessage((p) => ({ ...p, show: false })), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  useEffect(() => {
    setOtpSent(false);
    setOtpVerified(false);
    setOtp("");
    setResendTimer(0);
  }, [isLogin]);

  useEffect(() => {
    setOtpSent(false);
    setOtpVerified(false);
    setOtp("");
    setResendTimer(0);
  }, [email]);

  const handleSendOTP = async () => {
    const emailN = email.trim().toLowerCase();
    const nameN = name.trim();
    if (!emailN || !nameN) {
      toast.error("Please enter your name and email first");
      return;
    }
    setOtpLoading(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailN, name: nameN }),
      });
      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);
        setResendTimer(60);
        toast.success("OTP sent to your email address!");
      } else {
        if (response.status === 429 && typeof data.waitTime === "number") {
          setResendTimer(Math.max(0, data.waitTime));
        }
        toast.error(data.error || "Failed to send OTP");
      }
    } catch {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const emailN = email.trim().toLowerCase();
    const otpClean = otp.replace(/\s/g, "");
    if (!otpClean || otpClean.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    setOtpVerifying(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailN, otp: otpClean }),
      });
      const data = await response.json();
      if (response.ok) {
        setOtpVerified(true);
        toast.success("Email verified successfully!");
      } else {
        toast.error(data.error || "Invalid OTP");
      }
    } catch {
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) {
      toast.error(`Please wait ${resendTimer} seconds before resending`);
      return;
    }
    await handleSendOTP();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!isLogin && !name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!isLogin && !otpVerified) {
      toast.error("Please verify your email with OTP first");
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          ...(isLogin ? {} : { name: name.trim(), otp }),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) localStorage.setItem("token", data.token);
        if (data.user?.id) setCurrentUserId(data.user.id);

        toast.success(isLogin ? "Login successful!" : "Registration successful!");

        if (data.user?.role === "ADMIN") router.push("/admin/dashboard");
        else router.push("/user/dashboard");
      } else {
        toast.error(data.error || (isLogin ? "Login failed" : "Registration failed"));
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const dismissAlert = () => setAlertMessage((p) => ({ ...p, show: false }));

  return (
    <div className="fixed inset-0 overflow-hidden relative flex items-center justify-center px-4 text-white">
      {/* Background shader */}
      <div className="pointer-events-none absolute inset-0 -z-20 bg-black ">
        <AnoAI />
      </div>

      {/* Keep a light dark overlay so text stays readable over bright streaks.
        If you want *zero* darkening, delete the next two lines. */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-black/55" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1100px_600px_at_50%_25%,transparent_0%,rgba(0,0,0,0.25)_70%,rgba(0,0,0,0.5)_100%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[420px]"
      >
        {/* Alert */}
        {alertMessage.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-3.5 rounded-xl border border-white/15 bg-transparent shadow-xl text-sm"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {alertMessage.type === "cart" ? (
                  <ShoppingCart className="w-5 h-5 text-amber-400" />
                ) : (
                  <Heart className="w-5 h-5 text-amber-400" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <h3 className="font-semibold">
                  {alertMessage.type === "cart" ? "Login Required for Cart" : "Login Required for Wishlist"}
                </h3>
                <p className="mt-1 text-white/80">
                  {alertMessage.type === "cart"
                    ? "Please log in to add products to your cart and continue shopping."
                    : "Please log in to add products to your wishlist and save your favorites."}
                </p>
              </div>
              <button onClick={dismissAlert} className="ml-3 text-white/60 hover:text-white">✕</button>
            </div>
          </motion.div>
        )}

        {/* Heading */}
        <div className="text-center mb-3">
          <span className="text-3xl font-display font-bold bg-gradient-to-r from-neon-violet via-neon-pink to-neon-blue bg-clip-text text-transparent">
            DΣTΛCH
          </span>
          <p className="text-white/70 mt-1 text-sm">Welcome Back</p>
        </div>

        {/* ===== Transparent Card (no blur) ===== */}
        <div className="relative">
          <div
            className="relative rounded-[22px] p-6
                     bg-transparent
                     border border-white/15 ring-1 ring-white/10
                     shadow-[0_18px_50px_rgba(0,0,0,0.45)]
                     max-h-[78dvh] overflow-y-auto overflow-x-hidden no-scrollbar"
          >
            {/* avatar */}
            <div className="flex items-center justify-center mb-4">
              <div className="p-2.5 rounded-xl border border-white/20 bg-transparent">
                <User className="w-6 h-6 text-white/90" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-center mb-5 tracking-wide">
              {isLogin ? "LOGIN" : "REGISTER"}
            </h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-white/85 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-full
                               bg-transparent border border-white/25
                               text-white placeholder-white/50 text-sm
                               focus:border-neon-pink focus:outline-none transition"
                      placeholder="Enter your full name"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-white/85 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-full
                             bg-transparent border border-white/25
                             text-white placeholder-white/50 text-sm
                             focus:border-neon-pink focus:outline-none transition"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                {!isLogin && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={otpLoading || !email || !name || otpSent}
                      className={`flex-1 py-2 px-4 rounded-full text-xs font-semibold tracking-wide transition
                      ${otpSent ? "bg-green-600/90 text-white cursor-not-allowed"
                          : "bg-neon-pink/80 hover:bg-neon-pink text-white disabled:opacity-50 disabled:cursor-not-allowed"}`}
                    >
                      {otpLoading ? "Sending OTP..." : otpSent ? "✓ OTP Sent" : "Send OTP"}
                    </button>

                    {otpVerified && (
                      <div className="flex items-center justify-center w-9 h-9 bg-green-600/90 rounded-full">✓</div>
                    )}
                  </div>
                )}
              </div>

              {/* OTP */}
              {!isLogin && otpSent && (
                <div>
                  <label htmlFor="otp" className="block text-xs font-medium text-white/85 mb-2">
                    Verification Code
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                      <input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="w-full pl-11 pr-4 py-3 rounded-full
                                 bg-transparent border border-white/25
                                 text-white placeholder-white/50 text-center text-base tracking-widest
                                 focus:border-neon-pink focus:outline-none transition"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        required
                        disabled={otpVerified}
                      />
                    </div>

                    {otp.length === 6 && !otpVerified && (
                      <button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={otpVerifying}
                        className="px-4 py-3 rounded-full bg-neon-blue/80 hover:bg-neon-blue text-white text-xs font-semibold transition disabled:opacity-50"
                      >
                        {otpVerifying ? "Verifying..." : "Verify"}
                      </button>
                    )}

                    {otpVerified && (
                      <div className="flex items-center justify-center px-4 py-3 bg-green-600/90 rounded-full">✓</div>
                    )}
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-white/80">Didn&apos;t receive the code?</span>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendTimer > 0}
                      className="text-neon-pink hover:text-white transition disabled:text-white/40 disabled:cursor-not-allowed"
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                    </button>
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-white/85 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 rounded-full
                             bg-transparent border border-white/25
                             text-white placeholder-white/50 text-sm
                             focus:border-neon-pink focus:outline-none transition"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-full
                         bg-gradient-to-r from-neon-violet via-neon-pink to-neon-blue
                         text-white text-sm font-semibold tracking-wide
                         shadow-[0_10px_35px_rgba(0,0,0,0.45)]
                         hover:opacity-95 transition disabled:opacity-50"
              >
                {isLoading ? "Please wait..." : isLogin ? "LOGIN" : "REGISTER"}
              </button>
            </form>

            {/* Switch */}
            <div className="mt-5 text-center">
              <button
                onClick={() => setIsLogin((s) => !s)}
                className="text-neon-pink hover:text-white transition text-sm"
              >
                {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-white/70 text-[11px]">2024 Edgy Fashion. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  );


}

export default function UserLoginPage() {
  return (
    <Suspense fallback={<div className="h-dvh flex items-center justify-center bg-ink-950 text-white">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
