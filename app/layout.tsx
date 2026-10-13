import "./globals.css";
import { Inter } from "next/font/google";
import CookieBanner from "@/components/CookieBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Prenotly — Tre software per ristoranti, beauty e attività su misura",
  description:
    "Prenotly Food per ristoranti (da €29,99/mese), Prenotly Beauty per parrucchieri e centri estetici (da €29,99/mese), Prenotly Service per software su misura. Prenotazioni e ordini automatici su WhatsApp.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Prenotly",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport = {
  themeColor: "#25D366",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={inter.className}>
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
