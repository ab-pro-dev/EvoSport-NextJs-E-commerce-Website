"use client";

import { useState } from "react";
import { User, Lock, Save, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProfileFormViewProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
}

export function ProfileFormView({ user }: ProfileFormViewProps) {
  // Profile Form State
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [image, setImage] = useState(user.image || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      setProfileSuccess(null);
      setProfileError(null);

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, image: image || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || "Failed to update profile.";
        setProfileError(msg);
        toast.error(msg);
        setIsSavingProfile(false);
        return;
      }

      const msg = "Profile updated successfully!";
      setProfileSuccess(msg);
      toast.success(msg);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      const msg = err?.message || "Network error. Please try again.";
      setProfileError(msg);
      toast.error(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (newPassword !== confirmPassword) {
        const msg = "New passwords do not match.";
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
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-black uppercase tracking-tight text-[#0F1B2D]">
          ACCOUNT SETTINGS
        </h1>
        <p className="text-xs text-[#0F1B2D]/50 mt-0.5">Manage your personal profile and security</p>
      </div>

      {/* 1. Profile Information Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
          <User className="h-5 w-5 text-[#B8FF00]" />
          <h2 className="text-base font-black uppercase text-[#0F1B2D]">PROFILE DETAILS</h2>
        </div>

        {profileSuccess && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-600 font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{profileSuccess}</span>
          </div>
        )}

        {profileError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-600 font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#0F1B2D]/60">Full Name</label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 bg-[#F4F8FC] border-gray-200 text-xs text-[#0F1B2D]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#0F1B2D]/60">Email Address</label>
              <Input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 bg-[#F4F8FC] border-gray-200 text-xs text-[#0F1B2D]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#0F1B2D]/60">Avatar Image URL (Optional)</label>
              <Input
                placeholder="https://images.unsplash.com/..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="mt-1 bg-[#F4F8FC] border-gray-200 text-xs text-[#0F1B2D]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={isSavingProfile}
              className="bg-[#B8FF00] text-[#0F1B2D] font-black uppercase text-xs tracking-wider hover:bg-[#a3e600] rounded-lg px-6 h-10"
            >
              <Save className="mr-1.5 h-3.5 w-3.5" />
              {isSavingProfile ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </div>

      {/* 2. Security / Change Password Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
          <Lock className="h-5 w-5 text-[#B8FF00]" />
          <h2 className="text-base font-black uppercase text-[#0F1B2D]">CHANGE PASSWORD</h2>
        </div>

        {passwordSuccess && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-600 font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-600 font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#0F1B2D]/60">Current Password *</label>
              <Input
                required
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 bg-[#F4F8FC] border-gray-200 text-xs text-[#0F1B2D]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#0F1B2D]/60">New Password *</label>
              <Input
                required
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 bg-[#F4F8FC] border-gray-200 text-xs text-[#0F1B2D]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#0F1B2D]/60">Confirm New Password *</label>
              <Input
                required
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 bg-[#F4F8FC] border-gray-200 text-xs text-[#0F1B2D]"
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
