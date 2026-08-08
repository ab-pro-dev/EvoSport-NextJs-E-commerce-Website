import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    select: { role: true },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    redirect("/admin-login");
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* Admin Top Banner / Navbar */}
      <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-rose-600 font-black text-xs text-white">
            A
          </div>
          <div>
            <span className="text-sm font-black italic tracking-tighter text-white">
              EVO<span className="text-rose-500">SPORT</span>
            </span>
            <span className="ml-2 rounded border border-rose-900 bg-rose-950 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-400">
              ADMIN CONTROL PANEL
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="text-neutral-400">Logged in as <strong className="text-white">{session.user.email}</strong></span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">{children}</main>
    </div>
  );
}
