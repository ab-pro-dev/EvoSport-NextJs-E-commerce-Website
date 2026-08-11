import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { SiteHeader } from "@/components/navigation/site-header";
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F4F8FC] text-[#0F1B2D] selection:bg-[#B8FF00] selection:text-[#0F1B2D]">
        <NextTopLoader color="#B8FF00" showSpinner={false} height={3} crawl={true} />
        <SessionProvider>
          <SmoothScrollProvider>
            <SiteHeader />
            {children}
            <Toaster
              position="top-right"
              theme="light"
              toastOptions={{
                style: {
                  background: "#ffffff",
                  color: "#0F1B2D",
                  border: "1px solid #e5e7eb",
                  fontSize: "13px",
                  fontWeight: "600",
                  borderRadius: "16px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
                },
              }}
            />
          </SmoothScrollProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
