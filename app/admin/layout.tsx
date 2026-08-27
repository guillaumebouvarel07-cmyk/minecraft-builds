import type { Metadata } from "next";

// S'applique à toutes les routes /admin/* : jamais indexées, quel que soit
// le statut de connexion.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
