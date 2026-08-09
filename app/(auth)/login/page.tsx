"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // 1. Verify credentials against API route for exact specific error message
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
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block text-3xl font-black italic tracking-tighter text-white">
            EVO<span className="text-[#CCFF00]">SPORT</span>
          </Link>
          <p className="text-xs text-neutral-400 font-medium">
            Sign in to access your athlete dashboard and performance gear.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-8 backdrop-blur-md shadow-2xl space-y-6">
          <div className="border-b border-neutral-800 pb-4">
            <h1 className="text-xl font-black uppercase tracking-tight text-white">WELCOME BACK</h1>
            <p className="text-xs text-neutral-400 mt-1">Enter your credentials to continue</p>
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-rose-900/60 bg-rose-950/40 p-3.5 text-xs text-rose-300 font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Email Address</label>
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
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Password</label>
                <Link href="/forgot-password" className="text-[11px] font-bold text-[#CCFF00] hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <Input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-neutral-950 border-neutral-800 text-xs text-white pl-9 placeholder:text-neutral-600 focus-visible:ring-[#CCFF00]"
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-[#CCFF00]"
              />
              <label htmlFor="remember" className="text-xs text-neutral-400 cursor-pointer select-none font-medium">
                Remember me on this device
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#CCFF00] text-black font-black uppercase text-xs tracking-wider hover:bg-[#b8e600] rounded-lg h-12 mt-2"
            >
              {isLoading ? "Signing In..." : "SIGN IN"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="pt-4 border-t border-neutral-800 text-center text-xs text-neutral-400">
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="font-bold text-[#CCFF00] hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
