import type { Metadata } from "next";
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const DESCRIPTION =
  "Nexora AI déploie des agents IA autonomes qui répondent au téléphone, qualifient vos leads, gèrent vos réseaux sociaux et automatisent vos process 24/7.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Nexora AI — Vos agents IA autonomes",
  description: DESCRIPTION,
  applicationName: "Nexora AI",
  keywords: [
    "agents IA",
    "automatisation PME",
    "qualification de leads",
    "IA téléphonique",
    "génération de contenu",
  ],
  openGraph: {
    type: "website",
    siteName: "Nexora AI",
    title: "Nexora AI — Vos agents IA autonomes",
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexora AI — Vos agents IA autonomes",
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
