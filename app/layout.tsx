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
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://data-dump-generator.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Piper Dump Generator",
    template: "%s | Piper Dump Generator",
  },
  description:
    "No manual column-by-column setup: tune presets and relationships, generate schema plus seed data in the browser, then export PostgreSQL, MySQL, SQLite, or MongoDB dumps for testing and prototyping.",

  applicationName: "Piper Dump Generator",
  keywords: [
    // Core
    "database dump generator",
    "database schema generator",
    "seed data generator",
    "test data generator",
    "fake data generator database",
    "mock database data",

    // SQL / relational
    "postgres seed data",
    "postgresql dump generator",
    "mysql dump generator",
    "sqlite seed data",
    "sql insert generator",
    "sql test data generator",

    // NoSQL
    "mongodb seed data",
    "mongodb dataset generator",
    "nosql data generator",

    // Use cases
    "generate test database",
    "database for development",
    "database prototyping tool",
    "mock backend data",
    "sample database generator",

    // Technical intent
    "relational data generator",
    "database relationships generator",
    "schema with foreign keys generator",
    "many to many data generator",
    "composite key test data",

    // Branding
    "piper",
    "piper dump generator",
  ],
  authors: [{ name: "Adam - The Developer" }],
  creator: "Adam - The Developer",
  publisher: "Piper",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Piper Dump Generator — Schema & Seed Data Generator",
    description:
      "Simpler than tools that make you define every column yourself—configure relationships, generate, and export PostgreSQL, MySQL, SQLite, or MongoDB dumps from the browser.",
    url: "/",
    siteName: "Piper Dump Generator",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Piper Dump Generator — Database Schema & Seed Data",
    description:
      "Preset-driven schema and seed data: adjust relationships, generate, export SQL or Mongo—no spreadsheet-style column editing.",
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
