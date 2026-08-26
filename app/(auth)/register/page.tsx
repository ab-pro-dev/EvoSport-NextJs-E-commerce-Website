"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { User, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

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
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-black selection:bg-[#B8FF00] selection:text-black">
      {/* 1. Full-bleed background photo flatlay with vignette */}
      <Image
        src="/images/Login_background.png"
        alt="EvoSport Product Background"
        fill
        className="object-cover object-center pointer-events-none select-none"
        priority
      />
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[3px] pointer-events-none" />

      {/* 2. Centered Glassmorphic Card */}
      <div className="w-full max-w-[440px] bg-[#121418]/85 backdrop-blur-2xl rounded-[32px] p-7 sm:p-9 shadow-2xl border border-white/10 relative z-20 space-y-5 text-white my-6">
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
            Create Your <span className="text-[#B8FF00]">Account</span>
          </h1>
          <p className="text-xs text-neutral-400">
            Join EvoSport to unlock pro gear and order tracking
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
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <Input
                required
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1A1D21] border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-3 h-11 placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-[#B8FF00]/40 focus-visible:border-[#B8FF00] transition-all"
              />
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400 pointer-events-none" />
            </div>
          </div>

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
                className="w-full bg-[#1A1D21] border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-3 h-11 placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-[#B8FF00]/40 focus-visible:border-[#B8FF00] transition-all"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400 pointer-events-none" />
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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1A1D21] border border-white/10 text-white text-sm rounded-xl pl-10 pr-10 py-3 h-11 placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-[#B8FF00]/40 focus-visible:border-[#B8FF00] transition-all"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                required
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#1A1D21] border border-white/10 text-white text-sm rounded-xl pl-10 pr-10 py-3 h-11 placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-[#B8FF00]/40 focus-visible:border-[#B8FF00] transition-all"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-white transition-colors"
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
              className="h-4 w-4 rounded border-white/20 bg-[#1A1D21] text-[#B8FF00] focus:ring-[#B8FF00] accent-[#B8FF00] cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-neutral-300 cursor-pointer select-none font-medium">
              I agree to the{" "}
              <Link href="/terms" className="text-[#B8FF00] hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#B8FF00] hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Lime Green Gradient CREATE ACCOUNT Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-[#B8FF00] hover:bg-[#a6e600] text-black font-extrabold text-sm uppercase tracking-wider py-3.5 px-6 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-[#B8FF00]/20 hover:shadow-[#B8FF00]/30 transition-all h-12 cursor-pointer disabled:opacity-60"
          >
            <span>{isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-2 text-center text-xs text-neutral-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#B8FF00] hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
