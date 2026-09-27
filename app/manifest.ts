import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Prenotly — Ordina e prenota",
    short_name: "Prenotly",
    description: "Ordina e prenota su WhatsApp, anche quando sei chiuso.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#25D366",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
