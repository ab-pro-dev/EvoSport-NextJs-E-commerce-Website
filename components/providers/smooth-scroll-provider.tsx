"use client";

import { useEffect, ReactNode, useRef } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis v1.3.26 with researched options from official docs
    const lenis = new Lenis({
      autoRaf: true,
      smoothWheel: true,
      syncTouch: false, // Official docs: false by default, prevents hijacking touch/trackpad gestures
      allowNestedScroll: true, // Official docs: automatically detects nested scroll containers to scroll natively
      stopInertiaOnNavigate: true, // Official docs: stops scroll inertia when navigating internal links
      respectReducedMotion: true, // Official docs: honors prefers-reduced-motion media query
      anchors: true, // Official docs: handles anchor link smooth scrolling
      overscroll: true,
      autoResize: true,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      prevent: (node: HTMLElement) => {
        if (!node || typeof node.hasAttribute !== "function") return false;
        return (
          node.hasAttribute("data-lenis-prevent") ||
          node.hasAttribute("data-lenis-prevent-wheel") ||
          node.classList.contains("lenis-prevent")
        );
      },
      virtualScroll: ({ deltaX, deltaY, event }) => {
        if (event instanceof WheelEvent) {
          // 1. Pinch-to-zoom gestures (ctrlKey) -> let browser handle natively
          if (event.ctrlKey) return false;

          // 2. Horizontal two-finger trackpad pan -> let browser handle natively
          if (Math.abs(deltaX) > 0 && Math.abs(deltaX) >= Math.abs(deltaY)) {
            return false;
          }

          // 3. Trackpad vs Physical Mouse Wheel detection:
          // Physical mouse wheel notches emit discrete steps with deltaMode !== 0 or integer multiples of 100/120.
          // Trackpad continuous two-finger scrolling emits fluid sub-pixel non-integer deltas.
          const absY = Math.abs(deltaY);
          const isDiscreteMouseWheel =
            event.deltaMode !== 0 ||
            absY % 100 === 0 ||
            absY % 120 === 0 ||
            (Number.isInteger(absY) && absY >= 100);

          if (!isDiscreteMouseWheel && (absY < 50 || !Number.isInteger(absY))) {
            // Trackpad two-finger gesture: let browser handle native hardware-accelerated momentum
            return false;
          }
        }
        return true;
      },
    });

    lenisRef.current = lenis;

    // Optional: make accessible to window for debugging or programmatic scroll triggers
    if (typeof window !== "undefined") {
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    }

    return () => {
      lenis.destroy();
      lenisRef.current = null;
      if (typeof window !== "undefined") {
        delete (window as unknown as { __lenis?: Lenis }).__lenis;
      }
    };
  }, []);

  return <>{children}</>;
}
