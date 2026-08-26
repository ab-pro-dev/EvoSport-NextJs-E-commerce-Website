"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowLeft, Send, Info } from "lucide-react";
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
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <Image
              src="/images/evosport_logo_dark.png"
              alt="EvoSport Logo"
              width={180}
              height={32}
              priority
              className="h-8 w-auto object-contain mx-auto"
            />
          </Link>
          <p className="text-xs text-neutral-400 font-medium">
            Reset your password to regain access to your account.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-8 backdrop-blur-md shadow-2xl space-y-6">
          <div className="border-b border-neutral-800 pb-4">
            <h1 className="text-xl font-black uppercase tracking-tight text-white">RESET PASSWORD</h1>
            <p className="text-xs text-neutral-400 mt-1">Enter your account email to receive instructions</p>
          </div>

          {isSubmitted ? (
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 text-center space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#CCFF00]/10 text-[#CCFF00]">
                <Info className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold uppercase text-white">Password Reset Info</h3>
              {/* Static placeholder message per requirements - no fake emails */}
              <p className="text-xs text-neutral-400">
                If email reset is enabled later, a reset link will be sent to <span className="text-white font-bold">{email}</span>.
              </p>
              <div className="pt-2">
                <Link href="/login">
                  <Button variant="outline" className="border-neutral-700 text-xs text-white font-bold uppercase hover:border-[#CCFF00]">
                    Return to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Email Address *</label>
                <div className="relative mt-1.5">
                  <Input
                    required
                    type="email"
                    placeholder="alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-neutral-950 border-neutral-800 text-xs text-white pl-9 placeholder:text-neutral-600 focus-visible:ring-[#CCFF00]"
                  />
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#CCFF00] text-black font-black uppercase text-xs tracking-wider hover:bg-[#b8e600] rounded-lg h-12 mt-2"
              >
                <Send className="mr-2 h-4 w-4" />
                Send Reset Link
              </Button>
            </form>
          )}

          <div className="pt-4 border-t border-neutral-800 text-center text-xs">
            <Link href="/login" className="inline-flex items-center gap-1.5 font-bold text-neutral-400 hover:text-[#CCFF00] transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
