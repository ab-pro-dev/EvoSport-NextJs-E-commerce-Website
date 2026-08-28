"use client";

import React from "react";
import { LayoutGrid, Shirt, Dumbbell, ShoppingBag, Watch, Users, Layers } from "lucide-react";

export function ShoeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3.5 14.5c.5-1 1.5-2 3-2.5 2-.5 4.5.5 6.5.5 3 0 5-2 6-4 .5 1.5 1.5 3.5 2.5 4.5.5.5.5 1.5 0 2-.8 1-2.5 1.5-4 1.5H5.5c-1 0-1.7-.6-2-1.5z" />
      <path d="M3.5 16.5h17c.5 0 1 .5 1 1s-.5 1-1 1H3.5c-.5 0-1-.5-1-1s.5-1 1-1z" />
      <path d="M7 12l2-3" />
      <path d="M10 12.5l1.5-2.5" />
    </svg>
  );
}

export function JerseyIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10a2 2 0 002 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
      <path d="M12 9v6" />
      <path d="M9.5 11h5" />
    </svg>
  );
}

export function BottleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 2h6v3H9z" />
      <path d="M10 5v2a2 2 0 01-.6 1.4L8 10v10a2 2 0 002 2h4a2 2 0 002-2V10l-1.4-1.6A2 2 0 0114 7V5" />
      <path d="M8 14h8" />
    </svg>
  );
}

export function getCategoryIcon(slug: string, className = "h-4 w-4") {
  switch (slug) {
    case "all":
    case "":
      return <LayoutGrid className={className} />;
    case "footwear":
      return <ShoeIcon className={className} />;
    case "apparel-parent":
    case "apparel":
      return <Shirt className={className} />;
    case "jerseys-teamwear":
      return <JerseyIcon className={className} />;
    case "gym-training":
      return <Dumbbell className={className} />;
    case "bags":
      return <ShoppingBag className={className} />;
    case "hydration":
      return <BottleIcon className={className} />;
    case "accessories-parent":
    case "accessories":
      return <Watch className={className} />;
    case "gender":
      return <Users className={className} />;
    default:
      return <Layers className={className} />;
  }
}
