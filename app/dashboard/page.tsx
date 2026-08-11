import { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Package, Heart, DollarSign, Award, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Dashboard Overview | EvoSport",
  description: "Overview of your orders, wishlist, and spending on EvoSport.",
};

export default async function DashboardOverviewPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  // Query real data from DB concurrently
  const [totalOrders, wishlistCount, totalSpentAgg, recentOrders] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.wishlistItem.count({ where: { userId } }),
    prisma.order.aggregate({
      where: { userId, status: "PAID" },
      _sum: { total: true },
    }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: { select: { name: true, slug: true } },
              },
            },
          },
        },
      },
    }),
  ]);

  const totalSpent = totalSpentAgg._sum.total ? Number(totalSpentAgg._sum.total) : 0;

  // Placeholder reward points (rewards system not built yet)
  const rewardPointsPlaceholder = 500;

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "US";

  return (
    <div className="space-y-8">
      {/* Profile Header Banner */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#B8FF00] text-[#0F1B2D] font-black text-xl shadow-sm">
            {userInitials}
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase text-[#0F1B2D]">
              Welcome Back, {session?.user?.name || "Athlete"}!
            </h1>
            <p className="text-xs text-[#0F1B2D]/40 mt-0.5">{session?.user?.email}</p>
          </div>
        </div>

        <Badge className="bg-[#B8FF00]/10 border-[#B8FF00]/30 text-[#0F1B2D] font-bold text-xs uppercase px-3 py-1">
          PRO ATHLETE MEMBER
        </Badge>
      </div>

      {/* 4 Stat Tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stat 1: Total Orders */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/50">Total Orders</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F4F8FC] text-[#B8FF00]">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-[#0F1B2D]">{totalOrders}</div>
          <div className="mt-1 text-[10px] text-[#0F1B2D]/40">Orders placed to date</div>
        </div>

        {/* Stat 2: Wishlist Items */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/50">Wishlist Items</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F4F8FC] text-[#B8FF00]">
              <Heart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-[#0F1B2D]">{wishlistCount}</div>
          <div className="mt-1 text-[10px] text-[#0F1B2D]/40">Saved items</div>
        </div>

        {/* Stat 3: Total Spent */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/50">Total Spent</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F4F8FC] text-[#B8FF00]">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-[#B8FF00]">${totalSpent.toFixed(2)}</div>
          <div className="mt-1 text-[10px] text-[#0F1B2D]/40">Lifetime completed purchases</div>
        </div>

        {/* Stat 4: Reward Points (Placeholder) */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/50">Reward Points</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F4F8FC] text-[#B8FF00]">
              <Award className="h-4 w-4" />
            </div>
          </div>
          {/* Static placeholder for now - rewards system not built yet */}
          <div className="mt-3 text-2xl font-black text-[#0F1B2D]">{rewardPointsPlaceholder} PTS</div>
          <div className="mt-1 text-[10px] text-[#0F1B2D]/40">Available member points</div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className="text-lg font-black uppercase text-[#0F1B2D]">RECENT ORDERS</h2>
          <Link href="/dashboard/orders" className="text-xs text-[#0F1B2D]/40 hover:text-[#5B8DEF] font-medium transition-colors">
            View All Orders &rarr;
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order) => {
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

              return (
                <div key={order.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0F1B2D]">#{order.id.slice(-8).toUpperCase()}</span>
                      <Badge
                        className={
                          order.status === "PAID"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px] uppercase font-bold"
                            : "bg-amber-50 text-amber-600 border-amber-200 text-[10px] uppercase font-bold"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-[#0F1B2D]/50">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })} • {itemCount} {itemCount === 1 ? "item" : "items"}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-sm font-black text-[#B8FF00]">${Number(order.total).toFixed(2)}</span>
                    <Link
                      href={`/checkout/confirmation/${order.id}`}
                      className="flex items-center gap-1 text-xs font-bold text-[#0F1B2D]/40 hover:text-[#5B8DEF] transition-colors"
                    >
                      <span>Details</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[#0F1B2D]/40">
            No orders found yet. Start shopping to view your orders here!
          </div>
        )}
      </div>
    </div>
  );
}
