import type { Metadata } from "next";

import { ConsentGate } from "@/components/analytics/ConsentGate";
import { CookieConsentBanner } from "@/components/analytics/CookieConsentBanner";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { geistMono, geistSans } from "@/lib/fonts";
import { getSiteUrl } from "@/lib/seo";
import { site } from "@/lib/site";
import "@/app/globals.css";

const defaultTitle = `${site.name} — ${site.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: site.name,
  title: {
    default: defaultTitle,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    title: defaultTitle,
    description: site.description,
  },
  twitter: {
    card: "summary",
    title: defaultTitle,
    description: site.description,
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Vercel donne VERCEL_ENV=production/preview/development, plus précis que
// NODE_ENV (toujours "production" au build, y compris pour les preview
// deployments) — sans ça, chaque PR/preview polluerait la vraie propriété
// GA4. En dehors de Vercel (dev local), on retombe sur NODE_ENV.
const isProductionDeployment = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === "production"
  : process.env.NODE_ENV === "production";

export default function SiteRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col font-sans`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieConsentBanner />
      </body>
      <ConsentGate gaId={gaMeasurementId} enabled={isProductionDeployment} />
    </html>
  );
}
