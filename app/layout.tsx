import "./globals.css";
import { Inter } from "next/font/google";

import CookieBanner from "@/components/CookieBanner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata = {
  metadataBase: new URL("https://www.prenotly-italia.it"),
  title: "Prenotly — Prenotazioni e ordini su App",
  description:
    "Il software italiano per ristoranti, servizi e professionisti. Prenotazioni e ordini direttamente su App.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Prenotly",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  verification: {
    google: "7j6OujpQqD7M_fsCKwRm3gOgNo1U2xCeHNYFMfsOPgk",
  },
};

export const viewport = {
  themeColor: "#25D366",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={`${inter.variable} ${inter.className}`} data-scroll-behavior="smooth">
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
