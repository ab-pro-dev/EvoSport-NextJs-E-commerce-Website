import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <DashboardSkeleton />
    </div>
  );
}
