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

function EvoSportLogo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2 group">
      <div className="relative w-8 h-8 flex items-center justify-center">
        <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
          <path
            d="M8 5h16a1 1 0 0 1 .9 1.45l-4.5 9A1 1 0 0 1 19.5 16H5a1 1 0 0 1-.9-1.45l4-9A1 1 0 0 1 9 5z"
            fill="url(#e-grad-1)"
          />
          <path
            d="M5 16h15a1 1 0 0 1 .9 1.45l-4.5 9A1 1 0 0 1 15.5 27H1a1 1 0 0 1-.9-1.45l4-9A1 1 0 0 1 5 16z"
            fill="url(#e-grad-2)"
            opacity="0.9"
          />
          <defs>
            <linearGradient id="e-grad-1" x1="5" y1="5" x2="24" y2="16" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F46E5" />
              <stop offset="1" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id="e-grad-2" x1="1" y1="16" x2="20" y2="27" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" />
              <stop offset="1" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span className="text-2xl font-black italic tracking-tighter text-slate-900">
        EVO<span className="text-indigo-600">SPORT</span>
      </span>
    </Link>
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
        return; // Only display inline error banner — NO toast popup for login form errors!
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
    <div className="min-h-screen bg-gradient-to-br from-[#eef2ff] via-[#f8fafc] to-[#e0e7ff] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Decorative Dot Matrix - Top Left */}
      <div className="absolute top-10 left-10 grid grid-cols-4 gap-2 opacity-30 pointer-events-none">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
        ))}
      </div>

      {/* Decorative Diagonal Vector Lines */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-t from-indigo-200/40 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main Container - Split View */}
      <div className="w-full max-w-5xl bg-white/40 backdrop-blur-xl rounded-3xl p-3 sm:p-4 shadow-2xl border border-white/60 flex flex-col md:flex-row items-center gap-6 relative z-10">
        
        {/* Left Side: Runner Photo Background */}
        <div className="hidden md:block w-1/2 relative h-[620px] rounded-2xl overflow-hidden shadow-lg group">
          <Image
            src="/images/login_runner_bg.jpg"
            alt="EvoSport Athlete Runner"
            fill
            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent flex flex-col justify-end p-8 text-white">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-300 mb-1">
              ENGINEERED FOR SPEED
            </span>
            <h2 className="text-2xl font-black tracking-tight leading-snug text-white">
              Unleash Your Ultimate Athletic Potential.
            </h2>
          </div>
        </div>

        {/* Right Side: White Login Form Card */}
        <div className="w-full md:w-1/2 bg-white rounded-2xl p-6 sm:p-10 shadow-xl border border-slate-100 space-y-6">
          {/* Logo */}
          <div className="text-center">
            <EvoSportLogo />
          </div>

          {/* Heading & Subtitle */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Back</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
              Sign in to access your athlete dashboard and performance gear.
            </p>
          </div>

          {/* Inline Error Message */}
          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 font-medium flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Input
                  required
                  type="email"
                  placeholder="abera.dev.one@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-3 h-11 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all"
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-10 py-3 h-11 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-xs text-slate-600 cursor-pointer select-none font-medium"
              >
                Remember me on this device
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-semibold text-sm py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all h-11 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? "Signing In..." : "Sign In"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="w-full border-t border-slate-200" />
            <span className="absolute bg-white px-3 text-xs text-slate-400 font-medium">
              or continue with
            </span>
          </div>

          {/* Disabled Google Button (Apple Button Removed) */}
          <div>
            <button
              type="button"
              disabled
              title="Google Sign-In is coming soon"
              className="w-full bg-white border border-slate-200 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 shadow-sm opacity-60 cursor-not-allowed select-none"
            >
              <GoogleIcon />
              <span>Google</span>
            </button>
          </div>

          {/* Footer Link */}
          <div className="pt-2 text-center text-xs text-slate-500 font-medium">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

