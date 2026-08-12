import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, ArrowRight, ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

interface ConfirmationPageProps {
  params: Promise<{ orderId: string }>;
}

export const metadata: Metadata = {
  title: "Order Confirmation | EvoSport",
  description: "Thank you for your purchase from EvoSport.",
};

export default async function OrderConfirmationPage({ params }: ConfirmationPageProps) {
  const { orderId } = await params;

  if (!orderId) {
    notFound();
  }

  const rawOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: { orderBy: { position: "asc" }, take: 1 },
                },
              },
            },
          },
        },
      },
      shippingAddress: true,
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!rawOrder) {
    notFound();
  }

  const order = {
    id: rawOrder.id,
    status: rawOrder.status,
    subtotal: Number(rawOrder.subtotal),
    shipping: Number(rawOrder.shipping),
    tax: Number(rawOrder.tax),
    total: Number(rawOrder.total),
    createdAt: rawOrder.createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    shippingAddress: rawOrder.shippingAddress,
    payment: rawOrder.payments[0] || null,
    items: rawOrder.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.priceAtPurchase),
      total: Number(item.priceAtPurchase) * item.quantity,
      productName: item.variant.product.name,
      variantName: `${item.variant.color} / ${item.variant.size}`,
      image:
        item.variant.product.images[0]?.url ||
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    })),
  };

  return (
    <div className="min-h-screen bg-[#F4F8FC] text-[#0F1B2D]">
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 sm:p-12 shadow-sm text-center space-y-8">
          {/* Success Icon */}
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 border border-emerald-200">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-[#0F1B2D]">
              ORDER CONFIRMED!
            </h1>
            <p className="mt-2 text-xs text-[#0F1B2D]/50">
              Thank you for your purchase. We&apos;ve received your order and are preparing your gear.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl bg-[#F4F8FC] px-4 py-2 text-xs font-mono text-[#0F1B2D]/60 border border-gray-200">
            <span>Order ID:</span>
            <strong className="text-[#0F1B2D] font-bold">{order.id}</strong>
          </div>

          {/* Details Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left pt-4 border-t border-gray-100">
            {/* Shipping Info */}
            <div className="rounded-xl border border-gray-200 bg-[#F4F8FC] p-4 space-y-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F1B2D]/40">Shipping Address</span>
              <div className="font-bold text-[#0F1B2D] text-sm">{order.shippingAddress.fullName}</div>
              <div className="text-[#0F1B2D]/50">{order.shippingAddress.line1}</div>
              <div className="text-[#0F1B2D]/50">{order.shippingAddress.city}</div>
              <div className="text-[#0F1B2D]/50">Phone: {order.shippingAddress.phone}</div>
            </div>

            {/* Payment Summary */}
            <div className="rounded-xl border border-gray-200 bg-[#F4F8FC] p-4 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F1B2D]/40">Payment Details</span>
              <div className="flex justify-between">
                <span className="text-[#0F1B2D]/50">Status:</span>
                <span className="font-extrabold text-emerald-600 uppercase">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#0F1B2D]/50">Provider:</span>
                <span className="font-mono text-[#0F1B2D]/70">{order.payment?.provider || "MOCK"}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 font-bold">
                <span className="text-[#0F1B2D]">Total Paid:</span>
                <span className="text-[#B8FF00] text-sm bg-[#0F1B2D] px-2 py-0.5 rounded-lg">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Items Summary */}
          <div className="text-left space-y-3 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F1B2D]/40">Ordered Items ({order.items.length})</h3>
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-[#F4F8FC] p-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
                      <Image src={item.image} alt={item.productName} fill className="object-cover" />
                    </div>
                    <div>
                      <div className="font-bold text-[#0F1B2D] text-sm line-clamp-1">{item.productName}</div>
                      <div className="text-[#0F1B2D]/50">{item.variantName} • Qty: {item.quantity}</div>
                    </div>
                  </div>
                  <div className="font-extrabold text-[#0F1B2D]">${item.total.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-gray-100">
            <Link href="/shop" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-[#B8FF00] font-black text-[#0F1B2D] hover:bg-[#a3e600] text-xs uppercase tracking-wider rounded-xl px-8 shadow-sm">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
            <Link href="/dashboard/orders" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full border-gray-200 text-[#0F1B2D] font-bold text-xs uppercase hover:border-[#B8FF00] hover:bg-[#F4F8FC] rounded-xl px-8">
                View My Orders
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
