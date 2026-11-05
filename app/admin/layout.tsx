import type { Metadata, Viewport } from "next";
import AdminLayoutInner from "./layout-inner";

export const metadata: Metadata = {
  title: "Prenotly Admin",
  manifest: "/admin/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Prenotly Admin",
  },
};

export const viewport: Viewport = {
  themeColor: "#25D366",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutInner>{children}</AdminLayoutInner>;
}
