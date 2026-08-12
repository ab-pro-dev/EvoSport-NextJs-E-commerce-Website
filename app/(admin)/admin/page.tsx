import Image from "next/image";
import { Metadata } from "next";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Admin Overview | EvoSport",
  description: "Real-time administrative control panel telemetry",
};

export default async function AdminOverviewPage() {
  // 1. KPI Queries
  const revenueAggregate = await prisma.order.aggregate({
    _sum: { total: true },
    where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
  });
  const totalRevenue = Number(revenueAggregate._sum.total || 0);

  const totalOrders = await prisma.order.count();
  const totalCustomers = await prisma.user.count({ where: { role: "CUSTOMER" } });
  const totalProducts = await prisma.product.count();

  const lowStockVariants = await prisma.productVariant.count({
    where: { stock: { lte: 10 } },
  });

  // 2. Order Status Breakdown Query
  const statusCountsRaw = await prisma.order.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const statusMap = statusCountsRaw.reduce((acc, curr) => {
    acc[curr.status] = curr._count._all;
    return acc;
  }, {} as Record<string, number>);

  // 3. Recent Orders Query (last 5)
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: { select: { quantity: true } },
    },
  });

  // 4. Top Selling Products Query (grouped by order item variantId)
  const topSellingRaw = await prisma.orderItem.groupBy({
    by: ["variantId"],
    _sum: { quantity: true },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: 5,
  });

  // Hydrate top selling product variant & product names
  const variantIds = topSellingRaw.map((t) => t.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: {
        select: {
          name: true,
          slug: true,
          images: { take: 1, orderBy: { position: "asc" } },
        },
      },
    },
  });

  const variantMap = new Map(variants.map((v) => [v.id, v]));

  const topProducts = topSellingRaw.map((item) => {
    const v = variantMap.get(item.variantId);
    return {
      id: item.variantId,
      name: v?.product.name || "Unknown Product",
      color: v?.color || "N/A",
      size: v?.size || "N/A",
      image: v?.product.images[0]?.url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200",
      unitsSold: item._sum.quantity || 0,
    };
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-2 border-b border-gray-200 dark:border-neutral-800 pb-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-rose-600 dark:text-rose-500" />
          <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
            ADMIN DASHBOARD OVERVIEW
          </h1>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Real-time telemetry and management controls backed by Neon PostgreSQL.
        </p>
      </div>

      {/* 5 KPI Stat Tiles Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Tile 1: Total Revenue */}
        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Revenue</span>
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white">${totalRevenue.toFixed(2)}</p>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">Real sum of paid orders</p>
        </div>

        {/* Tile 2: Total Orders */}
        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white">{totalOrders}</p>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">Real DB order count</p>
        </div>

        {/* Tile 3: Total Customers */}
        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Customers</span>
            <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white">{totalCustomers}</p>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">Registered customer accounts</p>
        </div>

        {/* Tile 4: Total Products */}
        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Products</span>
            <Package className="h-4 w-4 text-emerald-600 dark:text-[#CCFF00]" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white">{totalProducts}</p>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">Catalog items in DB</p>
        </div>

        {/* Tile 5: Low Stock Items */}
        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Low Stock Items</span>
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white">{lowStockVariants}</p>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">Variants with stock &le; 10</p>
        </div>
      </div>

      {/* Grid Row: Order Status Breakdown & Top Selling Products */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Order Status Breakdown */}
        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-6 space-y-4 shadow-sm">
          <div className="border-b border-gray-100 dark:border-neutral-800 pb-3">
            <h2 className="text-sm font-black uppercase tracking-tight text-neutral-900 dark:text-white">
              ORDER STATUS BREAKDOWN
            </h2>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Real counts grouped by order state</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-neutral-950 border border-gray-200/80 dark:border-neutral-800/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-neutral-900 dark:text-white">Paid / Delivered</span>
              </div>
              <span className="text-xs font-black text-neutral-900 dark:text-white">{statusMap["PAID"] || 0}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-neutral-950 border border-gray-200/80 dark:border-neutral-800/80">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-neutral-900 dark:text-white">Shipped</span>
              </div>
              <span className="text-xs font-black text-neutral-900 dark:text-white">{statusMap["SHIPPED"] || 0}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-neutral-950 border border-gray-200/80 dark:border-neutral-800/80">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-neutral-900 dark:text-white">Pending</span>
              </div>
              <span className="text-xs font-black text-neutral-900 dark:text-white">{statusMap["PENDING"] || 0}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-neutral-950 border border-gray-200/80 dark:border-neutral-800/80">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                <span className="text-xs font-bold text-neutral-900 dark:text-white">Cancelled</span>
              </div>
              <span className="text-xs font-black text-neutral-900 dark:text-white">{statusMap["CANCELLED"] || 0}</span>
            </div>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-6 space-y-4 shadow-sm">
          <div className="border-b border-gray-100 dark:border-neutral-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight text-neutral-900 dark:text-white">
                TOP SELLING PRODUCTS
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Ranked by real units sold</p>
            </div>
            <Link href="/admin/products" className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline">
              Manage Products
            </Link>
          </div>

          {topProducts.length === 0 ? (
            <p className="text-xs text-neutral-500 italic py-4">No product sales recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-neutral-950 border border-gray-200/80 dark:border-neutral-800/80"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 relative rounded bg-gray-200 dark:bg-neutral-900 overflow-hidden border border-gray-200 dark:border-neutral-800 shrink-0">
                      <Image src={p.image} alt={p.name} fill sizes="40px" className="object-cover" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-900 dark:text-white">{p.name}</p>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                        Color: {p.color} | Size: {p.size}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-rose-600 dark:text-rose-400">{p.unitsSold} units</span>
                    <p className="text-[9px] text-neutral-500">sold</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-4">
          <div>
            <h2 className="text-base font-black uppercase tracking-tight text-neutral-900 dark:text-white">
              RECENT ORDERS
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Latest transactions from database</p>
          </div>
          <Link href="/admin/orders" className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1">
            <span>View All Orders</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-neutral-500 italic py-4">No recent orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950/60 text-[10px] font-black uppercase text-neutral-600 dark:text-neutral-400">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/60 text-neutral-700 dark:text-neutral-300">
                {recentOrders.map((order) => {
                  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
                  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-neutral-900/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-900 dark:text-white">#{order.id.slice(-8).toUpperCase()}</td>
                      <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                        {order.user?.name || "Guest Customer"}
                        <span className="block text-[10px] text-neutral-500 font-normal">{order.user?.email}</span>
                      </td>
                      <td className="py-3.5 px-4 font-medium">{totalItems} items</td>
                      <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">${Number(order.total).toFixed(2)}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            order.status === "PAID" || order.status === "DELIVERED"
                              ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              : order.status === "SHIPPED"
                              ? "bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                              : "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-500 dark:text-neutral-400 font-medium">{formattedDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
