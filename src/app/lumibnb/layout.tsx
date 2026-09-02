import type { Metadata } from "next";

const DESCRIPTION =
  "Lumibnb aide les hôtes Airbnb à obtenir plus de réservations : analyse IA de vos photos d'annonce, retouche en un clic et vidéo prête pour Instagram et TikTok — à partir de vos propres photos.";

export const metadata: Metadata = {
  title: {
    default: "Lumibnb — Des photos qui font réserver",
    template: "%s · Lumibnb",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Lumibnb",
    title: "Lumibnb — Des photos qui font réserver",
    description: DESCRIPTION,
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumibnb — Des photos qui font réserver",
    description: DESCRIPTION,
  },
};

export default function LumibnbLayout({ children }: LayoutProps<"/lumibnb">) {
  return children;
}
