import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://evo-sport.vercel.app"),
  title: {
    default: "EvoSport | High-Performance Athletic Apparel & Gear",
    template: "%s | EvoSport",
  },
  description: "Engineer your athletic potential with pro-grade footwear, apparel, and endurance equipment.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-[#B8FF00] selection:text-[#0F1B2D]">
        <NextTopLoader color="#B8FF00" showSpinner={false} height={3} crawl={true} />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <SessionProvider>
            <SmoothScrollProvider>
              <SiteHeader />
              {children}
              <SiteFooter />
              <Toaster
                position="top-right"
                toastOptions={{
                  className: "dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800 bg-white text-[#0F1B2D] border-gray-200 shadow-lg rounded-2xl",
                }}
              />
            </SmoothScrollProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
