import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Personal Work Shift",
    short_name: "Work Shift",
    description:
      "Calendario familiar para gestionar turnos, estudios y eventos recurrentes.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fbf6ef",
    theme_color: "#f6efe3",
    orientation: "portrait",
    categories: ["productivity", "lifestyle"],
    icons: [
      {
        src: "/icons/pwa-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icons/pwa-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable any",
      },
    ],
  };
}
