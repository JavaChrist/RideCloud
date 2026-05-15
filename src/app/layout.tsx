import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RideCloud",
  description: "SaaS français pour le suivi de vie et l'entretien des véhicules.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/favicon.ico" },
      { url: "/icons/logo32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/logo192.png", sizes: "192x192", type: "image/png" }
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/icons/favicon.ico"]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RideCloud"
  }
};

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
  viewportFit: "cover"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body className={plusJakartaSans.className}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
