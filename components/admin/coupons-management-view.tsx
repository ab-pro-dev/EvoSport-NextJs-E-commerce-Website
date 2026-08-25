"use client";

import { useState } from "react";
import { Ticket, Plus, Trash2, CheckCircle2, XCircle, AlertCircle, Percent, DollarSign, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface CouponItem {
  id: string;
  code: string;
  type: string;
  value: number;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: string | null;
  active: boolean;
  ordersCount: number;
}

interface CouponsManagementViewProps {
  initialCoupons: CouponItem[];
}

export function CouponsManagementView({ initialCoupons }: CouponsManagementViewProps) {
  const [coupons, setCoupons] = useState<CouponItem[]>(initialCoupons);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState("PERCENTAGE");
  const [value, setValue] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [active, setActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCodeChange = (val: string) => {
    setCode(val.toUpperCase());
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          type,
          value: parseFloat(value),
          usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
          expiresAt: expiresAt || null,
          active,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create coupon.");
        setIsSubmitting(false);
        return;
      }

      setCoupons([...coupons, { ...data.coupon, ordersCount: 0 }]);
      setIsAddModalOpen(false);
      setCode("");
      setValue("");
      setUsageLimit("");
      setExpiresAt("");
    } catch (err) {
      console.error("Error creating coupon:", err);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    isLoading?: boolean;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
    isLoading: false,
  });

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
  };

  const handleDeleteCouponPrompt = (id: string, couponCode: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Coupon?",
      description: `Are you sure you want to delete coupon "${couponCode}"? Customers will no longer be able to apply it.`,
      onConfirm: () => executeDeleteCoupon(id, couponCode),
      isLoading: false,
    });
  };

  const executeDeleteCoupon = async (id: string, couponCode: string) => {
    try {
      setDeletingId(id);
      setConfirmModal((prev) => ({ ...prev, isLoading: true }));
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || "Failed to delete coupon.");
        setDeletingId(null);
        closeConfirmModal();
        return;
      }

      toast.success(`Coupon "${couponCode}" deleted successfully!`);
      setCoupons(coupons.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error deleting coupon:", err);
      toast.error("Network error deleting coupon.");
    } finally {
      setDeletingId(null);
      closeConfirmModal();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <Ticket className="h-6 w-6 text-rose-600 dark:text-rose-500" />
            COUPONS & PROMOTIONS
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Manage promotional discount codes, usage limits, and checkout validation.
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-rose-600 text-white font-black uppercase text-xs tracking-wider hover:bg-rose-500 rounded-lg h-10 px-5 shadow-sm"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Coupon
        </Button>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Coupons Grid / Table */}
      <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950/80 text-[10px] font-black uppercase text-neutral-500 dark:text-neutral-400">
              <tr>
                <th className="py-3.5 px-4">Coupon Code</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Discount Value</th>
                <th className="py-3.5 px-4">Usage (Used / Limit)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/60 text-neutral-700 dark:text-neutral-300">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-neutral-400 dark:text-neutral-500 italic">
                    No promotional coupons created yet.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => {
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-neutral-900/90 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-black text-xs text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded">
                          {c.code}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white uppercase text-[11px] flex items-center gap-1.5 mt-1">
                        {c.type === "PERCENTAGE" && <Percent className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />}
                        {c.type === "FIXED" && <DollarSign className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                        {c.type === "FREE_SHIPPING" && <Truck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                        <span>{c.type}</span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                        {c.type === "PERCENTAGE" ? `${c.value}% OFF` : `$${c.value.toFixed(2)}`}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-neutral-900 dark:text-white">{c.usageCount}</span>
                        <span className="text-neutral-400 dark:text-neutral-500"> / {c.usageLimit !== null ? c.usageLimit : "∞"}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        {c.active ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-gray-200 dark:border-neutral-800">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteCouponPrompt(c.id, c.code)}
                          disabled={deletingId === c.id}
                          className="text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1"
                          title="Delete Coupon"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Coupon Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-6 shadow-2xl">
            <div className="border-b border-gray-100 dark:border-neutral-800 pb-3 flex items-center justify-between">
              <h3 className="text-base font-black uppercase text-neutral-900 dark:text-white">CREATE PROMOTIONAL COUPON</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Coupon Code *</label>
                <Input
                  required
                  placeholder="e.g. SUMMER20"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  className="mt-1 bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white font-mono uppercase"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Discount Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-1 w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white rounded-lg p-2.5"
                >
                  <option value="PERCENTAGE">PERCENTAGE (% Off Subtotal)</option>
                  <option value="FIXED">FIXED ($ Off Total)</option>
                  <option value="FREE_SHIPPING">FREE_SHIPPING (Free Freight)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Discount Value *</label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  placeholder="e.g. 20"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="mt-1 bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Max Usage Limit</label>
                  <Input
                    type="number"
                    placeholder="Unlimited"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="mt-1 bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Expiration Date</label>
                  <Input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="mt-1 bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="border-gray-300 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 font-bold hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-rose-600 text-white font-black uppercase text-xs hover:bg-rose-500 rounded-lg px-6 shadow-sm"
                >
                  {isSubmitting ? "Creating..." : "Create Coupon"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Reusable Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        isLoading={confirmModal.isLoading}
      />
    </div>
  );
}
