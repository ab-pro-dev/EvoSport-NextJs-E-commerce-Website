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
      <body className="min-h-full flex flex-col bg-neutral-950 text-white selection:bg-[#CCFF00] selection:text-black">
        <NextTopLoader color="#CCFF00" showSpinner={false} height={3} crawl={true} />
        <SessionProvider>
          <SmoothScrollProvider>
            <SiteHeader />
            {children}
            <Toaster
              position="top-right"
              theme="dark"
              toastOptions={{
                style: {
                  background: "#0a0a0a",
                  color: "#ffffff",
                  border: "1px solid #262626",
                  fontSize: "13px",
                  fontWeight: "600",
                },
              }}
            />
          </SmoothScrollProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
