"use client";

import { useEffect, ReactNode } from "react";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  useEffect(() => {
    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let isAnimating = false;
    let lastWheelTime = 0;

    const isMouseWheel = (e: WheelEvent) => {
      // 1. Two-finger trackpad panning (horizontal delta) => Trackpad
      if (Math.abs(e.deltaX) > 0) return false;

      const absY = Math.abs(e.deltaY);
      // 2. Discrete physical mouse wheel notches send integer multiples of 100/120 or deltaMode !== 0
      const isDiscreteStep = absY % 100 === 0 || absY % 120 === 0 || absY >= 100 || e.deltaMode !== 0;
      const timeSinceLast = performance.now() - lastWheelTime;

      // 3. High-frequency continuous subpixel events (<16ms apart with non-integer delta) => Trackpad inertia
      if (timeSinceLast < 16 && !isDiscreteStep && absY < 40 && !Number.isInteger(absY)) {
        return false;
      }

      return isDiscreteStep;
    };

    const onWheel = (e: WheelEvent) => {
      // Do NOT intercept if user is scrolling inside a nested scroll container (e.g. Admin tables, Cart list)
      const path = e.composedPath();
      for (const el of path) {
        if (el instanceof HTMLElement && el !== document.documentElement && el !== document.body) {
          const style = window.getComputedStyle(el);
          if ((style.overflowY === "auto" || style.overflowY === "scroll") && el.scrollHeight > el.clientHeight) {
            return;
          }
        }
      }

      if (!isMouseWheel(e)) {
        // Trackpad / Touch: let native browser scrolling handle it 100% untouched!
        return;
      }

      lastWheelTime = performance.now();
      e.preventDefault();

      targetY += e.deltaY * 1.2;
      targetY = Math.max(0, Math.min(targetY, document.documentElement.scrollHeight - window.innerHeight));

      if (!isAnimating) {
        isAnimating = true;
        currentY = window.scrollY;
        requestAnimationFrame(updateScroll);
      }
    };

    const updateScroll = () => {
      const diff = targetY - currentY;
      if (Math.abs(diff) < 0.5) {
        currentY = targetY;
        window.scrollTo(0, currentY);
        isAnimating = false;
        return;
      }

      currentY += diff * 0.15;
      window.scrollTo(0, currentY);
      requestAnimationFrame(updateScroll);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  return <>{children}</>;
}
