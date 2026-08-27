"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

interface AddToCartTooltipProps {
  show: boolean;
  message?: string;
}

export function AddToCartTooltip({ show, message = "Added to Cart!" }: AddToCartTooltipProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.95 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="absolute -top-11 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex items-center gap-1.5 rounded-lg bg-[#0F1B2D] text-[#B8FF00] dark:bg-white dark:text-[#0F1B2D] px-3 py-1.5 text-xs font-black shadow-xl shadow-black/20 whitespace-nowrap border border-gray-200/20"
        >
          <Check className="h-3.5 w-3.5 stroke-[3]" />
          <span>{message}</span>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0F1B2D] dark:bg-white rotate-45" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
