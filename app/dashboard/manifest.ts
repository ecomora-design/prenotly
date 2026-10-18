import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Prenotly Dashboard",
    short_name: "Prenotly Biz",
    description: "Gestisci il tuo ristorante: ordini, prenotazioni e tavoli.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#FAFAFA",
    theme_color: "#0F172A",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
