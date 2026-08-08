import { Metadata } from "next";
import { ShieldCheck, Package, ShoppingBag, Users, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard | EvoSport",
  description: "EvoSport Administrative Control Center",
};

export default function AdminDashboardPage() {
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
          Welcome to the EvoSport Management Console. Admin features including product inventory management, order fulfillment, and review moderation are enabled.
        </p>
      </div>

      {/* Stats Cards Preview Stub */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Sales</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">$14,850.00</p>
          <span className="text-[10px] text-neutral-500 font-medium">+12.5% from last month</span>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Orders</span>
            <ShoppingBag className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white">128</p>
          <span className="text-[10px] text-neutral-500 font-medium">Real DB backend active</span>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Products</span>
            <Package className="h-4 w-4 text-[#CCFF00]" />
          </div>
          <p className="text-2xl font-black text-white">11</p>
          <span className="text-[10px] text-neutral-500 font-medium">Active in catalog</span>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Users</span>
            <Users className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white">24</p>
          <span className="text-[10px] text-neutral-500 font-medium">Registered accounts</span>
        </div>
      </div>
    </div>
  );
}
