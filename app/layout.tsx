import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { ClickProvider } from "./components/click/ClickProvider";
import { SoundToggle } from "./components/click/SoundToggle";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { DarkModeToggle } from "./components/theme/DarkModeToggle";
import { Particles } from "./components/background/Particles";
import { BrandTitle } from "./components/ui/BrandTitle";

export const metadata: Metadata = {
  title: "내 손안의 AI 체력 코치",
  description: "학생 건강체력평가(PAPS) 기준표에 따른 자동 등급 산출 및 맞춤 추천 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <ClickProvider>
            <div className="min-h-screen bg-mesh-neon-light dark:bg-mesh-neon relative">
            {/* 파티클 배경 */}
            <Particles />
            
            {/* glow blobs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
              <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl animate-glow" />
              <div className="absolute top-24 right-[-120px] h-96 w-96 rounded-full bg-fuchsia-500/15 blur-3xl animate-glow" />
              <div className="absolute bottom-[-140px] left-[35%] h-[28rem] w-[28rem] rounded-full bg-blue-500/15 blur-3xl animate-glow" />
            </div>

            <header className="sticky top-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                <Link href="/" className="group inline-flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-fuchsia-600 shadow-neon" />
                  <div>
                    <div className="text-lg font-extrabold text-gradient leading-tight">
                      <BrandTitle />
                    </div>
                    <div className="text-xs text-fg-muted group-hover:text-fg transition-colors">
                      PAPS 자동 등급 · 맞춤 추천
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-4">
                  <div className="text-xs text-fg-subtle">
                    건강하게, 똑똑하게, 꾸준하게
                  </div>
                  <DarkModeToggle />
                  <SoundToggle />
                </div>
              </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              {children}
            </main>
          </div>
        </ClickProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
