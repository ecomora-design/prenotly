import "./globals.css";
import { Inter } from "next/font/google";

import CookieBanner from "@/components/CookieBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Prenotly — Prenotazioni e ordini su WhatsApp",
  description:
    "Il software italiano per ristoranti, beauty e professionisti. Prenotazioni e ordini direttamente su WhatsApp.",
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
    <html lang="it" className={inter.className} data-scroll-behavior="smooth">
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
