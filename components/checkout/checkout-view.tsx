"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck, CreditCard, Truck, ArrowRight, ArrowLeft, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CartItem {
  id: string;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
  variant: {
    id: string;
    sku: string;
    color: string;
    size: string;
    product: {
      id: string;
      name: string;
      slug: string;
      brand: string;
      image: string | null;
    };
  };
}

interface CartData {
  items: CartItem[];
  subtotal: number;
}

interface CheckoutViewProps {
  cart: CartData;
}

export function CheckoutView({ cart }: CheckoutViewProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Address form state
  const [address, setAddress] = useState({
    fullName: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });

  // Shipping method selection
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express" | "overnight">("standard");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Calculations
  const subtotal = cart.subtotal;
  let shippingCost = 0;
  if (shippingMethod === "express") shippingCost = 12.99;
  else if (shippingMethod === "overnight") shippingCost = 24.99;
  else shippingCost = subtotal >= 100 ? 0 : 9.99;

  const tax = Number((subtotal * 0.08).toFixed(2));
  const total = Number((subtotal + shippingCost + tax).toFixed(2));

  const handleInputChange = (field: string, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (
      !address.fullName ||
      !address.email ||
      !address.phone ||
      !address.line1 ||
      !address.city ||
      !address.state ||
      !address.zip
    ) {
      setErrorMessage("Please fill in all required shipping address fields.");
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setIsPlacingOrder(true);
      setErrorMessage(null);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: {
            fullName: address.fullName,
            phone: address.phone,
            line1: address.line1,
            line2: address.line2 || undefined,
            city: address.city,
            state: address.state,
            zip: address.zip,
            country: address.country,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || "Failed to process checkout.";
        setErrorMessage(msg);
        toast.error(msg);
        setIsPlacingOrder(false);
        return;
      }

      toast.success(`Order #${data.order.id.slice(-8).toUpperCase()} placed successfully!`);
      router.push(`/checkout/confirmation/${data.order.id}`);
    } catch (err: any) {
      console.error("Error during checkout:", err);
      const msg = err?.message || "Network error. Please try again.";
      setErrorMessage(msg);
      toast.error(msg);
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Multi-Step Indicator Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-black uppercase tracking-tight text-[#0F1B2D]">
          CHECKOUT
        </h1>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-black uppercase">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
              step === 1
                ? "border-[#B8FF00] bg-[#B8FF00]/20 text-[#0F1B2D]"
                : "border-gray-200 text-[#0F1B2D]/50 hover:text-[#0F1B2D]"
            }`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${step === 1 ? 'bg-[#B8FF00] text-[#0F1B2D]' : 'bg-gray-200 text-[#0F1B2D]'}`}>1</span>
            <span>Shipping</span>
          </button>

          <span className="text-gray-300">&rarr;</span>

          <button
            onClick={() => validateStep1() && setStep(2)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
              step === 2
                ? "border-[#B8FF00] bg-[#B8FF00]/20 text-[#0F1B2D]"
                : "border-gray-200 text-[#0F1B2D]/50 hover:text-[#0F1B2D]"
            }`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${step === 2 ? 'bg-[#B8FF00] text-[#0F1B2D]' : 'bg-gray-200 text-[#0F1B2D]'}`}>2</span>
            <span>Payment</span>
          </button>

          <span className="text-gray-300">&rarr;</span>

          <button
            onClick={() => validateStep1() && setStep(3)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
              step === 3
                ? "border-[#B8FF00] bg-[#B8FF00]/20 text-[#0F1B2D]"
                : "border-gray-200 text-[#0F1B2D]/50 hover:text-[#0F1B2D]"
            }`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${step === 3 ? 'bg-[#B8FF00] text-[#0F1B2D]' : 'bg-gray-200 text-[#0F1B2D]'}`}>3</span>
            <span>Review</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs text-rose-600 font-medium">
          {errorMessage}
        </div>
      )}

      {/* Main Checkout Layout: Left Form / Right Summary */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Interactive Form Area (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: SHIPPING ADDRESS & METHOD */}
          {step === 1 && (
            <form onSubmit={handleNextToPayment} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                <Truck className="h-5 w-5 text-[#B8FF00]" />
                <h2 className="text-lg font-black uppercase text-[#0F1B2D]">1. SHIPPING ADDRESS</h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60">Full Name *</label>
                  <Input
                    required
                    placeholder="Alex Morgan"
                    value={address.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="mt-1.5 bg-[#F4F8FC] border-gray-200 text-xs text-[#0F1B2D] placeholder:text-[#0F1B2D]/40 focus-visible:ring-[#B8FF00]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60">Email Address *</label>
                  <Input
                    required
                    type="email"
                    placeholder="alex@example.com"
                    value={address.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="mt-1.5 bg-[#F4F8FC] border-gray-200 text-xs text-[#0F1B2D] placeholder:text-[#0F1B2D]/40 focus-visible:ring-[#B8FF00]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60">Phone Number *</label>
                  <Input
                    required
                    placeholder="+1 (555) 000-0000"
                    value={address.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="mt-1.5 bg-[#F4F8FC] border-gray-200 text-xs text-[#0F1B2D] placeholder:text-[#0F1B2D]/40 focus-visible:ring-[#B8FF00]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60">Street Address *</label>
                  <Input
                    required
                    placeholder="123 Performance Way"
                    value={address.line1}
                    onChange={(e) => handleInputChange("line1", e.target.value)}
                    className="mt-1.5 bg-[#F4F8FC] border-gray-200 text-xs text-[#0F1B2D] placeholder:text-[#0F1B2D]/40 focus-visible:ring-[#B8FF00]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60">Apartment, Suite, Unit (Optional)</label>
                  <Input
                    placeholder="Apt 4B"
                    value={address.line2}
                    onChange={(e) => handleInputChange("line2", e.target.value)}
                    className="mt-1.5 bg-[#F4F8FC] border-gray-200 text-xs text-[#0F1B2D] placeholder:text-[#0F1B2D]/40 focus-visible:ring-[#B8FF00]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60">City *</label>
                  <Input
                    required
                    placeholder="New York"
                    value={address.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="mt-1.5 bg-[#F4F8FC] border-gray-200 text-xs text-[#0F1B2D] placeholder:text-[#0F1B2D]/40 focus-visible:ring-[#B8FF00]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60">State / Province *</label>
                  <Input
                    required
                    placeholder="NY"
                    value={address.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className="mt-1.5 bg-[#F4F8FC] border-gray-200 text-xs text-[#0F1B2D] placeholder:text-[#0F1B2D]/40 focus-visible:ring-[#B8FF00]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60">Postal / Zip Code *</label>
                  <Input
                    required
                    placeholder="10001"
                    value={address.zip}
                    onChange={(e) => handleInputChange("zip", e.target.value)}
                    className="mt-1.5 bg-[#F4F8FC] border-gray-200 text-xs text-[#0F1B2D] placeholder:text-[#0F1B2D]/40 focus-visible:ring-[#B8FF00]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60">Country *</label>
                  <Input
                    required
                    placeholder="US"
                    value={address.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    className="mt-1.5 bg-[#F4F8FC] border-gray-200 text-xs text-[#0F1B2D] placeholder:text-[#0F1B2D]/40 focus-visible:ring-[#B8FF00]"
                  />
                </div>
              </div>

              {/* Shipping Method Selection */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F1B2D]/60 mb-3">Shipping Method</h3>
                <div className="space-y-2.5">
                  <label
                    onClick={() => setShippingMethod("standard")}
                    className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                      shippingMethod === "standard"
                        ? "border-[#B8FF00] bg-[#B8FF00]/10 text-[#0F1B2D]"
                        : "border-gray-200 bg-[#F4F8FC] text-[#0F1B2D]/60 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        checked={shippingMethod === "standard"}
                        onChange={() => setShippingMethod("standard")}
                        className="accent-[#B8FF00]"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#0F1B2D]">Standard Delivery</div>
                        <div className="text-[10px] text-[#0F1B2D]/50">3-5 Business Days</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#B8FF00]">
                      {subtotal >= 100 ? "FREE" : "$9.99"}
                    </span>
                  </label>

                  <label
                    onClick={() => setShippingMethod("express")}
                    className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                      shippingMethod === "express"
                        ? "border-[#B8FF00] bg-[#B8FF00]/10 text-[#0F1B2D]"
                        : "border-gray-200 bg-[#F4F8FC] text-[#0F1B2D]/60 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        checked={shippingMethod === "express"}
                        onChange={() => setShippingMethod("express")}
                        className="accent-[#B8FF00]"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#0F1B2D]">Express Air Shipping</div>
                        <div className="text-[10px] text-[#0F1B2D]/50">1-2 Business Days</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#0F1B2D]">$12.99</span>
                  </label>

                  <label
                    onClick={() => setShippingMethod("overnight")}
                    className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                      shippingMethod === "overnight"
                        ? "border-[#B8FF00] bg-[#B8FF00]/10 text-[#0F1B2D]"
                        : "border-gray-200 bg-[#F4F8FC] text-[#0F1B2D]/60 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        checked={shippingMethod === "overnight"}
                        onChange={() => setShippingMethod("overnight")}
                        className="accent-[#B8FF00]"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#0F1B2D]">Priority Overnight</div>
                        <div className="text-[10px] text-[#0F1B2D]/50">Next Business Day</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#0F1B2D]">$24.99</span>
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-[#B8FF00] font-black text-[#0F1B2D] hover:bg-[#a3e600] h-12 text-xs uppercase tracking-wider rounded-xl shadow-sm"
              >
                Continue to Payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}

          {/* STEP 2: MOCK PAYMENT PLACEHOLDER */}
          {step === 2 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                <CreditCard className="h-5 w-5 text-[#B8FF00]" />
                <h2 className="text-lg font-black uppercase text-[#0F1B2D]">2. PAYMENT METHOD</h2>
              </div>

              <div className="rounded-xl border border-[#B8FF00]/50 bg-[#F4F8FC] p-6 text-center space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#B8FF00]/20 text-[#0F1B2D]">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold uppercase text-[#0F1B2D]">Mock Checkout Enabled</h3>
                <p className="text-xs text-[#0F1B2D]/60 max-w-md mx-auto">
                  Instant mock payment simulation is active for testing. No real credit card or gateway processing required.
                </p>
                <div className="pt-2">
                  <span className="inline-block rounded-md bg-white border border-gray-200 px-3 py-1 text-[11px] font-mono text-[#0F1B2D]">
                    Provider: MOCK_PAYMENT (Instant Approval)
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="border-gray-200 text-[#0F1B2D] font-bold text-xs uppercase hover:border-[#B8FF00] hover:bg-[#F4F8FC] h-12 rounded-xl"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Shipping
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  size="lg"
                  className="flex-1 bg-[#B8FF00] font-black text-[#0F1B2D] hover:bg-[#a3e600] h-12 text-xs uppercase tracking-wider rounded-xl shadow-sm"
                >
                  Continue to Review
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW ORDER */}
          {step === 3 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                <ShieldCheck className="h-5 w-5 text-[#B8FF00]" />
                <h2 className="text-lg font-black uppercase text-[#0F1B2D]">3. REVIEW YOUR ORDER</h2>
              </div>

              {/* Shipping Address Summary */}
              <div className="rounded-lg border border-gray-200 bg-[#F4F8FC] p-4 text-xs space-y-1">
                <div className="flex justify-between font-bold text-[#0F1B2D] mb-2">
                  <span className="uppercase text-[#0F1B2D]/60">Shipping Address</span>
                  <button onClick={() => setStep(1)} className="text-[#5B8DEF] hover:underline">Edit</button>
                </div>
                <p className="text-[#0F1B2D] font-bold">{address.fullName}</p>
                <p className="text-[#0F1B2D]/60">{address.line1} {address.line2}</p>
                <p className="text-[#0F1B2D]/60">{address.city}, {address.state} {address.zip}, {address.country}</p>
                <p className="text-[#0F1B2D]/60">Phone: {address.phone}</p>
              </div>

              {/* Cart Items Summary List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F1B2D]/60">Items ({cart.items.length})</h3>
                <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white p-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-100 bg-[#F4F8FC]">
                          <Image
                            src={item.variant.product.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"}
                            alt={item.variant.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#0F1B2D] line-clamp-1">{item.variant.product.name}</div>
                          <div className="text-[10px] text-[#0F1B2D]/50">
                            {item.variant.color} • {item.variant.size} • Qty: {item.quantity}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#0F1B2D]">${item.itemTotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="border-gray-200 text-[#0F1B2D] font-bold text-xs uppercase hover:border-[#B8FF00] hover:bg-[#F4F8FC] h-12 rounded-xl"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  size="lg"
                  className="flex-1 bg-[#B8FF00] font-black text-[#0F1B2D] hover:bg-[#a3e600] h-12 text-xs uppercase tracking-wider rounded-xl shadow-sm"
                >
                  {isPlacingOrder ? "PROCESSING ORDER..." : `PLACE ORDER ($${total.toFixed(2)})`}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Persistent Order Summary Sidebar (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5 sticky top-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-[#0F1B2D] border-b border-gray-100 pb-4">
              ORDER SUMMARY
            </h2>

            {/* Thumbnail Mini-List */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="relative h-10 w-10 rounded border border-gray-100 bg-[#F4F8FC] flex-shrink-0 overflow-hidden">
                      <Image
                        src={item.variant.product.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"}
                        alt={item.variant.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-[#0F1B2D] line-clamp-1 max-w-[150px]">{item.variant.product.name}</div>
                      <div className="text-[10px] text-[#0F1B2D]/50">Qty: {item.quantity}</div>
                    </div>
                  </div>
                  <span className="font-bold text-[#0F1B2D]">${item.itemTotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Totals Breakdown */}
            <div className="border-t border-gray-100 pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-[#0F1B2D]/60">
                <span>Subtotal</span>
                <span className="font-bold text-[#0F1B2D]">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-[#0F1B2D]/60">
                <span>Shipping ({shippingMethod.toUpperCase()})</span>
                <span className="font-bold text-[#0F1B2D]">
                  {shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between text-[#0F1B2D]/60">
                <span>Estimated Tax (8%)</span>
                <span className="font-bold text-[#0F1B2D]">${tax.toFixed(2)}</span>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-black uppercase text-[#0F1B2D]">Total</span>
                <span className="text-2xl font-black text-[#0F1B2D]">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-[#0F1B2D]/50 font-medium border-t border-gray-100">
              <ShieldCheck className="h-4 w-4 text-[#B8FF00]" />
              <span>Instant Order Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
