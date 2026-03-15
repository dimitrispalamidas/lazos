import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Λάζος - Διαχείριση Έργων",
    short_name: "Λάζος",
    description: "Εφαρμογή διαχείρισης έργων τοιχοποιίας",
    start_url: "/app",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#2563eb",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/λαζοσ-removebg-preview.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/λαζοσ-removebg-preview.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/λαζοσ-removebg-preview.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
