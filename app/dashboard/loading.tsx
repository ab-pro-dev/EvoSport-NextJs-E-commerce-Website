import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#F4F8FC] text-[#0F1B2D] p-6">
      <DashboardSkeleton />
    </div>
  );
}
