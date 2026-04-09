import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Personal Work Shift",
    short_name: "Work Shift",
    description:
      "Calendario familiar para gestionar turnos, estudios y eventos recurrentes.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf6ef",
    theme_color: "#f6efe3",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/pwa-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icons/pwa-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
