"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, MapPin, ShoppingBag, Star, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomerDetailProps {
  customer: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    isBanned: boolean;
    totalSpent: number;
    createdAt: string;
    addresses: Array<{
      id: string;
      fullName: string;
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      isDefault: boolean;
    }>;
    orders: Array<{
      id: string;
      status: string;
      total: number;
      createdAt: string;
      itemsCount: number;
    }>;
    reviews: Array<{
      id: string;
      rating: number;
      comment: string | null;
      createdAt: string;
      product: { id: string; name: string; slug: string };
    }>;
  };
}

export function CustomerDetailView({ customer: initialCustomer }: CustomerDetailProps) {
  const [customer, setCustomer] = useState(initialCustomer);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleBan = async () => {
    const actionText = customer.isBanned ? "un-suspend" : "suspend";
    if (!confirm(`Are you sure you want to ${actionText} customer "${customer.name || customer.email}"?`)) return;

    try {
      setIsUpdating(true);
      const res = await fetch(`/api/admin/customers/${customer.id}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: !customer.isBanned }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update suspension state.");
        setIsUpdating(false);
        return;
      }

      setCustomer({ ...customer, isBanned: data.user.isBanned });
    } catch (err) {
      console.error("Error toggling customer ban:", err);
      alert("Failed to update suspension state.");
    } finally {
      setIsUpdating(false);
    }
  };

  const joinedDate = new Date(customer.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/customers"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <span>{customer.name || "Customer User"}</span>
              {customer.isBanned ? (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider bg-rose-950/80 text-rose-400 border border-rose-800">
                  SUSPENDED
                </span>
              ) : (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                  ACTIVE
                </span>
              )}
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">{customer.email} • Joined {joinedDate}</p>
          </div>
        </div>

        <Button
          onClick={handleToggleBan}
          disabled={isUpdating}
          className={`font-black uppercase text-xs rounded-lg h-10 px-5 ${
            customer.isBanned
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-rose-600 hover:bg-rose-500 text-white"
          }`}
        >
          {customer.isBanned ? "Unsuspend Account" : "Suspend Account"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order History */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-rose-500" />
                <h2 className="text-sm font-black uppercase tracking-tight text-white">ORDER HISTORY ({customer.orders.length})</h2>
              </div>
              <span className="text-xs font-black text-emerald-400">Total Spent: ${customer.totalSpent.toFixed(2)}</span>
            </div>

            {customer.orders.length === 0 ? (
              <p className="text-xs text-neutral-500 italic py-4">No order history recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-neutral-800 bg-neutral-950/60 text-[10px] font-black uppercase text-neutral-400">
                    <tr>
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Total</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                    {customer.orders.map((o) => (
                      <tr key={o.id}>
                        <td className="py-2.5 px-3 font-mono font-bold text-white">#{o.id.slice(-8).toUpperCase()}</td>
                        <td className="py-2.5 px-3 font-bold text-white">${o.total.toFixed(2)}</td>
                        <td className="py-2.5 px-3 font-bold uppercase text-rose-400">{o.status}</td>
                        <td className="py-2.5 px-3 text-neutral-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td className="py-2.5 px-3 text-right">
                          <Link href={`/admin/orders/${o.id}`} className="text-xs font-bold text-rose-400 hover:underline">
                            View Order
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Customer Reviews */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Star className="h-4 w-4 text-rose-500" />
              <h2 className="text-sm font-black uppercase tracking-tight text-white">PRODUCT REVIEWS ({customer.reviews.length})</h2>
            </div>

            {customer.reviews.length === 0 ? (
              <p className="text-xs text-neutral-500 italic py-4">No reviews written yet.</p>
            ) : (
              <div className="space-y-3">
                {customer.reviews.map((r) => (
                  <div key={r.id} className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white">{r.product.name}</p>
                      <span className="text-xs font-black text-amber-400">{r.rating} / 5 ★</span>
                    </div>
                    {r.comment && <p className="text-xs text-neutral-400">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info (1 Col) */}
        <div className="space-y-6">
          {/* Saved Addresses */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
              <MapPin className="h-4 w-4 text-rose-500" />
              <h2 className="text-xs font-black uppercase text-white">SAVED ADDRESSES ({customer.addresses.length})</h2>
            </div>

            {customer.addresses.length === 0 ? (
              <p className="text-xs text-neutral-500 italic">No saved addresses on file.</p>
            ) : (
              <div className="space-y-3">
                {customer.addresses.map((addr) => (
                  <div key={addr.id} className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 text-xs text-neutral-300 space-y-1">
                    <p className="font-bold text-white flex items-center justify-between">
                      <span>{addr.fullName}</span>
                      {addr.isDefault && (
                        <span className="text-[9px] font-black uppercase text-rose-400 border border-rose-900 px-1.5 py-0.5 rounded">Default</span>
                      )}
                    </p>
                    <p>{addr.street}</p>
                    <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                    <p className="text-neutral-400 font-medium">{addr.country}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
