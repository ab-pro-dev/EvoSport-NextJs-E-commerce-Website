"use client";

import Link from "next/link";
import { Package, ArrowRight, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OrderItem {
  id: string;
  productName: string;
  slug: string;
  quantity: number;
  priceAtPurchase: number;
  color: string;
  size: string;
}

interface Order {
  id: string;
  status: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  createdAt: string;
  itemCount: number;
  items: OrderItem[];
}

interface OrdersListViewProps {
  orders: Order[];
}

export function OrdersListView({ orders }: OrdersListViewProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
      case "PAID":
        return (
          <Badge className="bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
            ● {status}
          </Badge>
        );
      case "SHIPPED":
        return (
          <Badge className="bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
            ● {status}
          </Badge>
        );
      case "PENDING":
      case "PROCESSING":
        return (
          <Badge className="bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
            ● {status}
          </Badge>
        );
      case "CANCELLED":
      case "REFUNDED":
        return (
          <Badge className="bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
            ● {status}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-[#0F1B2D]/60 dark:text-slate-300 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
            {status}
          </Badge>
        );
    }
  };

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center px-4 py-16 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F4F8FC] dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-[#B8FF00] mb-5">
          <Package className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight text-[#0F1B2D] dark:text-white">No Orders Yet</h2>
        <p className="mt-1.5 text-xs text-[#0F1B2D]/50 dark:text-slate-400 max-w-sm">
          When you place orders for gear, sportswear, or equipment, they will appear here.
        </p>
        <Link href="/shop" className="mt-6">
          <Button size="lg" className="bg-[#B8FF00] text-[#0F1B2D] font-black uppercase text-xs tracking-wider hover:bg-[#a3e600] rounded-lg px-8">
            Start Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#0F1B2D] dark:text-white">
            MY ORDERS <span className="text-[#B8FF00]">({orders.length})</span>
          </h1>
          <p className="text-xs text-[#0F1B2D]/50 dark:text-slate-400 mt-0.5">Track and manage your order history</p>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-100 dark:border-slate-800 bg-[#F4F8FC] dark:bg-slate-900 text-[10px] uppercase font-extrabold tracking-wider text-[#0F1B2D]/60 dark:text-slate-400">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {orders.map((order) => {
                const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });

                return (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#0F1B2D] dark:text-white">
                      #{order.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="p-4 text-[#0F1B2D]/70 dark:text-slate-300 font-medium">{formattedDate}</td>
                    <td className="p-4 text-[#0F1B2D]/70 dark:text-slate-300 font-medium">
                      {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                    </td>
                    <td className="p-4 font-black text-[#B8FF00]">${order.total.toFixed(2)}</td>
                    <td className="p-4">{getStatusBadge(order.status)}</td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/checkout/confirmation/${order.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm px-3 py-1.5 font-extrabold text-[11px] text-[#0F1B2D] dark:text-white hover:border-[#B8FF00] dark:hover:border-[#B8FF00] hover:bg-[#F4F8FC] dark:hover:bg-slate-800 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Details</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
