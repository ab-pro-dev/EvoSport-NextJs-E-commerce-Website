"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  Calendar,
  Mail,
  Upload,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AdminProfileViewProps {
  initialUser: {
    id: string;
    name: string | null;
    email: string;
    username: string | null;
    image: string | null;
    role: string;
    createdAt: string | Date;
  };
}

export function AdminProfileView({ initialUser }: AdminProfileViewProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Form State
  const [name, setName] = useState(initialUser.name || "");
  const [username, setUsername] = useState(initialUser.username || "");
  const [image, setImage] = useState<string | null>(initialUser.image || null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileErrors, setProfileErrors] = useState<{
    name?: string;
    username?: string;
  }>({});

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Format creation date
  const memberSince = initialUser.createdAt
    ? new Date(initialUser.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  // Avatar Upload Handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP, GIF).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image.");
      }

      setImage(data.secure_url || data.url);
      toast.success("Profile photo uploaded! Click 'Save Profile' to persist changes.");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = () => {
    setImage(null);
    toast.info("Profile photo removed. Click 'Save Profile' to apply.");
  };

  // Profile Save Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrors({});

    const trimmedName = name.trim();
    const trimmedUsername = username.trim().toLowerCase();

    const errors: { name?: string; username?: string } = {};

    if (!trimmedName || trimmedName.length < 1 || trimmedName.length > 60) {
      errors.name = "Name must be between 1 and 60 characters.";
    }

    if (trimmedUsername) {
      const usernameRegex = /^[a-z0-9._@-]{3,32}$/;
      if (!usernameRegex.test(trimmedUsername)) {
        errors.username =
          "Username must be 3-32 characters and may only contain lowercase letters, digits, and . _ @ -";
      }
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    try {
      setIsSavingProfile(true);
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          username: trimmedUsername || undefined,
          image: image,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error === "That username is already taken") {
          setProfileErrors({ username: "That username is already taken" });
        }
        throw new Error(data.error || "Failed to update profile.");
      }

      toast.success("Profile details updated successfully!");
      // Refresh the admin layout/header so new name and avatar appear immediately
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Could not save profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Password Change Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});

    const errors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!currentPassword) {
      errors.currentPassword = "Current password is required.";
    }
    if (!newPassword || newPassword.length < 10) {
      errors.newPassword = "New password must be at least 10 characters long.";
    }
    if (newPassword && currentPassword && newPassword === currentPassword) {
      errors.newPassword = "New password must be different from your current password.";
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await fetch("/api/admin/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error?.toLowerCase().includes("current password")) {
          setPasswordErrors({ currentPassword: data.error });
        } else if (data.error?.toLowerCase().includes("at least 10")) {
          setPasswordErrors({ newPassword: data.error });
        }
        throw new Error(data.error || "Failed to update password.");
      }

      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Could not update password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white flex items-center gap-2.5">
          <User className="h-6 w-6 text-rose-600 dark:text-rose-500" />
          Admin Profile
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Manage your administrator account details, profile picture, and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Summary Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm flex flex-col items-center text-center">
            {/* Avatar Display */}
            <div className="relative group mb-4">
              <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-rose-500/20 bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shadow-inner">
                {image ? (
                  <img
                    src={image}
                    alt={name || "Admin"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-rose-600 text-white text-3xl font-black">
                    {name?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                )}
              </div>

              {isUploading && (
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Photo Action Buttons */}
            <div className="flex items-center gap-2 mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isSavingProfile}
                className="text-xs font-semibold gap-1.5"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload
              </Button>
              {image && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemovePhoto}
                  disabled={isUploading || isSavingProfile}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </Button>
              )}
            </div>

            {/* Read-Only Account Metadata */}
            <div className="w-full pt-4 border-t border-gray-100 dark:border-neutral-800 space-y-3 text-left">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
                  <Mail className="h-3 w-3" /> Email Address
                </span>
                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate mt-0.5">
                  {initialUser.email}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
                  <Shield className="h-3 w-3 text-rose-500" /> Account Role
                </span>
                <div className="mt-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                    {initialUser.role}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" /> Member Since
                </span>
                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mt-0.5">
                  {memberSince}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Profile & Password Forms */}
        <div className="md:col-span-2 space-y-8">
          {/* Section 1: Account Details */}
          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-rose-600 dark:text-rose-500" />
              Account Information
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">
              Update your display name and unique administrator username.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Abera Hagazi"
                  maxLength={60}
                  className="bg-gray-50/50 dark:bg-neutral-800/50"
                  disabled={isSavingProfile}
                />
                {profileErrors.name && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1.5 font-medium">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {profileErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Username
                </label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin_evo"
                  maxLength={32}
                  className="bg-gray-50/50 dark:bg-neutral-800/50 lowercase"
                  disabled={isSavingProfile}
                />
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
                  3–32 characters (lowercase letters, digits, and . _ @ -). Must be unique.
                </p>
                {profileErrors.username && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1.5 font-medium">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {profileErrors.username}
                  </p>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSavingProfile || isUploading}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-2"
                >
                  {isSavingProfile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Profile
                </Button>
              </div>
            </form>
          </div>

          {/* Section 2: Change Password */}
          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-1">
              <KeyRound className="h-4 w-4 text-rose-600 dark:text-rose-500" />
              Change Password
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">
              Ensure your account is using a strong password of at least 10 characters.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="pr-10 bg-gray-50/50 dark:bg-neutral-800/50"
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1.5 font-medium">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 10 characters"
                    className="pr-10 bg-gray-50/50 dark:bg-neutral-800/50"
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1.5 font-medium">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {passwordErrors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="pr-10 bg-gray-50/50 dark:bg-neutral-800/50"
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1.5 font-medium">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {passwordErrors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white dark:text-neutral-900 text-white font-bold text-xs gap-2"
                >
                  {isChangingPassword ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
