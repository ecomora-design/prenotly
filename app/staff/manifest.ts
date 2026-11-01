import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Prenotly Staff",
    short_name: "Staff",
    description: "Area operatore Prenotly: gestisci la tua agenda",
    start_url: "/staff/login",
    scope: "/staff/",
    display: "standalone",
    background_color: "#FAFAFA",
    theme_color: "#3B82F6",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
