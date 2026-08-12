import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Bell } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/admin-login");
  }

  // Fetch real user from DB to verify ADMIN role
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true, email: true, image: true },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    redirect("/admin-login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-neutral-900 dark:text-white flex flex-col selection:bg-rose-600 selection:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 h-16 border-b border-gray-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 font-black text-sm text-white shadow-sm">
            A
          </div>
          <div>
            <span className="text-base font-black italic tracking-tighter text-neutral-900 dark:text-white">
              EVO<span className="text-rose-500">SPORT</span>
            </span>
            <span className="ml-2 rounded border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              ADMIN CONTROL PANEL
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle variant="admin" />

          <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors shadow-sm">
            <Bell className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2.5 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 px-3 py-1.5 shadow-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white">
              {dbUser.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="text-left leading-none">
              <p className="text-xs font-bold text-neutral-900 dark:text-white">{dbUser.name}</p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">{dbUser.email}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar + Main Content Layout */}
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
