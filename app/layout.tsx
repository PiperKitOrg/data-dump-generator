import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://dump-generator.piperkit.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Piper Dump Generator",
    template: "%s | Piper Dump Generator",
  },
  description:
    "Generate realistic database schemas and production-like seed dumps for PostgreSQL, MySQL, SQLite, and MongoDB directly in your browser.",
  applicationName: "Piper Dump Generator",
  keywords: [
    "database dump generator",
    "postgres seed data",
    "mysql dump",
    "sqlite dump",
    "mongodb seed data",
    "schema generator",
    "piper",
  ],
  authors: [{ name: "Adam - The Developer" }],
  creator: "Adam - The Developer",
  publisher: "Piper",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Piper Dump Generator",
    description:
      "Browser-based schema and seed dump generator for PostgreSQL, MySQL, SQLite, and MongoDB.",
    url: "/",
    siteName: "Piper Dump Generator",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Piper Dump Generator",
    description:
      "Generate realistic schema and seed dumps in-browser for PostgreSQL, MySQL, SQLite, and MongoDB.",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
