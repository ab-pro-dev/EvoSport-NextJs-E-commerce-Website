"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { User, Mail, Lock, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (password !== confirmPassword) {
        const msg = "Passwords do not match.";
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      if (!acceptTerms) {
        const msg = "You must accept the Terms and Conditions to register.";
        setErrorMessage(msg);
        toast.error(msg);
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
        const msg = registerData.error || "Registration failed.";
        setErrorMessage(msg);
        toast.error(msg);
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
      toast.error(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block text-3xl font-black italic tracking-tighter text-white">
            EVO<span className="text-[#CCFF00]">SPORT</span>
          </Link>
          <p className="text-xs text-neutral-400 font-medium">
            Join EvoSport to unlock pro gear, saved wishlists, and order tracking.
          </p>
        </div>

        {/* Register Form Card */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-8 backdrop-blur-md shadow-2xl space-y-6">
          <div className="border-b border-neutral-800 pb-4">
            <h1 className="text-xl font-black uppercase tracking-tight text-white">CREATE AN ACCOUNT</h1>
            <p className="text-xs text-neutral-400 mt-1">Start your athletic journey with EvoSport</p>
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-rose-900/60 bg-rose-950/40 p-3.5 text-xs text-rose-300 font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Full Name *</label>
              <div className="relative mt-1.5">
                <Input
                  required
                  placeholder="Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-neutral-950 border-neutral-800 text-xs text-white pl-9 placeholder:text-neutral-600 focus-visible:ring-[#CCFF00]"
                />
                <User className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
              </div>
            </div>

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

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Password *</label>
              <div className="relative mt-1.5">
                <Input
                  required
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-neutral-950 border-neutral-800 text-xs text-white pl-9 placeholder:text-neutral-600 focus-visible:ring-[#CCFF00]"
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Confirm Password *</label>
              <div className="relative mt-1.5">
                <Input
                  required
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-neutral-950 border-neutral-800 text-xs text-white pl-9 placeholder:text-neutral-600 focus-visible:ring-[#CCFF00]"
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                required
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="accent-[#CCFF00]"
              />
              <label htmlFor="terms" className="text-xs text-neutral-400 cursor-pointer select-none font-medium">
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#CCFF00] text-black font-black uppercase text-xs tracking-wider hover:bg-[#b8e600] rounded-lg h-12 mt-2"
            >
              {isLoading ? "Creating Account..." : "REGISTER ACCOUNT"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="pt-4 border-t border-neutral-800 text-center text-xs text-neutral-400">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[#CCFF00] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
