import "@fontsource-variable/manrope";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "UGB Électricité — L’énergie de vos projets, la confiance en plus",
  description:
    "UGB Électricité : installation électrique, mise en conformité, éclairage intérieur et extérieur, dépannage et maintenance. Découvrez notre savoir-faire en 3D.",
  openGraph: {
    title: "UGB Électricité",
    description: "L’énergie de vos projets, la confiance en plus.",
    type: "website",
    locale: "fr_FR",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D1B3D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
