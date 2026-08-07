"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Trash2, Minus, Plus, ArrowRight, ShieldCheck, Tag } from "lucide-react";
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
}

export function CartView({ initialCart }: CartViewProps) {
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
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-[#CCFF00] mb-6">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-white">Your Cart is Empty</h2>
        <p className="mt-2 text-xs text-neutral-400 max-w-sm">
          Looks like you haven&apos;t added any performance gear to your cart yet.
        </p>
        <Link href="/shop" className="mt-6">
          <Button size="lg" className="bg-[#CCFF00] text-black font-black uppercase text-xs tracking-wider hover:bg-[#b8e600] rounded-lg px-8">
            Start Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-5">
        <h1 className="text-3xl font-black uppercase tracking-tight text-white">
          YOUR CART <span className="text-[#CCFF00]">({totalQuantity})</span>
        </h1>
        <Link href="/shop" className="text-xs text-neutral-400 hover:text-[#CCFF00] font-medium transition-colors">
          Continue Shopping &rarr;
        </Link>
      </div>

      {stockError && (
        <div className="rounded-lg border border-rose-900/60 bg-rose-950/40 p-3.5 text-xs text-rose-300 font-medium">
          {stockError}
        </div>
      )}

      {/* Main Grid: Left Items List + Right Order Summary */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-4 sm:p-6 backdrop-blur-md space-y-6">
            {cart.items.map((item) => {
              const image = item.variant.product.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600";
              const isLoading = loadingId === item.id;

              return (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/60 last:border-0 last:pb-0 transition-opacity ${
                    isLoading ? "opacity-40 pointer-events-none" : "opacity-100"
                  }`}
                >
                  {/* Thumbnail & Product Meta */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
                      <Image
                        src={image}
                        alt={item.variant.product.altText || item.variant.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                        {item.variant.product.brand}
                      </span>
                      <Link
                        href={`/products/${item.variant.product.slug}`}
                        className="block font-bold text-sm text-white hover:text-[#CCFF00] transition-colors line-clamp-1"
                      >
                        {item.variant.product.name}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                        {item.variant.color && (
                          <span>Color: <strong className="text-neutral-200">{item.variant.color}</strong></span>
                        )}
                        {item.variant.color && item.variant.size && <span>•</span>}
                        {item.variant.size && (
                          <span>Size: <strong className="text-neutral-200">{item.variant.size}</strong></span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-neutral-400 sm:hidden">
                        ${item.unitPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper & Price / Delete Actions */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-2 sm:pt-0">
                    {/* Stepper */}
                    <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-950 px-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 text-neutral-400 hover:text-[#CCFF00] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-black text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 text-neutral-400 hover:text-[#CCFF00] transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right min-w-[80px]">
                      <div className="text-sm font-black text-[#CCFF00]">
                        ${item.itemTotal.toFixed(2)}
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-[10px] text-neutral-500">
                          ${item.unitPrice.toFixed(2)} each
                        </div>
                      )}
                    </div>

                    {/* Trash / Remove Icon */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-neutral-500 hover:text-rose-500 transition-colors p-1.5 rounded-lg hover:bg-rose-950/20"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coupon Input Box */}
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-4 sm:p-5 backdrop-blur-md">
            <form onSubmit={handleApplyCoupon} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Tag className="absolute left-3.5 top-3 h-3.5 w-3.5 text-neutral-500" />
                <Input
                  placeholder="Enter Promo or Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="pl-9 bg-neutral-950 border-neutral-800 text-xs text-neutral-200 uppercase placeholder:normal-case placeholder:text-neutral-600 focus-visible:ring-[#CCFF00]"
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                className="border-neutral-700 text-white font-bold text-xs uppercase hover:border-[#CCFF00] hover:text-[#CCFF00] px-6"
              >
                Apply
              </Button>
            </form>
            {couponMessage && (
              <p className={`mt-2 text-xs font-medium ${couponMessage.type === "error" ? "text-rose-400" : "text-emerald-400"}`}>
                {couponMessage.text}
              </p>
            )}
          </div>
        </div>

        {/* Order Summary Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-6 backdrop-blur-md space-y-5">
            <h2 className="text-lg font-black uppercase tracking-tight text-white border-b border-neutral-800 pb-4">
              ORDER SUMMARY
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-neutral-300">
                <span>Subtotal</span>
                <span className="font-bold text-white">${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Estimated Shipping</span>
                <span className="text-neutral-500 italic">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Estimated Tax</span>
                <span className="text-neutral-300 font-bold">$0.00</span>
              </div>

              <div className="border-t border-neutral-800 pt-4 flex justify-between items-baseline">
                <span className="text-sm font-black uppercase text-white">Estimated Total</span>
                <span className="text-xl font-black text-[#CCFF00]">${cart.subtotal.toFixed(2)}</span>
              </div>
            </div>

            <Link href="/checkout" className="block pt-2">
              <Button
                size="lg"
                className="w-full bg-[#CCFF00] font-black text-black hover:bg-[#b8e600] h-12 text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-[#CCFF00]/10"
              >
                PROCEED TO CHECKOUT
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-neutral-400 font-medium border-t border-neutral-800/80">
              <ShieldCheck className="h-4 w-4 text-[#CCFF00]" />
              <span>100% Secure Checkout Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
