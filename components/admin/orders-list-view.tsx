"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Filter, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";

interface OrderItem {
  id: string;
  status: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  customer: { id: string; name: string | null; email: string } | null;
  itemCount: number;
  createdAt: string;
}

interface OrdersListViewProps {
  initialOrders: OrderItem[];
}

export function OrdersListView({ initialOrders }: OrdersListViewProps) {
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customer?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customer?.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-rose-600 dark:text-rose-500" />
            ORDER MANAGEMENT
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Monitor transactions, verify status state transitions, and process customer fulfillments.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-neutral-900/60 p-4 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
        <Input
          placeholder="Search by Order ID, customer name, email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white sm:w-80"
        />

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:border-rose-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950/80 text-[10px] font-black uppercase text-neutral-500 dark:text-neutral-400">
              <tr>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/60 text-neutral-700 dark:text-neutral-300">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-neutral-400 dark:text-neutral-500 italic">
                    No orders found matching status filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const formattedDate = new Date(o.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-neutral-900/90 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-900 dark:text-white">#{o.id.slice(-8).toUpperCase()}</td>
                      <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                        {o.customer?.name || "Guest Customer"}
                        <span className="block text-[10px] text-neutral-500 font-normal">{o.customer?.email}</span>
                      </td>
                      <td className="py-3.5 px-4 font-medium">{o.itemCount} items</td>
                      <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">${o.total.toFixed(2)}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            o.status === "PAID" || o.status === "DELIVERED"
                              ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              : o.status === "SHIPPED" || o.status === "PROCESSING"
                              ? "bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                              : "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-500 dark:text-neutral-400 font-medium">{formattedDate}</td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                        >
                          <span>Manage</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
