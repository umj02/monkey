import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SoundSystemProvider } from "@/components/sound-system-provider";

export const metadata: Metadata = {
  title: "Monkey Checks",
  description: "Organizá tu día, tus recordatorios y tu dinero.",
  // Manifest file remains available in /public, but it is not auto-linked here
  // because protected Vercel preview deployments return 401 on browser manifest fetches.
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/images/monkey-face.png",
  },
  appleWebApp: {
    capable: true,
    title: "Monkey Checks",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#22C55E",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body><SoundSystemProvider>{children}</SoundSystemProvider></body>
    </html>
  );
}
