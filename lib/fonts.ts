import { Geist, Geist_Mono } from "next/font/google";

// Partagé entre les deux root layouts (site public et admin) pour ne
// charger les polices qu'une seule fois.
export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
