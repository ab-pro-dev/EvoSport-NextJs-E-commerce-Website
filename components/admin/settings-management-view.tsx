"use client";

import { useState } from "react";
import { Settings, Save, Store, Truck, Percent, Wrench, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SettingsMap {
  storeName: string;
  contactEmail: string;
  supportPhone: string;
  freeShippingThreshold: number;
  flatRateShipping: number;
  taxRate: number;
  maintenanceMode: boolean;
}

interface SettingsManagementViewProps {
  initialSettings: SettingsMap;
}

export function SettingsManagementView({ initialSettings }: SettingsManagementViewProps) {
  const [settings, setSettings] = useState<SettingsMap>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleInputChange = (field: keyof SettingsMap, value: any) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: settings.storeName,
          contactEmail: settings.contactEmail,
          supportPhone: settings.supportPhone,
          freeShippingThreshold: settings.freeShippingThreshold,
          flatRateShipping: settings.flatRateShipping,
          taxRate: settings.taxRate,
          maintenanceMode: settings.maintenanceMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to update settings.");
        setIsSaving(false);
        return;
      }

      setSettings(data.settings);
      setSuccessMsg("Store settings updated successfully.");
    } catch (err) {
      console.error("Error updating settings:", err);
      setErrorMsg("Failed to save store settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-rose-500" />
            STORE & SYSTEM SETTINGS
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configure functional store parameters: tax rates, free shipping thresholds, contact information, and maintenance mode.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/40 p-4 text-xs text-emerald-300 font-medium flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl border border-rose-900/60 bg-rose-950/40 p-4 text-xs text-rose-300 font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: General Store Settings */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wide text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Store className="h-4 w-4 text-rose-500" />
            General Store Settings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Store Name</label>
              <Input
                value={settings.storeName}
                onChange={(e) => handleInputChange("storeName", e.target.value)}
                className="mt-1 bg-neutral-950 border-neutral-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Contact Email</label>
              <Input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                className="mt-1 bg-neutral-950 border-neutral-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Support Phone</label>
              <Input
                value={settings.supportPhone}
                onChange={(e) => handleInputChange("supportPhone", e.target.value)}
                className="mt-1 bg-neutral-950 border-neutral-800 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Shipping & Freight Rules */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wide text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Truck className="h-4 w-4 text-emerald-400" />
            Shipping & Freight Rules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Free Shipping Threshold ($)</label>
              <Input
                type="number"
                step="0.01"
                value={settings.freeShippingThreshold}
                onChange={(e) => handleInputChange("freeShippingThreshold", parseFloat(e.target.value))}
                className="mt-1 bg-neutral-950 border-neutral-800 text-xs text-white font-bold"
              />
              <p className="text-[10px] text-neutral-500 mt-1">Orders with subtotal at or above this amount receive free shipping at checkout.</p>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Flat Rate Shipping Fee ($)</label>
              <Input
                type="number"
                step="0.01"
                value={settings.flatRateShipping}
                onChange={(e) => handleInputChange("flatRateShipping", parseFloat(e.target.value))}
                className="mt-1 bg-neutral-950 border-neutral-800 text-xs text-white font-bold"
              />
              <p className="text-[10px] text-neutral-500 mt-1">Standard shipping fee applied when subtotal is under free shipping threshold.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Tax Calculation Settings */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wide text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Percent className="h-4 w-4 text-blue-400" />
            Sales Tax Calculation Rate
          </h2>

          <div className="max-w-xs space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Store Sales Tax Rate (as decimal, e.g. 0.10 for 10%)</label>
            <Input
              type="number"
              step="0.01"
              value={settings.taxRate}
              onChange={(e) => handleInputChange("taxRate", parseFloat(e.target.value))}
              className="mt-1 bg-neutral-950 border-neutral-800 text-xs text-white font-mono font-bold text-rose-400"
            />
            <p className="text-[10px] text-neutral-500">Currently set to {(settings.taxRate * 100).toFixed(0)}% sales tax on checkout orders.</p>
          </div>
        </div>

        {/* Section 4: System Maintenance Mode */}
        <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-rose-900/40 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wide text-rose-400 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-rose-500" />
              Maintenance Mode Control
            </h2>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleInputChange("maintenanceMode", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          <p className="text-xs text-neutral-300">
            When Maintenance Mode is enabled, all non-admin customer traffic visiting public shop pages will be redirected to the maintenance page (`/maintenance`). Admin users remain unaffected.
          </p>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-rose-600 text-white font-black uppercase text-xs tracking-wider hover:bg-rose-500 rounded-lg h-10 px-8"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving Settings..." : "Save All Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
