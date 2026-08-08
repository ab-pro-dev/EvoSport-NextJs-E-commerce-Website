import { Metadata } from "next";
import { ShieldCheck, Package, ShoppingBag, Users, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Admin Dashboard | EvoSport",
  description: "EvoSport Administrative Control Center",
};

export default async function AdminDashboardPage() {
  // Query 1: Total Sales (Sum of order totals for paid/completed orders)
  const salesAggregate = await prisma.order.aggregate({
    _sum: {
      total: true,
    },
    where: {
      status: {
        in: ["PAID", "SHIPPED", "DELIVERED"],
      },
    },
  });
  const totalSales = Number(salesAggregate._sum.total || 0);

  // Query 2: Total Orders count
  const totalOrders = await prisma.order.count();

  // Query 3: Total Products count
  const totalProducts = await prisma.product.count();

  // Query 4: Total Users count
  const totalUsers = await prisma.user.count();

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-8 backdrop-blur-md space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-900/60 bg-rose-950/40 px-3.5 py-1 text-xs font-bold text-rose-400">
          <ShieldCheck className="h-4 w-4" />
          <span>ADMIN ACCESS VERIFIED</span>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white">
          ADMIN DASHBOARD - OVERVIEW
        </h1>
        <p className="text-xs text-neutral-400 max-w-xl">
          EvoSport Administrative Control Console. Live database metrics and system telemetry.
        </p>
      </div>

      {/* Real Database Telemetry Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stat Tile 1: Total Sales */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Sales</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">${totalSales.toFixed(2)}</p>
          <span className="text-[10px] text-neutral-500 font-medium">Real DB sum (PAID orders)</span>
        </div>

        {/* Stat Tile 2: Total Orders */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Orders</span>
            <ShoppingBag className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white">{totalOrders}</p>
          <span className="text-[10px] text-neutral-500 font-medium">Real DB order count</span>
        </div>

        {/* Stat Tile 3: Total Products */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Products</span>
            <Package className="h-4 w-4 text-[#CCFF00]" />
          </div>
          <p className="text-2xl font-black text-white">{totalProducts}</p>
          <span className="text-[10px] text-neutral-500 font-medium">Real DB product count</span>
        </div>

        {/* Stat Tile 4: Total Users */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Users</span>
            <Users className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white">{totalUsers}</p>
          <span className="text-[10px] text-neutral-500 font-medium">Real DB user count</span>
        </div>
      </div>
    </div>
  );
}
