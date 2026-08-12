"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Trash2, Minus, Plus, ArrowRight, ShieldCheck, Tag, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CartItem {
  id: string;
  userId: string | null;
  sessionId: string | null;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
  variant: {
    id: string;
    sku: string;
    color: string;
    size: string;
    price: number;
    stock: number;
    product: {
      id: string;
      name: string;
      slug: string;
      brand: string;
      category: string;
      image: string | null;
      altText: string | null;
    };
  };
}

interface CartData {
  items: CartItem[];
  subtotal: number;
}

interface CartViewProps {
  initialCart: CartData;
  isAuthenticated?: boolean;
}

export function CartView({ initialCart, isAuthenticated = false }: CartViewProps) {
  const router = useRouter();
  const [cart, setCart] = useState<CartData>(initialCart);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [stockError, setStockError] = useState<string | null>(null);

  const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const updateQuantity = async (cartItemId: string, newQty: number) => {
    try {
      setLoadingId(cartItemId);
      setStockError(null);

      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId, quantity: newQty }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStockError(data.error || "Failed to update item quantity");
        return;
      }

      setCart(data);
      window.dispatchEvent(new Event("cart-updated"));
      router.refresh();
    } catch (err) {
      console.error("Error updating cart quantity:", err);
      setStockError("Network error. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  const removeItem = async (cartItemId: string) => {
    try {
      setLoadingId(cartItemId);
      setStockError(null);

      const res = await fetch(`/api/cart?cartItemId=${cartItemId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setStockError(data.error || "Failed to remove item");
        return;
      }

      setCart(data);
      window.dispatchEvent(new Event("cart-updated"));
      router.refresh();
    } catch (err) {
      console.error("Error removing cart item:", err);
      setStockError("Network error. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponMessage({
      type: "error",
      text: `Coupon "${couponCode}" is invalid or expired.`,
    });
  };

  if (cart.items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4 py-16">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-[#B8FF00] mb-6 shadow-sm">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-[#0F1B2D] dark:text-white">Your Cart is Empty</h2>
        <p className="mt-2 text-xs text-[#0F1B2D]/50 dark:text-slate-400 max-w-sm">
          Looks like you haven&apos;t added any performance gear to your cart yet.
        </p>
        <Link href="/shop" className="mt-6">
          <Button size="lg" className="bg-[#B8FF00] text-[#0F1B2D] font-black uppercase text-xs tracking-wider hover:bg-[#a3e600] rounded-xl px-8 shadow-sm">
            Start Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  const checkoutHref = isAuthenticated ? "/checkout" : "/login?callbackUrl=/checkout";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-5">
        <h1 className="text-3xl font-black uppercase tracking-tight text-[#0F1B2D] dark:text-white">
          YOUR CART <span className="text-[#B8FF00]">({totalQuantity})</span>
        </h1>
        <Link href="/shop" className="text-xs text-[#5B8DEF] hover:text-[#4a7bd1] dark:hover:text-[#B8FF00] font-medium transition-colors">
          Continue Shopping &rarr;
        </Link>
      </div>

      {stockError && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-600 dark:text-rose-300 font-medium">
          {stockError}
        </div>
      )}

      {/* Main Grid: Left Items List + Right Order Summary */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-sm divide-y divide-gray-100 dark:divide-slate-800 overflow-hidden">
            {cart.items.map((item) => {
              const image = item.variant.product.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600";
              const isItemLoading = loadingId === item.id;

              return (
                <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-[#F4F8FC]/50 dark:hover:bg-slate-800/40">
                  {/* Product Details Left */}
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 dark:border-slate-800 bg-[#F4F8FC] dark:bg-slate-900">
                      <Image
                        src={image}
                        alt={item.variant.product.altText || item.variant.product.name}
                        fill
                        className="object-cover object-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F1B2D]/40 dark:text-slate-400">
                        {item.variant.product.brand}
                      </span>
                      <Link href={`/products/${item.variant.product.slug}`} className="block hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-colors">
                        <h3 className="text-sm font-bold text-[#0F1B2D] dark:text-white line-clamp-1">{item.variant.product.name}</h3>
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-[#0F1B2D]/50 dark:text-slate-400">
                        <span>Color: <strong className="text-[#0F1B2D] dark:text-white">{item.variant.color}</strong></span>
                        <span>•</span>
                        <span>Size: <strong className="text-[#0F1B2D] dark:text-white">{item.variant.size}</strong></span>
                      </div>
                      <div className="text-xs font-black text-[#0F1B2D] dark:text-white sm:hidden pt-1">
                        ${item.unitPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Actions Right */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-slate-800">
                    <div className="flex items-center rounded-xl border border-gray-200 dark:border-slate-800 bg-[#F4F8FC] dark:bg-slate-900 px-1.5 py-0.5 shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={isItemLoading || item.quantity <= 1}
                        className="p-1.5 text-[#0F1B2D]/40 dark:text-slate-400 hover:text-[#0F1B2D] dark:hover:text-white disabled:opacity-30 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-black text-[#0F1B2D] dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={isItemLoading || item.quantity >= item.variant.stock}
                        className="p-1.5 text-[#0F1B2D]/40 dark:text-slate-400 hover:text-[#0F1B2D] dark:hover:text-white disabled:opacity-30 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="hidden sm:block text-right min-w-20">
                      <div className="text-sm font-black text-[#0F1B2D] dark:text-white">${item.itemTotal.toFixed(2)}</div>
                      <div className="text-[10px] text-[#0F1B2D]/40 dark:text-slate-400">${item.unitPrice.toFixed(2)} each</div>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={isItemLoading}
                      className="p-2 text-[#0F1B2D]/30 dark:text-slate-500 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coupon Input Box */}
          <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-4 sm:p-5 shadow-sm">
            <form onSubmit={handleApplyCoupon} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Tag className="absolute left-3.5 top-3 h-3.5 w-3.5 text-[#0F1B2D]/40 dark:text-slate-400" />
                <Input
                  placeholder="Enter Promo or Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="pl-9 bg-[#F4F8FC] dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-xs text-[#0F1B2D] dark:text-white uppercase placeholder:normal-case placeholder:text-[#0F1B2D]/40 dark:placeholder:text-slate-500 focus-visible:ring-[#B8FF00]"
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                className="border-gray-200 dark:border-slate-800 text-[#0F1B2D] dark:text-white font-bold text-xs uppercase hover:border-[#B8FF00] dark:hover:border-[#B8FF00] hover:bg-[#F4F8FC] dark:hover:bg-slate-800 px-6 rounded-xl"
              >
                Apply
              </Button>
            </form>
            {couponMessage && (
              <p className={`mt-2 text-xs font-medium ${couponMessage.type === "error" ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                {couponMessage.text}
              </p>
            )}
          </div>
        </div>

        {/* Order Summary Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-black uppercase tracking-tight text-[#0F1B2D] dark:text-white border-b border-gray-100 dark:border-slate-800 pb-4">
              ORDER SUMMARY
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-[#0F1B2D]/60 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-bold text-[#0F1B2D] dark:text-white">${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#0F1B2D]/60 dark:text-slate-400">
                <span>Estimated Shipping</span>
                <span className="text-[#0F1B2D]/50 dark:text-slate-500 italic">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-[#0F1B2D]/60 dark:text-slate-400">
                <span>Estimated Tax</span>
                <span className="text-[#0F1B2D] dark:text-white font-bold">$0.00</span>
              </div>

              <div className="border-t border-gray-100 dark:border-slate-800 pt-4 flex justify-between items-baseline">
                <span className="text-sm font-black uppercase text-[#0F1B2D] dark:text-white">Estimated Total</span>
                <span className="text-xl font-black text-[#0F1B2D] dark:text-white">${cart.subtotal.toFixed(2)}</span>
              </div>
            </div>

            <Link href={checkoutHref} className="block pt-2">
              <Button
                size="lg"
                className="w-full bg-[#B8FF00] font-black text-[#0F1B2D] hover:bg-[#a3e600] h-12 text-xs uppercase tracking-wider rounded-xl shadow-sm"
              >
                PROCEED TO CHECKOUT
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            {!isAuthenticated && (
              <p className="text-[11px] text-center text-[#0F1B2D]/50 dark:text-slate-400 flex items-center justify-center gap-1">
                <Lock className="h-3 w-3" />
                <span>You will be prompted to sign in at checkout</span>
              </p>
            )}

            <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-[#0F1B2D]/50 dark:text-slate-400 font-medium border-t border-gray-100 dark:border-slate-800">
              <ShieldCheck className="h-4 w-4 text-[#B8FF00]" />
              <span>100% Secure Checkout Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
