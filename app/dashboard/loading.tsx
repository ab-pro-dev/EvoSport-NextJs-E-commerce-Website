import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <DashboardSkeleton />
    </div>
  );
}
