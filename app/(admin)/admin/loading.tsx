import { AdminTableSkeleton } from "@/components/skeletons/admin-table-skeleton";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <AdminTableSkeleton rows={8} />
    </div>
  );
}
