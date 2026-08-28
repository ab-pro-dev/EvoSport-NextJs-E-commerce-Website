"use client";

import { useState } from "react";
import { Lock, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SettingsFormView() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (newPassword !== confirmPassword) {
        const msg = "New passwords do not match.";
        setPasswordError(msg);
        toast.error(msg);
        return;
      }

      if (newPassword.length < 6) {
        const msg = "New password must be at least 6 characters long.";
        setPasswordError(msg);
        toast.error(msg);
        return;
      }

      setIsSavingPassword(true);
      setPasswordSuccess(null);
      setPasswordError(null);

      const res = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || "Failed to update password.";
        setPasswordError(msg);
        toast.error(msg);
        setIsSavingPassword(false);
        return;
      }

      const msg = "Password updated successfully!";
      setPasswordSuccess(msg);
      toast.success(msg);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Error updating password:", err);
      const msg = err?.message || "Network error. Please try again.";
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-black uppercase tracking-tight text-[#0F1B2D] dark:text-white">
          ACCOUNT SETTINGS
        </h1>
        <p className="text-xs text-[#0F1B2D]/50 dark:text-slate-400 mt-0.5">
          Manage your account security and password credentials
        </p>
      </div>

      {/* Security / Change Password Card */}
      <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-4">
          <Lock className="h-5 w-5 text-[#B8FF00]" />
          <h2 className="text-base font-black uppercase text-[#0F1B2D] dark:text-white">
            CHANGE PASSWORD
          </h2>
        </div>

        {passwordSuccess && (
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="rounded-lg border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 dark:text-slate-400">
                Current Password *
              </label>
              <Input
                required
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 bg-[#F4F8FC] dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-xs text-[#0F1B2D] dark:text-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 dark:text-slate-400">
                New Password *
              </label>
              <Input
                required
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 bg-[#F4F8FC] dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-xs text-[#0F1B2D] dark:text-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 dark:text-slate-400">
                Confirm New Password *
              </label>
              <Input
                required
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 bg-[#F4F8FC] dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-xs text-[#0F1B2D] dark:text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={isSavingPassword}
              className="bg-[#B8FF00] text-[#0F1B2D] font-black uppercase text-xs tracking-wider hover:bg-[#a3e600] rounded-lg px-6 h-10"
            >
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
              {isSavingPassword ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
