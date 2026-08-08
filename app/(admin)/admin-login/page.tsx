"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, getSession } from "next-auth/react";
import { Lock, Mail, ShieldAlert, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setErrorMessage(null);

      console.log("[ADMIN_LOGIN_LOG 1] Submitting admin login with email:", email.trim());

      // 1. NextAuth sign in
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      console.log("[ADMIN_LOGIN_LOG 2] signIn() returned result object:", res);

      if (res?.error) {
        console.log("[ADMIN_LOGIN_LOG 2.1] signIn error detected:", res.error);
        setErrorMessage("Invalid admin credentials.");
        setIsLoading(false);
        return;
      }

      // 2. Fetch session via getSession()
      console.log("[ADMIN_LOGIN_LOG 3] Fetching session via getSession()...");
      const session = await getSession();
      const userRole = (session?.user as { role?: string })?.role;

      console.log("[ADMIN_LOGIN_LOG 4] getSession() returned:", session, "Extracted userRole:", userRole);

      if (!session?.user || userRole !== "ADMIN") {
        console.log("[ADMIN_LOGIN_LOG 5] Access DENIED: session =", session, "userRole =", userRole);
        await signOut({ redirect: false });
        setErrorMessage("Access denied. Admin privileges required.");
        setIsLoading(false);
        return;
      }

      console.log("[ADMIN_LOGIN_LOG 6] Access GRANTED! Redirecting to /admin...");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error("[ADMIN_LOGIN_LOG ERROR] Unexpected exception:", err);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-900/60 bg-rose-950/40 px-3.5 py-1 text-xs font-bold text-rose-400">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>EVOSPORT ADMIN CONTROL PORTAL</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white mt-2">
            RESTRICTED ACCESS
          </h1>
          <p className="text-xs text-neutral-400">
            Authorized administrative credentials required to proceed.
          </p>
        </div>

        {/* Admin Login Card */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-8 backdrop-blur-md shadow-2xl space-y-6">
          {errorMessage && (
            <div className="rounded-lg border border-rose-900/60 bg-rose-950/40 p-3.5 text-xs text-rose-300 font-medium flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 flex-shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Admin Email</label>
              <div className="relative mt-1.5">
                <Input
                  required
                  type="email"
                  placeholder="admin@evosport.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-neutral-950 border-neutral-800 text-xs text-[#fff] pl-9 placeholder:text-neutral-600 focus-visible:ring-rose-500"
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Password</label>
              <div className="relative mt-1.5">
                <Input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-neutral-950 border-neutral-800 text-xs text-[#fff] pl-9 placeholder:text-neutral-600 focus-visible:ring-rose-500"
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-rose-600 text-white font-black uppercase text-xs tracking-wider hover:bg-rose-500 rounded-lg h-12 mt-2"
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              {isLoading ? "Verifying Admin Access..." : "AUTHENTICATE ADMIN"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
