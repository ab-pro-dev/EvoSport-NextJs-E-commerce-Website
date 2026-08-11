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
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white border border-gray-200 text-[#B8FF00] mb-6">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-[#0F1B2D]">Your Cart is Empty</h2>
        <p className="mt-2 text-xs text-[#0F1B2D]/50 max-w-sm">
          Looks like you haven&apos;t added any performance gear to your cart yet.
        </p>
        <Link href="/shop" className="mt-6">
          <Button size="lg" className="bg-[#B8FF00] text-[#0F1B2D] font-black uppercase text-xs tracking-wider hover:bg-[#a3e600] rounded-xl px-8">
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
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-black uppercase tracking-tight text-[#0F1B2D]">
          YOUR CART <span className="text-[#B8FF00]">({totalQuantity})</span>
        </h1>
        <Link href="/shop" className="text-xs text-[#5B8DEF] hover:text-[#4a7bd1] font-medium transition-colors">
          Continue Shopping &rarr;
        </Link>
      </div>

      {stockError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-600 font-medium">
          {stockError}
        </div>
      )}

      {/* Main Grid: Left Items List + Right Order Summary */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-6">
            {cart.items.map((item) => {
              const image = item.variant.product.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600";
              const isLoading = loadingId === item.id;

              return (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0 transition-opacity ${
                    isLoading ? "opacity-40 pointer-events-none" : "opacity-100"
                  }`}
                >
                  {/* Thumbnail & Product Meta */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-[#F4F8FC]">
                      <Image
                        src={image}
                        alt={item.variant.product.altText || item.variant.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F1B2D]/40">
                        {item.variant.product.brand}
                      </span>
                      <Link
                        href={`/products/${item.variant.product.slug}`}
                        className="block font-bold text-sm text-[#0F1B2D] hover:text-[#5B8DEF] transition-colors line-clamp-1"
                      >
                        {item.variant.product.name}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#0F1B2D]/50">
                        {item.variant.color && (
                          <span>Color: <strong className="text-[#0F1B2D]">{item.variant.color}</strong></span>
                        )}
                        {item.variant.color && item.variant.size && <span>•</span>}
                        {item.variant.size && (
                          <span>Size: <strong className="text-[#0F1B2D]">{item.variant.size}</strong></span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-[#0F1B2D]/50 sm:hidden">
                        ${item.unitPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper & Price / Delete Actions */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-2 sm:pt-0">
                    {/* Stepper */}
                    <div className="flex items-center rounded-lg border border-gray-200 bg-[#F4F8FC] px-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 text-[#0F1B2D]/50 hover:text-[#0F1B2D] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-black text-[#0F1B2D]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 text-[#0F1B2D]/50 hover:text-[#0F1B2D] transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right min-w-[80px]">
                      <div className="text-sm font-black text-[#0F1B2D]">
                        ${item.itemTotal.toFixed(2)}
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-[10px] text-[#0F1B2D]/40">
                          ${item.unitPrice.toFixed(2)} each
                        </div>
                      )}
                    </div>

                    {/* Trash / Remove Icon */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[#0F1B2D]/30 hover:text-rose-500 transition-colors p-1.5 rounded-lg hover:bg-rose-50"
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
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
            <form onSubmit={handleApplyCoupon} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Tag className="absolute left-3.5 top-3 h-3.5 w-3.5 text-[#0F1B2D]/40" />
                <Input
                  placeholder="Enter Promo or Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="pl-9 bg-[#F4F8FC] border-gray-200 text-xs text-[#0F1B2D] uppercase placeholder:normal-case placeholder:text-[#0F1B2D]/40 focus-visible:ring-[#B8FF00]"
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                className="border-gray-200 text-[#0F1B2D] font-bold text-xs uppercase hover:border-[#B8FF00] hover:bg-[#F4F8FC] px-6 rounded-xl"
              >
                Apply
              </Button>
            </form>
            {couponMessage && (
              <p className={`mt-2 text-xs font-medium ${couponMessage.type === "error" ? "text-rose-500" : "text-emerald-600"}`}>
                {couponMessage.text}
              </p>
            )}
          </div>
        </div>

        {/* Order Summary Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-black uppercase tracking-tight text-[#0F1B2D] border-b border-gray-100 pb-4">
              ORDER SUMMARY
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-[#0F1B2D]/60">
                <span>Subtotal</span>
                <span className="font-bold text-[#0F1B2D]">${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#0F1B2D]/60">
                <span>Estimated Shipping</span>
                <span className="text-[#0F1B2D]/50 italic">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-[#0F1B2D]/60">
                <span>Estimated Tax</span>
                <span className="text-[#0F1B2D] font-bold">$0.00</span>
              </div>

              <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
                <span className="text-sm font-black uppercase text-[#0F1B2D]">Estimated Total</span>
                <span className="text-xl font-black text-[#0F1B2D]">${cart.subtotal.toFixed(2)}</span>
              </div>
            </div>

            <Link href="/checkout" className="block pt-2">
              <Button
                size="lg"
                className="w-full bg-[#B8FF00] font-black text-[#0F1B2D] hover:bg-[#a3e600] h-12 text-xs uppercase tracking-wider rounded-xl shadow-sm"
              >
                PROCEED TO CHECKOUT
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-[#0F1B2D]/50 font-medium border-t border-gray-100">
              <ShieldCheck className="h-4 w-4 text-[#B8FF00]" />
              <span>100% Secure Checkout Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
