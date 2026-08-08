"use client";

import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Users, Layers } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
  };
  revenueOverTime: Array<{
    date: string;
    revenue: number;
    ordersCount: number;
  }>;
  salesByCategory: Array<{
    categoryName: string;
    revenue: number;
    itemsSold: number;
  }>;
  topCustomers: Array<{
    id: string;
    name: string;
    email: string;
    totalSpent: number;
    ordersCount: number;
  }>;
}

interface AnalyticsDashboardViewProps {
  data: AnalyticsData;
}

export function AnalyticsDashboardView({ data }: AnalyticsDashboardViewProps) {
  const { summary, revenueOverTime, salesByCategory, topCustomers } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-rose-500" />
            BUSINESS ANALYTICS
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real database aggregate metrics for revenue over time, sales breakdown by product category, and customer lifetime value.
          </p>
        </div>
      </div>

      {/* Real KPI Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Total Revenue</p>
            <DollarSign className="h-5 w-5 text-rose-500" />
          </div>
          <p className="text-3xl font-black text-white">${summary.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-neutral-500">Sum of all paid & completed orders</p>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Total Orders</p>
            <ShoppingBag className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-white">{summary.totalOrders}</p>
          <p className="text-[10px] text-neutral-500">Verified paid database order records</p>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Average Order Value (AOV)</p>
            <TrendingUp className="h-5 w-5 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-white">${summary.averageOrderValue.toFixed(2)}</p>
          <p className="text-[10px] text-neutral-500">Revenue divided by completed orders</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Over Time Chart */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
          <div>
            <h2 className="text-sm font-black uppercase text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-rose-500" />
              REVENUE OVER TIME
            </h2>
            <p className="text-[11px] text-neutral-500">Daily sales revenue totals from real order transactions</p>
          </div>

          <div className="h-64 w-full">
            {revenueOverTime.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-neutral-500 italic">
                No revenue data recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueOverTime}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="date" stroke="#737373" fontSize={10} />
                  <YAxis stroke="#737373" fontSize={10} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#171717", borderColor: "#262626", borderRadius: "8px" }}
                    itemStyle={{ color: "#f43f5e", fontWeight: "bold", fontSize: "12px" }}
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#e11d48" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Sales by Category Chart */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
          <div>
            <h2 className="text-sm font-black uppercase text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              SALES BY CATEGORY
            </h2>
            <p className="text-[11px] text-neutral-500">Revenue generated per product category</p>
          </div>

          <div className="h-64 w-full">
            {salesByCategory.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-neutral-500 italic">
                No category sales recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="categoryName" stroke="#737373" fontSize={10} />
                  <YAxis stroke="#737373" fontSize={10} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#171717", borderColor: "#262626", borderRadius: "8px" }}
                    itemStyle={{ color: "#34d399", fontWeight: "bold", fontSize: "12px" }}
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Top Customers Table */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
        <h2 className="text-sm font-black uppercase text-white flex items-center gap-2">
          <Users className="h-4 w-4 text-rose-500" />
          TOP CUSTOMERS BY SPEND
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-800 bg-neutral-950/80 text-[10px] font-black uppercase text-neutral-400">
              <tr>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Orders Count</th>
                <th className="py-3.5 px-4 text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
              {topCustomers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-neutral-500 italic">
                    No customer purchase records found.
                  </td>
                </tr>
              ) : (
                topCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-900/90 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{c.name}</td>
                    <td className="py-3.5 px-4 text-neutral-400">{c.email}</td>
                    <td className="py-3.5 px-4 font-bold text-white">{c.ordersCount} orders</td>
                    <td className="py-3.5 px-4 text-right font-black text-rose-400">${c.totalSpent.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
