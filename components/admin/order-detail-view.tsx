"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, User, MapPin, CreditCard, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderDetailProps {
  order: {
    id: string;
    status: string;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    createdAt: string;
    customer: { id: string; name: string | null; email: string } | null;
    shippingAddress: {
      fullName: string;
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    } | null;
    items: Array<{
      id: string;
      quantity: number;
      priceAtPurchase: number;
      variant: {
        sku: string;
        color: string;
        size: string;
        product: {
          name: string;
          images: Array<{ url: string }>;
        };
      };
    }>;
    payments: Array<{
      id: string;
      provider: string;
      status: string;
      amount: number;
    }>;
  };
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["PROCESSING", "SHIPPED", "CANCELLED", "REFUNDED"],
  PROCESSING: ["SHIPPED", "CANCELLED", "REFUNDED"],
  SHIPPED: ["DELIVERED", "CANCELLED", "REFUNDED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

export function OrderDetailView({ order: initialOrder }: OrderDetailProps) {
  const [order, setOrder] = useState(initialOrder);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const allowedNextStates = ALLOWED_TRANSITIONS[order.status] || [];

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) return;

    try {
      setIsUpdating(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to update order status.");
        setIsUpdating(false);
        return;
      }

      setOrder({ ...order, status: data.order.status });
      setSuccessMsg(`Order status successfully updated to ${data.order.status}. Customer notified.`);
      setSelectedStatus("");
    } catch (err) {
      console.error("Error updating order status:", err);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <span>ORDER #{order.id.slice(-8).toUpperCase()}</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                  order.status === "PAID" || order.status === "DELIVERED"
                    ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                    : order.status === "SHIPPED" || order.status === "PROCESSING"
                    ? "bg-blue-950/80 text-blue-400 border border-blue-800"
                    : "bg-amber-950/80 text-amber-400 border border-amber-800"
                }`}
              >
                {order.status}
              </span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">Placed on {formattedDate}</p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-rose-900/60 bg-rose-950/40 p-4 text-xs text-rose-300 font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/40 p-4 text-xs text-emerald-400 font-medium flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Section: Items & Totals (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
              <ShoppingBag className="h-4 w-4 text-rose-500" />
              <h2 className="text-sm font-black uppercase tracking-tight text-white">ORDER LINE ITEMS ({order.items.length})</h2>
            </div>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-950 border border-neutral-800/80">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 relative rounded bg-neutral-900 overflow-hidden border border-neutral-800 shrink-0">
                      {item.variant.product.images[0]?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.variant.product.images[0].url} alt={item.variant.product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-neutral-600">
                          <ShoppingBag className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{item.variant.product.name}</p>
                      <p className="text-[10px] text-neutral-400">
                        SKU: {item.variant.sku} | Color: {item.variant.color} | Size: {item.variant.size}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-white">${(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
                    <p className="text-[10px] text-neutral-500">{item.quantity} x ${item.priceAtPurchase.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="pt-4 border-t border-neutral-800 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Shipping</span>
                <span>${order.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-white pt-2 border-t border-neutral-800">
                <span>Total Amount</span>
                <span className="text-rose-400">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Status Transition Control */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
              <RefreshCw className="h-4 w-4 text-rose-500" />
              <h2 className="text-sm font-black uppercase tracking-tight text-white">UPDATE FULFILLMENT STATUS</h2>
            </div>

            <p className="text-xs text-neutral-400">
              Current state: <strong className="text-white font-bold">{order.status}</strong>.
              {allowedNextStates.length === 0
                ? " This order has reached a terminal status (no further state transitions allowed)."
                : " Select an allowed next state to trigger fulfillment updates and notify customer."}
            </p>

            {allowedNextStates.length > 0 && (
              <form onSubmit={handleUpdateStatus} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 text-xs text-white rounded-lg p-2.5 flex-1 focus:outline-none focus:border-rose-500"
                >
                  <option value="">— Select Allowed Next State —</option>
                  {allowedNextStates.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>

                <Button
                  type="submit"
                  disabled={!selectedStatus || isUpdating}
                  className="bg-rose-600 text-white font-black uppercase text-xs hover:bg-rose-500 rounded-lg h-10 px-6 shrink-0"
                >
                  {isUpdating ? "Updating..." : "Update Status"}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar Info (1 Col) */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-3">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 text-neutral-400">
              <User className="h-4 w-4 text-rose-500" />
              <h2 className="text-xs font-black uppercase text-white">CUSTOMER INFORMATION</h2>
            </div>
            <p className="text-xs font-bold text-white">{order.customer?.name || "Guest Customer"}</p>
            <p className="text-xs text-neutral-400">{order.customer?.email}</p>
          </div>

          {/* Shipping Address Card */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-3">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 text-neutral-400">
              <MapPin className="h-4 w-4 text-rose-500" />
              <h2 className="text-xs font-black uppercase text-white">SHIPPING ADDRESS</h2>
            </div>
            {order.shippingAddress ? (
              <div className="text-xs text-neutral-300 space-y-1">
                <p className="font-bold text-white">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p className="text-neutral-400 font-medium">{order.shippingAddress.country}</p>
              </div>
            ) : (
              <p className="text-xs text-neutral-500 italic">No shipping address recorded.</p>
            )}
          </div>

          {/* Payment Details Card */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-3">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 text-neutral-400">
              <CreditCard className="h-4 w-4 text-rose-500" />
              <h2 className="text-xs font-black uppercase text-white">PAYMENT INFORMATION</h2>
            </div>
            {order.payments.length > 0 ? (
              order.payments.map((p) => (
                <div key={p.id} className="text-xs text-neutral-300 space-y-1">
                  <p className="font-bold text-white">Provider: {p.provider}</p>
                  <p>Status: <span className="font-bold text-emerald-400">{p.status}</span></p>
                  <p>Amount: ${Number(p.amount).toFixed(2)}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-500 italic">No payment record attached.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
