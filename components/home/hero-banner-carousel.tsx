"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Flame, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface HomepageBannerData {
  id: string;
  headline: string;
  subtext: string;
  badgeText: string | null;
  ctaText: string;
  ctaLink: string;
  backgroundImageUrl: string | null;
  backgroundBlur?: number;
  lightModeOverlayOpacity?: number;
  darkModeOverlayOpacity?: number;
  displayDurationSeconds?: number;
  order: number;
}

interface HeroBannerCarouselProps {
  banners: HomepageBannerData[];
}

const DEFAULT_BANNER: HomepageBannerData = {
  id: "default-fallback",
  headline: "ENGINEER YOUR LIMITLESS POTENTIAL",
  subtext: "Discover precision carbon running shoes, thermal compression apparel, and endurance hydration systems designed for professional athletes.",
  badgeText: "NEW 2026 PRO COLLECTION RELEASED",
  ctaText: "EXPLORE ALL GEAR",
  ctaLink: "/shop",
  backgroundImageUrl: null,
  backgroundBlur: 0,
  lightModeOverlayOpacity: 80,
  darkModeOverlayOpacity: 85,
  displayDurationSeconds: 5,
  order: 0,
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 1,
  }),
  center: {
    x: "0%",
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 1,
  }),
};

export function HeroBannerCarousel({ banners }: HeroBannerCarouselProps) {
  const activeBanners = banners.length > 0 ? banners : [DEFAULT_BANNER];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const totalBanners = activeBanners.length;

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalBanners);
  }, [totalBanners]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalBanners) % totalBanners);
  }, [totalBanners]);

  const handleGoTo = (idx: number) => {
    if (idx === currentIndex) return;
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];
  const durationMs = Math.max(1, currentBanner.displayDurationSeconds ?? 5) * 1000;

  // Banner-specific auto-rotation: each banner stays static for its own configured displayDurationSeconds
  useEffect(() => {
    if (totalBanners <= 1 || isPaused) return;

    const timer = setTimeout(() => {
      handleNext();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [currentIndex, totalBanners, isPaused, handleNext, durationMs]);

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden border-b border-gray-200/80 dark:border-slate-800/80 bg-gradient-to-b from-[#EEF8F1] via-[#F4F8FC] to-white dark:from-[#0B182B] dark:via-[#090E17] dark:to-[#090E17] min-h-[calc(100vh-4rem)] flex items-center m-0 p-0 transition-colors duration-300"
    >
      {/* Soft Ambient Gradients & Glow Circles (Always visible as ambient background lighting) */}
      <div className="absolute top-1/4 left-10 h-80 w-80 rounded-full bg-[#B8FF00]/15 dark:bg-[#B8FF00]/10 blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/3 right-10 h-80 w-80 rounded-full bg-[#5B8DEF]/15 dark:bg-[#5B8DEF]/10 blur-3xl pointer-events-none z-0" />

      {/* Decorative Speed Lines */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-20 hidden lg:block z-0">
        <div className="absolute right-10 top-12 h-1 w-96 rotate-[-20deg] bg-gradient-to-r from-transparent via-[#B8FF00] to-[#5B8DEF]" />
        <div className="absolute right-32 top-36 h-0.5 w-64 rotate-[-20deg] bg-gradient-to-r from-transparent via-[#5B8DEF] to-[#B8FF00]" />
      </div>

      {/* Framer Motion AnimatePresence Slide Container */}
      <div className="relative w-full h-full flex items-center min-h-[calc(100vh-4rem)]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentBanner.id || currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "tween", duration: 0.5, ease: [0.32, 0.72, 0, 1] },
              opacity: { duration: 0.5 },
            }}
            className="absolute inset-0 w-full h-full flex items-center"
          >
            {/* Background Image Layer if present */}
            {currentBanner.backgroundImageUrl && (
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <Image
                  src={currentBanner.backgroundImageUrl}
                  alt={currentBanner.headline}
                  fill
                  priority
                  quality={100}
                  sizes="100vw"
                  className="object-cover object-center select-none"
                  style={{
                    filter:
                      currentBanner.backgroundBlur && currentBanner.backgroundBlur > 0
                        ? `blur(${currentBanner.backgroundBlur}px)`
                        : "none",
                  }}
                />
                {/* Light Mode Gradient Overlay driven by lightModeOverlayOpacity (0-100) */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/40 dark:hidden transition-opacity duration-300"
                  style={{
                    opacity: (currentBanner.lightModeOverlayOpacity ?? 80) / 100,
                  }}
                />
                {/* Dark Mode Gradient Overlay driven by darkModeOverlayOpacity (0-100) */}
                <div
                  className="absolute inset-0 hidden dark:block bg-gradient-to-r from-[#090E17]/95 via-[#090E17]/85 to-[#090E17]/50 transition-opacity duration-300"
                  style={{
                    opacity: (currentBanner.darkModeOverlayOpacity ?? 85) / 100,
                  }}
                />
              </div>
            )}

            {/* Banner Content Layer */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10 text-left py-12 sm:py-16 md:py-20">
              <div className="max-w-5xl space-y-4 sm:space-y-5">
                {/* Pill Badge */}
                {currentBanner.badgeText && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#B8FF00] bg-[#B8FF00]/20 dark:bg-[#B8FF00]/15 px-3.5 py-1 text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#0F1B2D] dark:text-[#B8FF00]">
                    <Flame className="h-3.5 w-3.5 text-[#0F1B2D] dark:text-[#B8FF00]" />
                    <span>{currentBanner.badgeText}</span>
                  </div>
                )}

                {/* Dynamic Headline */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[4.25rem] font-black uppercase tracking-tight text-[#0F1B2D] dark:text-white leading-[1.08] sm:leading-[1.04]">
                  {currentBanner.headline}
                </h1>

                {/* Subtext */}
                <p className="text-sm sm:text-base md:text-lg text-[#0F1B2D]/75 dark:text-slate-300 max-w-2xl leading-relaxed font-medium">
                  {currentBanner.subtext}
                </p>

                {/* CTA Button */}
                <div className="pt-2">
                  <Link href={currentBanner.ctaLink || "/shop"}>
                    <button className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#B8FF00] px-7 sm:px-9 py-3.5 sm:py-4 text-xs sm:text-sm font-black uppercase tracking-wider text-[#0F1B2D] hover:bg-[#a8ef00] transition-all shadow-lg shadow-[#B8FF00]/25 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer">
                      <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>{currentBanner.ctaText || "EXPLORE ALL GEAR"}</span>
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Carousel Controls (Shown only if more than 1 banner exists) */}
      {totalBanners > 1 && (
        <>
          {/* Navigation Arrows */}
          <div className="absolute right-6 bottom-8 z-20 flex items-center gap-2">
            <button
              onClick={handlePrev}
              aria-label="Previous banner slide"
              className="p-2 rounded-full border border-gray-300/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 hover:bg-[#B8FF00] hover:text-[#0F1B2D] hover:border-[#B8FF00] text-[#0F1B2D] dark:text-white backdrop-blur-sm transition-all shadow-sm cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next banner slide"
              className="p-2 rounded-full border border-gray-300/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 hover:bg-[#B8FF00] hover:text-[#0F1B2D] hover:border-[#B8FF00] text-[#0F1B2D] dark:text-white backdrop-blur-sm transition-all shadow-sm cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Bottom Slide Indicator Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {activeBanners.map((b, idx) => (
              <button
                key={b.id || idx}
                onClick={() => handleGoTo(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? "w-7 h-2 bg-[#B8FF00] shadow-sm shadow-[#B8FF00]/50"
                    : "w-2 h-2 bg-gray-300 dark:bg-slate-700 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
