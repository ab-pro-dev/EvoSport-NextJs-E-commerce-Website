"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

function GoogleIcon() {
  return (
    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // 1. Pre-verify credentials against API route for exact specific error message
      const verifyRes = await fetch("/api/auth/verify-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        setErrorMessage(verifyData.error || "Invalid email or password.");
        setIsLoading(false);
        return;
      }

      // 2. Credentials valid -> sign in via NextAuth
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMessage("Invalid email or password.");
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("Login error:", err);
      const msg = err?.message || "An unexpected error occurred. Please try again.";
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-black selection:bg-[#B8FF00] selection:text-black">
      {/* 1. Full-bleed background photo flatlay with light vignette */}
      <Image
        src="/images/Login_background.png"
        alt="EvoSport Product Background"
        fill
        quality={100}
        sizes="100vw"
        className="object-cover object-center pointer-events-none select-none"
        priority
      />
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />

      {/* 2. Centered Glassmorphic Card */}
      <div className="w-full max-w-[440px] bg-[#121418]/85 backdrop-blur-2xl rounded-[32px] p-7 sm:p-9 shadow-2xl border border-white/10 relative z-20 space-y-6 text-white overflow-hidden">
        {/* 3. Real Transparent Dark Logo */}
        <div className="flex justify-center pt-1">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <Image
              src="/images/evosport_logo_dark.png"
              alt="EvoSport Logo"
              width={200}
              height={36}
              priority
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </Link>
        </div>

        {/* 4. Heading & Subtext */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome <span className="text-[#B8FF00]">Back!</span>
          </h1>
          <p className="text-xs text-neutral-400">
            Sign in to your account and continue shopping
          </p>
        </div>

        {/* Inline Error Message Banner */}
        {errorMessage && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-950/60 p-3 text-xs text-rose-200 font-medium flex items-center gap-2.5 shadow-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 5. Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Input
                required
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1A1D21] border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-3 h-12 placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-[#B8FF00]/40 focus-visible:border-[#B8FF00] transition-all"
              />
              <Mail className="absolute left-3.5 top-4 h-4 w-4 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Input
                required
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1A1D21] border border-white/10 text-white text-sm rounded-xl pl-10 pr-10 py-3 h-12 placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-[#B8FF00]/40 focus-visible:border-[#B8FF00] transition-all"
              />
              <Lock className="absolute left-3.5 top-4 h-4 w-4 text-neutral-400 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-4 text-neutral-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* 6. Forgot Password Link */}
            <div className="flex justify-end mt-2">
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-[#B8FF00] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          {/* 7. Lime Green Gradient SIGN IN Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-[#B8FF00] hover:bg-[#a6e600] text-black font-extrabold text-sm uppercase tracking-wider py-3.5 px-6 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-[#B8FF00]/20 hover:shadow-[#B8FF00]/30 transition-all h-12 cursor-pointer disabled:opacity-60"
          >
            <span>{isLoading ? "SIGNING IN..." : "SIGN IN"}</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </button>
        </form>

        {/* 8. OR CONTINUE WITH Divider & Google Button */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-full border-t border-white/10" />
          <span className="absolute bg-[#121418] px-3 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
            OR CONTINUE WITH
          </span>
        </div>

        {/* Disabled Google Button */}
        <div className="flex justify-center">
          <button
            type="button"
            disabled
            title="Google Sign-In coming soon"
            className="w-full bg-[#1A1D21] border border-white/10 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-neutral-400 opacity-50 cursor-not-allowed select-none"
          >
            <GoogleIcon />
          </button>
        </div>

        {/* 9. Create Account Footer Link */}
        <div className="pt-2 text-center text-xs text-neutral-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-[#B8FF00] hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
