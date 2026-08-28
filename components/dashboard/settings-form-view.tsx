"use client";

import { useState, useEffect } from "react";
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  Play,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SOUND_OPTIONS,
  NotificationSoundType,
  previewNotificationSound,
  setSoundEnabled as setLocalSoundEnabled,
  setSavedNotificationSound,
} from "@/lib/audio-notification";

interface SettingsFormViewProps {
  initialSoundSettings?: {
    soundEnabled: boolean;
    notificationSound: string;
  };
}

export function SettingsFormView({ initialSoundSettings }: SettingsFormViewProps) {
  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Sound Preferences State
  const [soundEnabled, setSoundEnabledState] = useState(
    initialSoundSettings?.soundEnabled ?? true
  );
  const [selectedSound, setSelectedSound] = useState<NotificationSoundType>(
    (initialSoundSettings?.notificationSound as NotificationSoundType) || "chime"
  );
  const [isSavingSound, setIsSavingSound] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [soundSuccess, setSoundSuccess] = useState<string | null>(null);

  // Sync initial sound settings if provided
  useEffect(() => {
    if (initialSoundSettings) {
      setSoundEnabledState(initialSoundSettings.soundEnabled);
      if (SOUND_OPTIONS.some((o) => o.id === initialSoundSettings.notificationSound)) {
        setSelectedSound(initialSoundSettings.notificationSound as NotificationSoundType);
      }
    }
  }, [initialSoundSettings]);

  const handleTestSound = async (soundId?: NotificationSoundType) => {
    const soundToPlay = soundId || selectedSound;
    setIsPlayingPreview(true);
    await previewNotificationSound(soundToPlay);
    setTimeout(() => setIsPlayingPreview(false), 500);
  };

  const handleSaveSoundPreferences = async () => {
    try {
      setIsSavingSound(true);
      setSoundSuccess(null);

      const res = await fetch("/api/user/notification-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soundEnabled,
          notificationSound: selectedSound,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to update notification sound settings.");
        return;
      }

      // Update local storage and broadcast to active tabs
      setLocalSoundEnabled(soundEnabled);
      setSavedNotificationSound(selectedSound);

      setSoundSuccess("Notification sound preferences saved successfully!");
      toast.success("Notification sound preferences saved!");
    } catch (err: any) {
      console.error("Error saving sound preferences:", err);
      toast.error("Failed to save audio settings.");
    } finally {
      setIsSavingSound(false);
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
          Manage your account notifications, sound preferences, and password credentials
        </p>
      </div>

      {/* Notification & Audio Preferences Card */}
      <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-[#B8FF00]" />
            <div>
              <h2 className="text-base font-black uppercase text-[#0F1B2D] dark:text-white">
                NOTIFICATION SOUND PREFERENCES
              </h2>
              <p className="text-xs text-[#0F1B2D]/50 dark:text-slate-400 mt-0.5">
                Customize in-app audio alerts when new orders and promotions arrive
              </p>
            </div>
          </div>

          {/* Persistent On/Off Switch */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabledState(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B8FF00]"></div>
          </label>
        </div>

        {soundSuccess && (
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{soundSuccess}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#0F1B2D] dark:text-white">
                Sound Alerts Status
              </span>
              <p className="text-[11px] text-[#0F1B2D]/50 dark:text-slate-400">
                {soundEnabled
                  ? "Notification sounds are active across all your sessions."
                  : "Notification sounds are currently disabled."}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F1B2D] dark:text-white">
              {soundEnabled ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Volume2 className="h-4 w-4" /> Enabled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-rose-500">
                  <VolumeX className="h-4 w-4" /> Disabled
                </span>
              )}
            </div>
          </div>

          {/* Sound Options List */}
          <div className="space-y-2 pt-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 dark:text-slate-400 block mb-2">
              Select Notification Tone
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SOUND_OPTIONS.map((option) => {
                const isSelected = selectedSound === option.id;

                return (
                  <div
                    key={option.id}
                    onClick={() => {
                      setSelectedSound(option.id);
                      handleTestSound(option.id);
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#B8FF00] bg-[#B8FF00]/10 dark:bg-[#B8FF00]/15 ring-1 ring-[#B8FF00]"
                        : "border-gray-200 dark:border-slate-800 bg-[#F4F8FC] dark:bg-slate-900/60 hover:border-gray-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold ${
                          isSelected
                            ? "border-[#B8FF00] bg-[#B8FF00] text-[#0F1B2D]"
                            : "border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-transparent"
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0F1B2D] dark:text-white">
                          {option.name}
                        </div>
                        <div className="text-[10px] text-[#0F1B2D]/50 dark:text-slate-400">
                          {option.description}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestSound(option.id);
                      }}
                      className="p-1.5 rounded-lg text-[#0F1B2D]/60 dark:text-slate-400 hover:text-[#0F1B2D] dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-colors"
                      title="Preview this sound"
                      aria-label={`Preview ${option.name}`}
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleTestSound()}
              disabled={isPlayingPreview}
              className="border-gray-200 dark:border-slate-800 text-xs font-bold text-[#0F1B2D] dark:text-white h-9"
            >
              <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
              {isPlayingPreview ? "Playing..." : "Test Selected Sound"}
            </Button>

            <Button
              type="button"
              onClick={handleSaveSoundPreferences}
              disabled={isSavingSound}
              className="bg-[#B8FF00] text-[#0F1B2D] font-black uppercase text-xs tracking-wider hover:bg-[#a3e600] rounded-lg px-6 h-9"
            >
              {isSavingSound ? "Saving..." : "Save Sound Preferences"}
            </Button>
          </div>
        </div>
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
