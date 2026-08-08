"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Ban, CheckCircle2, ArrowRight, Search, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CustomerItem {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isBanned: boolean;
  ordersCount: number;
  reviewsCount: number;
  totalSpent: number;
  createdAt: string;
}

interface CustomersListViewProps {
  initialCustomers: CustomerItem[];
}

export function CustomersListView({ initialCustomers }: CustomersListViewProps) {
  const [customers, setCustomers] = useState<CustomerItem[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleBan = async (id: string, currentStatus: boolean, name: string) => {
    const actionText = currentStatus ? "un-suspend" : "suspend";
    if (!confirm(`Are you sure you want to ${actionText} customer "${name}"?`)) return;

    try {
      setTogglingId(id);
      const res = await fetch(`/api/admin/customers/${id}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: !currentStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update ban status.");
        setTogglingId(null);
        return;
      }

      setCustomers(
        customers.map((c) => (c.id === id ? { ...c, isBanned: data.user.isBanned } : c))
      );
    } catch (err) {
      console.error("Error toggling customer ban:", err);
      alert("Failed to update ban status.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-rose-500" />
            CUSTOMER MANAGEMENT
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            View registered customer profiles, track total order spending, and manage account suspensions.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800">
        <div className="relative w-full sm:w-80">
          <Input
            placeholder="Search customer name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-neutral-950 border-neutral-800 text-xs text-white pl-9"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-800 bg-neutral-950/80 text-[10px] font-black uppercase text-neutral-400">
              <tr>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Orders</th>
                <th className="py-3.5 px-4">Total Spent</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-neutral-500 italic">
                    No customer accounts found matching search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const joinedDate = new Date(c.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <tr key={c.id} className="hover:bg-neutral-900/90 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-rose-600/20 text-rose-400 border border-rose-900/40 flex items-center justify-center font-black text-xs shrink-0">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs">{c.name}</p>
                            <p className="text-[10px] text-neutral-400">{c.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-white">{c.ordersCount} orders</td>

                      <td className="py-3.5 px-4 font-bold text-emerald-400">${c.totalSpent.toFixed(2)}</td>

                      <td className="py-3.5 px-4 text-neutral-400 font-medium">{joinedDate}</td>

                      <td className="py-3.5 px-4">
                        {c.isBanned ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-950/80 text-rose-400 border border-rose-800">
                            <ShieldAlert className="h-3 w-3" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleToggleBan(c.id, c.isBanned, c.name)}
                            disabled={togglingId === c.id}
                            className={`text-xs font-bold transition-colors ${
                              c.isBanned ? "text-emerald-400 hover:underline" : "text-rose-400 hover:underline"
                            }`}
                          >
                            {c.isBanned ? "Unsuspend" : "Suspend"}
                          </button>
                          <Link
                            href={`/admin/customers/${c.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-white"
                          >
                            <span>Detail</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
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
