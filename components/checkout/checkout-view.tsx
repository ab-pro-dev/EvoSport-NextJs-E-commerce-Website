"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck, CreditCard, Truck, ArrowRight, ArrowLeft, ShoppingBag, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

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
  savedAddresses?: SavedAddress[];
  userEmail?: string;
  userName?: string;
}

export function CheckoutView({ cart, savedAddresses = [], userEmail = "", userName = "" }: CheckoutViewProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];

  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    defaultAddr?.id || "custom"
  );

  // Address form state initialized with default address if available
  const [address, setAddress] = useState({
    fullName: defaultAddr?.fullName || userName || "",
    email: userEmail || "",
    line1: defaultAddr?.line1 || "",
    line2: defaultAddr?.line2 || "",
    city: defaultAddr?.city || "",
  });

  const [phoneNumber, setPhoneNumber] = useState(defaultAddr?.phone || "");

  // Payment form state
  const [payment, setPayment] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
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

  const handleSelectSavedAddress = (id: string) => {
    setSelectedAddressId(id);
    if (id === "custom") {
      setAddress({
        fullName: userName || "",
        email: userEmail || "",
        line1: "",
        line2: "",
        city: "",
      });
      setPhoneNumber("");
    } else {
      const selected = savedAddresses.find((a) => a.id === id);
      if (selected) {
        setAddress({
          fullName: selected.fullName,
          email: userEmail || "",
          line1: selected.line1,
          line2: selected.line2 || "",
          city: selected.city,
        });
        setPhoneNumber(selected.phone);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field: string, value: string) => {
    setPayment((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (
      !address.fullName.trim() ||
      !address.email.trim() ||
      !phoneNumber.trim() ||
      !address.line1.trim() ||
      !address.city.trim()
    ) {
      setErrorMessage("Please fill in all required shipping address fields.");
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  const validateStep2 = () => {
    if (
      !payment.cardNumber.trim() ||
      !payment.cardHolder.trim() ||
      !payment.expiryDate.trim() ||
      !payment.cvv.trim()
    ) {
      setErrorMessage("Please fill in all mock payment details.");
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

  const handleNextToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) {
      setStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setIsPlacingOrder(true);
      setErrorMessage(null);

      const formattedPhone = `+251 ${phoneNumber.trim()}`;

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: {
            fullName: address.fullName.trim(),
            phone: formattedPhone,
            line1: address.line1.trim(),
            line2: address.line2.trim() || undefined,
            city: address.city.trim(),
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
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-6">
        <h1 className="text-3xl font-black uppercase tracking-tight text-[#0F1B2D] dark:text-white">
          CHECKOUT
        </h1>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-black uppercase">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
              step === 1
                ? "border-[#B8FF00] bg-[#B8FF00]/20 text-[#0F1B2D] dark:text-[#B8FF00]"
                : "border-gray-200 dark:border-slate-800 text-[#0F1B2D]/50 dark:text-slate-400 hover:text-[#0F1B2D] dark:hover:text-white"
            }`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${step === 1 ? 'bg-[#B8FF00] text-[#0F1B2D]' : 'bg-gray-200 dark:bg-slate-800 text-[#0F1B2D] dark:text-slate-400'}`}>1</span>
            <span>Shipping</span>
          </button>

          <span className="text-gray-300 dark:text-slate-700">&rarr;</span>

          <button
            onClick={() => validateStep1() && setStep(2)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
              step === 2
                ? "border-[#B8FF00] bg-[#B8FF00]/20 text-[#0F1B2D] dark:text-[#B8FF00]"
                : "border-gray-200 dark:border-slate-800 text-[#0F1B2D]/50 dark:text-slate-400 hover:text-[#0F1B2D] dark:hover:text-white"
            }`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${step === 2 ? 'bg-[#B8FF00] text-[#0F1B2D]' : 'bg-gray-200 dark:bg-slate-800 text-[#0F1B2D] dark:text-slate-400'}`}>2</span>
            <span>Payment</span>
          </button>

          <span className="text-gray-300 dark:text-slate-700">&rarr;</span>

          <button
            onClick={() => validateStep1() && validateStep2() && setStep(3)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
              step === 3
                ? "border-[#B8FF00] bg-[#B8FF00]/20 text-[#0F1B2D] dark:text-[#B8FF00]"
                : "border-gray-200 dark:border-slate-800 text-[#0F1B2D]/50 dark:text-slate-400 hover:text-[#0F1B2D] dark:hover:text-white"
            }`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${step === 3 ? 'bg-[#B8FF00] text-[#0F1B2D]' : 'bg-gray-200 dark:bg-slate-800 text-[#0F1B2D] dark:text-slate-400'}`}>3</span>
            <span>Review</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-600 dark:text-rose-300 font-medium">
          {errorMessage}
        </div>
      )}

      {/* Main Checkout Layout: Left Form / Right Summary */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Interactive Form Area (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: SHIPPING ADDRESS & METHOD */}
          {step === 1 && (
            <form onSubmit={handleNextToPayment} className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-4">
                <Truck className="h-5 w-5 text-[#B8FF00]" />
                <h2 className="text-lg font-black uppercase text-[#0F1B2D] dark:text-white">1. SHIPPING ADDRESS</h2>
              </div>

              {/* Saved Address Selector */}
              {savedAddresses.length > 0 && (
                <div className="rounded-xl border border-[#B8FF00]/40 bg-[#B8FF00]/10 dark:bg-[#B8FF00]/10 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-[#0F1B2D] dark:text-white flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#B8FF00]" />
                      Use a Saved Address
                    </label>
                    <span className="text-[10px] font-bold text-[#0F1B2D]/50 dark:text-slate-400">
                      {savedAddresses.length} saved
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => handleSelectSavedAddress(addr.id)}
                          className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                            isSelected
                              ? "border-[#B8FF00] bg-white dark:bg-slate-900 ring-2 ring-[#B8FF00]/40 shadow-sm"
                              : "border-gray-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:border-gray-300 dark:hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-xs font-bold text-[#0F1B2D] dark:text-white truncate">
                              {addr.fullName}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[9px] font-black uppercase bg-[#B8FF00] text-[#0F1B2D] px-1.5 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#0F1B2D]/70 dark:text-slate-300 line-clamp-1">{addr.line1}</span>
                          <span className="text-[10px] text-[#0F1B2D]/50 dark:text-slate-400">{addr.city}, {addr.state} {addr.zip}</span>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => handleSelectSavedAddress("custom")}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed transition-all ${
                        selectedAddressId === "custom"
                          ? "border-[#B8FF00] bg-white dark:bg-slate-900 text-[#0F1B2D] dark:text-white font-bold"
                          : "border-gray-300 dark:border-slate-700 text-[#0F1B2D]/60 dark:text-slate-400 hover:border-gray-400"
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="text-xs font-bold">+ Enter New Address</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 dark:text-slate-400">Full Name *</label>
                  <Input
                    required
                    value={address.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="mt-1.5 bg-[#F4F8FC] dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-xs text-[#0F1B2D] dark:text-white focus-visible:ring-[#B8FF00]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 dark:text-slate-400">Email Address *</label>
                  <Input
                    required
                    type="email"
                    value={address.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="mt-1.5 bg-[#F4F8FC] dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-xs text-[#0F1B2D] dark:text-white focus-visible:ring-[#B8FF00]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 dark:text-slate-400">Phone Number *</label>
                  <div className="mt-1.5 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-200 dark:border-slate-800 bg-gray-100 dark:bg-slate-800 text-xs font-bold text-[#0F1B2D] dark:text-slate-300 select-none">
                      +251
                    </span>
                    <Input
                      required
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/[^\d]/g, "");
                        setPhoneNumber(digits.startsWith("0") ? digits.slice(1) : digits);
                      }}
                      className="rounded-l-none bg-[#F4F8FC] dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-xs text-[#0F1B2D] dark:text-white focus-visible:ring-[#B8FF00]"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 dark:text-slate-400">Street Address *</label>
                  <Input
                    required
                    value={address.line1}
                    onChange={(e) => handleInputChange("line1", e.target.value)}
                    className="mt-1.5 bg-[#F4F8FC] dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-xs text-[#0F1B2D] dark:text-white focus-visible:ring-[#B8FF00]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 dark:text-slate-400">Apartment, Suite, Unit (Optional)</label>
                  <Input
                    value={address.line2}
                    onChange={(e) => handleInputChange("line2", e.target.value)}
                    className="mt-1.5 bg-[#F4F8FC] dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-xs text-[#0F1B2D] dark:text-white focus-visible:ring-[#B8FF00]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 dark:text-slate-400">City *</label>
                  <Input
                    required
                    value={address.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="mt-1.5 bg-[#F4F8FC] dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-xs text-[#0F1B2D] dark:text-white focus-visible:ring-[#B8FF00]"
                  />
                </div>
              </div>

              {/* Shipping Method Selection */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F1B2D]/60 dark:text-slate-400 mb-3">Shipping Method</h3>
                <div className="space-y-2.5">
                  <label
                    onClick={() => setShippingMethod("standard")}
                    className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                      shippingMethod === "standard"
                        ? "border-[#B8FF00] bg-[#B8FF00]/10 text-[#0F1B2D] dark:text-[#B8FF00]"
                        : "border-gray-200 dark:border-slate-800 bg-[#F4F8FC] dark:bg-slate-900 text-[#0F1B2D]/60 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        checked={shippingMethod === "standard"}
                        onChange={() => setShippingMethod("standard")}
                        className="text-[#0F1B2D] focus:ring-[#B8FF00]"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#0F1B2D] dark:text-white">Standard Shipping (3-5 Business Days)</div>
                        <div className="text-[11px] text-[#0F1B2D]/40 dark:text-slate-500">Free on orders over $100</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#0F1B2D] dark:text-white">
                      {subtotal >= 100 ? "FREE" : "$9.99"}
                    </span>
                  </label>

                  <label
                    onClick={() => setShippingMethod("express")}
                    className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                      shippingMethod === "express"
                        ? "border-[#B8FF00] bg-[#B8FF00]/10 text-[#0F1B2D] dark:text-[#B8FF00]"
                        : "border-gray-200 dark:border-slate-800 bg-[#F4F8FC] dark:bg-slate-900 text-[#0F1B2D]/60 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        checked={shippingMethod === "express"}
                        onChange={() => setShippingMethod("express")}
                        className="text-[#0F1B2D] focus:ring-[#B8FF00]"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#0F1B2D] dark:text-white">Express Shipping (2 Business Days)</div>
                        <div className="text-[11px] text-[#0F1B2D]/40 dark:text-slate-500">Guaranteed expedited air transit</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#0F1B2D] dark:text-white">$12.99</span>
                  </label>

                  <label
                    onClick={() => setShippingMethod("overnight")}
                    className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                      shippingMethod === "overnight"
                        ? "border-[#B8FF00] bg-[#B8FF00]/10 text-[#0F1B2D] dark:text-[#B8FF00]"
                        : "border-gray-200 dark:border-slate-800 bg-[#F4F8FC] dark:bg-slate-900 text-[#0F1B2D]/60 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        checked={shippingMethod === "overnight"}
                        onChange={() => setShippingMethod("overnight")}
                        className="text-[#0F1B2D] focus:ring-[#B8FF00]"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#0F1B2D] dark:text-white">Overnight Priority (Next Day)</div>
                        <div className="text-[11px] text-[#0F1B2D]/40 dark:text-slate-500">Delivered by 10:30 AM next business day</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#0F1B2D] dark:text-white">$24.99</span>
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

          {/* STEP 2: PAYMENT METHOD */}
          {step === 2 && (
            <form onSubmit={handleNextToReview} className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-4">
                <CreditCard className="h-5 w-5 text-[#B8FF00]" />
                <h2 className="text-lg font-black uppercase text-[#0F1B2D] dark:text-white">2. PAYMENT INFORMATION (MOCK)</h2>
              </div>

              <div className="rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Test Payment Gateway Active. You can use any 16-digit card number.</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 dark:text-slate-400">Card Number *</label>
                  <Input
                    required
                    placeholder="4242 4242 4242 4242"
                    value={payment.cardNumber}
                    onChange={(e) => handlePaymentChange("cardNumber", e.target.value)}
                    className="mt-1.5 bg-[#F4F8FC] dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-xs text-[#0F1B2D] dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus-visible:ring-[#B8FF00]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 dark:text-slate-400">Cardholder Name *</label>
                  <Input
                    required
                    placeholder="Name on card"
                    value={payment.cardHolder}
                    onChange={(e) => handlePaymentChange("cardHolder", e.target.value)}
                    className="mt-1.5 bg-[#F4F8FC] dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-xs text-[#0F1B2D] dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus-visible:ring-[#B8FF00]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 dark:text-slate-400">Expiry Date *</label>
                    <Input
                      required
                      placeholder="MM/YY"
                      value={payment.expiryDate}
                      onChange={(e) => handlePaymentChange("expiryDate", e.target.value)}
                      className="mt-1.5 bg-[#F4F8FC] dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-xs text-[#0F1B2D] dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus-visible:ring-[#B8FF00]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 dark:text-slate-400">CVV / CVC *</label>
                    <Input
                      required
                      placeholder="123"
                      value={payment.cvv}
                      onChange={(e) => handlePaymentChange("cvv", e.target.value)}
                      className="mt-1.5 bg-[#F4F8FC] dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-xs text-[#0F1B2D] dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus-visible:ring-[#B8FF00]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="border-gray-200 dark:border-slate-800 text-[#0F1B2D] dark:text-white font-bold text-xs uppercase hover:border-[#B8FF00] dark:hover:border-[#B8FF00] hover:bg-[#F4F8FC] dark:hover:bg-slate-800 h-12 rounded-xl"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Shipping
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="flex-1 bg-[#B8FF00] font-black text-[#0F1B2D] hover:bg-[#a3e600] h-12 text-xs uppercase tracking-wider rounded-xl shadow-sm"
                >
                  Continue to Review
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: REVIEW ORDER */}
          {step === 3 && (
            <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-4">
                <ShieldCheck className="h-5 w-5 text-[#B8FF00]" />
                <h2 className="text-lg font-black uppercase text-[#0F1B2D] dark:text-white">3. REVIEW YOUR ORDER</h2>
              </div>

              {/* Shipping Address Summary */}
              <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-[#F4F8FC] dark:bg-slate-900/60 p-4 text-xs space-y-1">
                <div className="flex justify-between font-bold text-[#0F1B2D] dark:text-white mb-2">
                  <span className="uppercase text-[#0F1B2D]/60 dark:text-slate-400">Shipping Address</span>
                  <button onClick={() => setStep(1)} className="text-[#5B8DEF] dark:text-[#B8FF00] hover:underline">Edit</button>
                </div>
                <p className="text-[#0F1B2D] dark:text-white font-bold">{address.fullName}</p>
                <p className="text-[#0F1B2D]/60 dark:text-slate-400">{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p>
                <p className="text-[#0F1B2D]/60 dark:text-slate-400">{address.city}</p>
                <p className="text-[#0F1B2D]/60 dark:text-slate-400">Phone: +251 {phoneNumber}</p>
              </div>

              {/* Cart Items Summary List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F1B2D]/60 dark:text-slate-400">Items ({cart.items.length})</h3>
                <div className="divide-y divide-gray-100 dark:divide-slate-800 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-1">
                          <Image
                            src={item.variant.product.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"}
                            alt={item.variant.product.name}
                            fill
                            className="object-contain"
                            sizes="48px"
                          />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#0F1B2D] dark:text-white line-clamp-1">{item.variant.product.name}</div>
                          <div className="text-[10px] text-[#0F1B2D]/50 dark:text-slate-400">
                            {item.variant.color} • {item.variant.size} • Qty: {item.quantity}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#0F1B2D] dark:text-white">${item.itemTotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="border-gray-200 dark:border-slate-800 text-[#0F1B2D] dark:text-white font-bold text-xs uppercase hover:border-[#B8FF00] dark:hover:border-[#B8FF00] hover:bg-[#F4F8FC] dark:hover:bg-slate-800 h-12 rounded-xl"
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
          <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-6 shadow-sm space-y-5 sticky top-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-[#0F1B2D] dark:text-white border-b border-gray-100 dark:border-slate-800 pb-4">
              ORDER SUMMARY
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-[#0F1B2D]/60 dark:text-slate-400">
                <span>Subtotal ({cart.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-bold text-[#0F1B2D] dark:text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#0F1B2D]/60 dark:text-slate-400">
                <span>Shipping ({shippingMethod})</span>
                <span className="font-bold text-[#0F1B2D] dark:text-white">{shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-[#0F1B2D]/60 dark:text-slate-400">
                <span>Estimated Tax (8%)</span>
                <span className="font-bold text-[#0F1B2D] dark:text-white">${tax.toFixed(2)}</span>
              </div>

              <div className="border-t border-gray-100 dark:border-slate-800 pt-4 flex justify-between items-baseline">
                <span className="text-sm font-black uppercase text-[#0F1B2D] dark:text-white">Total</span>
                <span className="text-2xl font-black text-[#0F1B2D] dark:text-white">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-[#0F1B2D]/40 dark:text-slate-500 space-y-1">
              <p>• Fast dispatch within 24 hours</p>
              <p>• 30-day effortless returns policy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
