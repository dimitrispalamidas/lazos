import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const LOGO_PATH = "/λαζοσ-removebg-preview.png";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "Λάζος - Διαχείριση Έργων",
  description: "Εφαρμογή διαχείρισης έργων τοιχοποιίας",
  icons: {
    icon: LOGO_PATH,
    apple: LOGO_PATH,
  },
  openGraph: {
    title: "Λάζος - Διαχείριση Έργων",
    description: "Εφαρμογή διαχείρισης έργων τοιχοποιίας",
    images: ["/a935090b-0ca7-4973-a141-31d4a1a25637.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Λάζος - Διαχείριση Έργων",
    description: "Εφαρμογή διαχείρισης έργων τοιχοποιίας",
    images: ["/a935090b-0ca7-4973-a141-31d4a1a25637.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Λάζος",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
