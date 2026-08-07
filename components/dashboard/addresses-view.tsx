"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Edit2, Trash2, CheckCircle2, Home, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

interface AddressesViewProps {
  initialAddresses: Address[];
}

export function AddressesView({ initialAddresses }: AddressesViewProps) {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    isDefault: false,
  });

  const resetForm = () => {
    setForm({
      fullName: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      zip: "",
      country: "US",
      isDefault: false,
    });
    setEditingAddress(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingAddress(addr);
    setForm({
      fullName: addr.fullName,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 || "",
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        // PATCH
        const res = await fetch(`/api/addresses/${editingAddress.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (res.ok) {
          setIsDialogOpen(false);
          resetForm();
          refreshAddresses();
        }
      } else {
        // POST
        const res = await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (res.ok) {
          setIsDialogOpen(false);
          resetForm();
          refreshAddresses();
        }
      }
    } catch (err) {
      console.error("Error saving address:", err);
    }
  };

  const refreshAddresses = async () => {
    const res = await fetch("/api/addresses");
    const data = await res.json();
    if (res.ok && data.addresses) {
      setAddresses(data.addresses);
      router.refresh();
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      setLoadingId(addressId);
      const res = await fetch(`/api/addresses/${addressId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) {
        refreshAddresses();
      }
    } catch (err) {
      console.error("Error setting default address:", err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (addressId: string) => {
    try {
      setLoadingId(addressId);
      const res = await fetch(`/api/addresses/${addressId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== addressId));
        router.refresh();
      }
    } catch (err) {
      console.error("Error deleting address:", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">
            MY ADDRESSES <span className="text-[#CCFF00]">({addresses.length})</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">Manage your shipping and billing locations</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleOpenCreate}
              className="bg-[#CCFF00] text-black font-black uppercase text-xs tracking-wider hover:bg-[#b8e600] rounded-lg px-4"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add New Address
            </Button>
          </DialogTrigger>

          <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-black uppercase text-white">
                {editingAddress ? "EDIT ADDRESS" : "ADD NEW ADDRESS"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Full Name *</label>
                  <Input
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="mt-1 bg-neutral-950 border-neutral-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Phone Number *</label>
                  <Input
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="mt-1 bg-neutral-950 border-neutral-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Country *</label>
                  <Input
                    required
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="mt-1 bg-neutral-950 border-neutral-800 text-xs text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Street Address *</label>
                  <Input
                    required
                    value={form.line1}
                    onChange={(e) => setForm({ ...form, line1: e.target.value })}
                    className="mt-1 bg-neutral-950 border-neutral-800 text-xs text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Apt, Suite, Unit (Optional)</label>
                  <Input
                    value={form.line2}
                    onChange={(e) => setForm({ ...form, line2: e.target.value })}
                    className="mt-1 bg-neutral-950 border-neutral-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">City *</label>
                  <Input
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="mt-1 bg-neutral-950 border-neutral-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">State / Province *</label>
                  <Input
                    required
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="mt-1 bg-neutral-950 border-neutral-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Postal / Zip Code *</label>
                  <Input
                    required
                    value={form.zip}
                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                    className="mt-1 bg-neutral-950 border-neutral-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="accent-[#CCFF00]"
                />
                <label htmlFor="isDefault" className="text-xs text-neutral-300 font-medium cursor-pointer">
                  Set as default shipping address
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#CCFF00] text-black font-black uppercase text-xs tracking-wider hover:bg-[#b8e600] rounded-lg mt-4 h-11"
              >
                {editingAddress ? "Save Changes" : "Create Address"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Address Cards Grid */}
      {addresses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`rounded-xl border p-5 transition-all space-y-4 ${
                addr.isDefault
                  ? "border-[#CCFF00] bg-neutral-900/90 shadow-lg shadow-[#CCFF00]/5"
                  : "border-neutral-800/80 bg-neutral-900/60 hover:border-neutral-700"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#CCFF00]" />
                  <span className="font-bold text-sm text-white">{addr.fullName}</span>
                </div>
                {addr.isDefault && (
                  <Badge className="bg-[#CCFF00] text-black font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded">
                    DEFAULT ADDRESS
                  </Badge>
                )}
              </div>

              {/* Address Lines */}
              <div className="text-xs text-neutral-300 space-y-1">
                <p>{addr.line1} {addr.line2}</p>
                <p>{addr.city}, {addr.state} {addr.zip}, {addr.country}</p>
                <p className="text-neutral-400">Phone: {addr.phone}</p>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between border-t border-neutral-800/80 pt-4 text-xs">
                {!addr.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    disabled={loadingId === addr.id}
                    className="text-[#CCFF00] hover:underline font-bold"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1 font-bold text-[11px]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Default Shipping Location
                  </span>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpenEdit(addr)}
                    className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(addr.id)}
                    disabled={loadingId === addr.id}
                    className="text-neutral-400 hover:text-rose-400 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-neutral-800 p-12 text-center text-xs text-neutral-500">
          No saved addresses found. Click &quot;Add New Address&quot; to save your primary shipping location.
        </div>
      )}
    </div>
  );
}
