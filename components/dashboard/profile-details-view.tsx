"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  User,
  Save,
  CheckCircle2,
  AlertCircle,
  Camera,
  Upload,
  Trash2,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProfileDetailsViewProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
}

export function ProfileDetailsView({ user }: ProfileDetailsViewProps) {
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [image, setImage] = useState(user.image || "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getInitials = (val?: string | null) => {
    if (!val) return "US";
    return val
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDeviceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPEG, PNG, WEBP, GIF).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB.");
      return;
    }

    try {
      setIsUploadingImage(true);
      setProfileError(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/profile/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image.");
      }

      setImage(data.url || data.secure_url);
      toast.success("Profile photo uploaded to Cloudinary successfully!");
    } catch (err: any) {
      console.error("Error uploading profile photo:", err);
      toast.error(err?.message || "Failed to upload image from device.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setImage("");
    toast.info("Avatar removed. Click 'Save Profile' to apply changes.");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      setProfileSuccess(null);
      setProfileError(null);

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, image: image.trim() || null }),
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

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-black uppercase tracking-tight text-[#0F1B2D] dark:text-white">
          MY PROFILE
        </h1>
        <p className="text-xs text-[#0F1B2D]/50 dark:text-slate-400 mt-0.5">
          Manage your personal profile information, photo, and contact details
        </p>
      </div>

      {/* Profile Information Card */}
      <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-4">
          <User className="h-5 w-5 text-[#B8FF00]" />
          <h2 className="text-base font-black uppercase text-[#0F1B2D] dark:text-white">
            PROFILE DETAILS
          </h2>
        </div>

        {profileSuccess && (
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{profileSuccess}</span>
          </div>
        )}

        {profileError && (
          <div className="rounded-lg border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{profileError}</span>
          </div>
        )}

        {/* Avatar Upload Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-xl bg-[#F4F8FC] dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
          <div className="relative h-20 w-20 flex-shrink-0 rounded-full overflow-hidden bg-[#B8FF00] border-2 border-white dark:border-slate-700 shadow-md flex items-center justify-center font-black text-xl text-[#0F1B2D]">
            {image ? (
              <img
                src={image}
                alt={name || "User Avatar"}
                className="h-full w-full object-cover"
              />
            ) : (
              getInitials(name)
            )}

            {isUploadingImage && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                <Loader2 className="h-6 w-6 animate-spin text-[#B8FF00]" />
              </div>
            )}
          </div>

          <div className="space-y-2 flex-1">
            <div className="text-xs font-bold text-[#0F1B2D] dark:text-white">
              Profile Photo
            </div>
            <p className="text-[11px] text-[#0F1B2D]/50 dark:text-slate-400">
              Upload a photo from your device (PNG, JPG, WEBP, max 5MB).
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleDeviceFileUpload}
                className="hidden"
                id="profile-avatar-file-input"
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-xs font-bold text-[#0F1B2D] dark:text-white hover:bg-gray-50 h-8"
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-1.5 h-3.5 w-3.5 text-[#5B8DEF]" />
                    Upload from Device
                  </>
                )}
              </Button>

              {image && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={isUploadingImage}
                  className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 h-8"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 dark:text-slate-400">
                Full Name *
              </label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 bg-[#F4F8FC] dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-xs text-[#0F1B2D] dark:text-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 dark:text-slate-400">
                Email Address *
              </label>
              <Input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 bg-[#F4F8FC] dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-xs text-[#0F1B2D] dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 dark:text-slate-400 flex items-center gap-1">
                <LinkIcon className="h-3 w-3 text-[#0F1B2D]/40 dark:text-slate-500" />
                Avatar Image URL (Alternative)
              </label>
              <Input
                placeholder="https://images.unsplash.com/... or upload from device above"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="mt-1 bg-[#F4F8FC] dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-xs text-[#0F1B2D] dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={isSavingProfile || isUploadingImage}
              className="bg-[#B8FF00] text-[#0F1B2D] font-black uppercase text-xs tracking-wider hover:bg-[#a3e600] rounded-lg px-6 h-10 shadow-sm"
            >
              <Save className="mr-1.5 h-3.5 w-3.5" />
              {isSavingProfile ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
