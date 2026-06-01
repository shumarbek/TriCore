import { AIConfigProvider } from "@/contexts/AIConfigProvider";
import { AuthProvider } from "@/contexts/AuthProvider";
import { LanguageProvider } from "@/contexts/LanguageProvider";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "TriCore — AI-Powered STEM Learning Platform",
  description:
    "Master Mathematics, Physics, and Chemistry from beginner to professional level with AI-powered structured learning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="dark">
      <body
        className="antialiased min-h-screen"
        style={
          {
            "--font-geist-sans": '"Segoe UI", system-ui, sans-serif',
            "--font-geist-mono": '"Cascadia Code", "SFMono-Regular", Consolas, monospace',
          } as CSSProperties
        }
      >
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <AIConfigProvider>{children}</AIConfigProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
