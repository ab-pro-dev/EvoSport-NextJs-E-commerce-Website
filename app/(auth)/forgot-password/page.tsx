"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowLeft, Send, Info, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubmitted(true);
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
      <div className="w-full max-w-[440px] bg-[#121418]/85 backdrop-blur-2xl rounded-[32px] p-7 sm:p-9 shadow-2xl border border-white/10 relative z-20 space-y-6 text-white">
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
            Reset <span className="text-[#B8FF00]">Password</span>
          </h1>
          <p className="text-xs text-neutral-400">
            Enter your email address to receive reset instructions
          </p>
        </div>

        {isSubmitted ? (
          <div className="rounded-2xl border border-white/10 bg-[#1A1D21] p-6 text-center space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#B8FF00]/10 text-[#B8FF00]">
              <Info className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Reset Link Sent</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              If email reset is enabled, instructions will be sent to <span className="text-[#B8FF00] font-bold">{email}</span>.
            </p>
            <div className="pt-2">
              <Link href="/login">
                <button
                  type="button"
                  className="w-full bg-[#B8FF00] hover:bg-[#a6e600] text-black font-extrabold text-xs uppercase tracking-wider py-3 px-4 rounded-full transition-all"
                >
                  Return to Sign In
                </button>
              </Link>
            </div>
          </div>
        ) : (
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

            {/* Lime Green Gradient Button */}
            <button
              type="submit"
              className="w-full mt-2 bg-[#B8FF00] hover:bg-[#a6e600] text-black font-extrabold text-sm uppercase tracking-wider py-3.5 px-6 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-[#B8FF00]/20 hover:shadow-[#B8FF00]/30 transition-all h-12 cursor-pointer"
            >
              <span>SEND RESET LINK</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="pt-2 text-center text-xs text-neutral-400">
          <Link href="/login" className="inline-flex items-center gap-1.5 font-bold text-[#B8FF00] hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
