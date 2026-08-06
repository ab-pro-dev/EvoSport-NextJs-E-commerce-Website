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
        className="border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-lime-400 disabled:opacity-40"
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
              ? "bg-lime-500 font-bold text-black hover:bg-lime-400"
              : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-lime-400"
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
        className="border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-lime-400 disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
