import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SerwistProvider } from "./serwist";

export const metadata: Metadata = {
  applicationName: "Personal Work Shift",
  title: {
    default: "Personal Work Shift",
    template: "%s | Personal Work Shift",
  },
  description:
    "Calendario familiar para gestionar turnos, estudios y eventos recurrentes.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Personal Work Shift",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#f6efe3",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body>
        <SerwistProvider swUrl="/serwist/sw.js">{children}</SerwistProvider>
      </body>
    </html>
  );
}
