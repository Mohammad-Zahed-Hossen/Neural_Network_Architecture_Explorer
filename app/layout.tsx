import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import PageTransition from "@/components/layout/page-transition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Neural Network Architecture Explorer",
  description: "An interactive, educational platform to inspect, compare, and animate classic neural network architectures (VGG16, ResNet50, DenseNet121) layer-by-layer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      style={{ backgroundColor: '#020612' }}
      suppressHydrationWarning
    >
      <body 
        className="min-h-full flex flex-col bg-background text-foreground relative" 
        style={{ backgroundColor: '#020612' }}
        suppressHydrationWarning
      >
        {/* Global Mesh Background Glow */}
        <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none overflow-hidden z-[-1] opacity-50">
          <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px] animate-glow-pulse" />
          <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[150px] animate-glow-pulse" style={{ animationDelay: '-2s' }} />
        </div>
        
        <Navbar />
        <main className="flex flex-1 flex-col overflow-x-hidden">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </body>
    </html>
  );
}
