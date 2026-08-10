import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-neutral-900 border border-neutral-800/50 shadow-inner",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
