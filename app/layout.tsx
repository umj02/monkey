import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monkey Checks",
  description: "Organizá tu día, tus recordatorios y tu dinero.",
  manifest: "/manifest.webmanifest",
  themeColor: "#22C55E",
  appleWebApp: {
    capable: true,
    title: "Monkey Checks",
    statusBarStyle: "default",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
