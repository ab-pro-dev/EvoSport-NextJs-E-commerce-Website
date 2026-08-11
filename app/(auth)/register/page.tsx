"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { User, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        return;
      }

      if (!acceptTerms) {
        setErrorMessage("You must accept the Terms and Conditions to register.");
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      // 1. Call real register API endpoint
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        setErrorMessage(registerData.error || "Registration failed.");
        setIsLoading(false);
        return;
      }

      toast.success("Account created successfully! Welcome to EvoSport.");

      // 2. Auto sign in on success
      const signInRes = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        router.push("/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("Registration error:", err);
      const msg = err?.message || "An unexpected error occurred. Please try again.";
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef2ff] via-[#f8fafc] to-[#e0e7ff] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Abstract Vector Wave Pattern - Right Side */}
      <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full opacity-30 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 500 500" className="w-full h-full text-indigo-400">
          <path
            d="M 100 0 C 200 150, 400 100, 500 300 L 500 0 Z"
            fill="currentColor"
            opacity="0.15"
          />
          <path
            d="M 0 300 C 150 450, 350 350, 500 500 L 500 500 L 0 500 Z"
            fill="currentColor"
            opacity="0.1"
          />
        </svg>
      </div>

      {/* Decorative Dot Matrix - Bottom Right */}
      <div className="absolute bottom-10 right-10 grid grid-cols-4 gap-2 opacity-30 pointer-events-none">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
        ))}
      </div>

      {/* White Register Form Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-100 space-y-6 relative z-10">
        {/* Logo */}
        <div className="text-center">
          <EvoSportLogo />
        </div>

        {/* Heading & Subtitle */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Create Your <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Account</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
            Join EvoSport to unlock pro gear, saved wishlists, and order tracking.
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
              Full Name
            </label>
            <div className="relative">
              <Input
                required
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-3 h-11 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all"
              />
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

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
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Password
            </label>
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

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                required
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-10 py-3 h-11 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="terms"
              required
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-slate-600 cursor-pointer select-none font-medium">
              I agree to the{" "}
              <Link href="/terms" className="text-indigo-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-indigo-600 hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-semibold text-sm py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all h-11 cursor-pointer disabled:opacity-70"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-2 text-center text-xs text-slate-500 font-medium">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

