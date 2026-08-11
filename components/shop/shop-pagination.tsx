"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShopPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function ShopPagination({ currentPage, totalPages }: ShopPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage <= 1}
        onClick={() => goToPage(currentPage - 1)}
        className="h-9 w-9 border-gray-200 bg-white text-[#0F1B2D]/50 hover:bg-gray-50 hover:text-[#0F1B2D] disabled:opacity-40 rounded-lg"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "outline"}
          onClick={() => goToPage(page)}
          className={
            page === currentPage
              ? "h-9 w-9 bg-[#B8FF00] font-black text-[#0F1B2D] hover:bg-[#a8ef00] rounded-lg"
              : "h-9 w-9 border-gray-200 bg-white text-[#0F1B2D]/50 hover:bg-gray-50 hover:text-[#0F1B2D] rounded-lg font-bold text-xs"
          }
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outline"
        size="icon"
        disabled={currentPage >= totalPages}
        onClick={() => goToPage(currentPage + 1)}
        className="h-9 w-9 border-gray-200 bg-white text-[#0F1B2D]/50 hover:bg-gray-50 hover:text-[#0F1B2D] disabled:opacity-40 rounded-lg"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
