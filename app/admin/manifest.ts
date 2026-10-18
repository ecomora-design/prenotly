import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Prenotly Admin",
    short_name: "Prenotly Admin",
    description: "Pannello di controllo super admin.",
    start_url: "/admin",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#25D366",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
