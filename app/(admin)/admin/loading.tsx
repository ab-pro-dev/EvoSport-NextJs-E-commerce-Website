import { AdminTableSkeleton } from "@/components/skeletons/admin-table-skeleton";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-neutral-900 dark:text-white p-6 transition-colors">
      <AdminTableSkeleton rows={8} />
    </div>
  );
}
