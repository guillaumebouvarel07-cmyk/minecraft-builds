import type { Metadata } from "next";

import { geistMono, geistSans } from "@/lib/fonts";
import "@/app/globals.css";

/**
 * Root layout dédié à /admin/* : volontairement séparé du root layout du
 * site public (app/(site)/layout.tsx) pour ne jamais afficher le Header/
 * Footer public dans l'administration. Next.js autorise plusieurs root
 * layouts tant qu'un seul chemin y mène (ici /admin vs le reste du site).
 */
export const metadata: Metadata = {
  title: {
    default: "Administration",
    template: "%s · Administration",
  },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans`}>
        {children}
      </body>
    </html>
  );
}
