import type { Metadata } from "next";

import { SignalPage } from "@/components/signal/signal-page";
import { loadPortfolio } from "@/server/portfolio/load-portfolio";

/**
 * Portada estática con regeneración periódica.
 *
 * El plan gratuito (Vercel Hobby + Postgres con suspensión por inactividad)
 * penaliza renderizar en cada visita: arranque en frío de la base de datos,
 * invocaciones y horas de cómputo. La página se genera en build y se regenera
 * como mucho una vez al día; cuando exista el CRUD del dashboard, sus Server
 * Actions llamarán a revalidatePath("/") para publicar al instante.
 */
export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await loadPortfolio();

  if (!profile) {
    return {
      title: { absolute: "En compilación — foreverlcd.dev" },
      description: "El portfolio se está preparando.",
      robots: { index: false, follow: false },
    };
  }

  const title = `${profile.fullName.trim() || "Portfolio"} — foreverlcd.dev`;
  return {
    title: { absolute: title },
    description: profile.shortBio,
    alternates: { canonical: "/" },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "es_PE",
      siteName: "foreverlcd.dev",
      url: "/",
      title,
      description: profile.shortBio,
    },
    twitter: { card: "summary_large_image", title, description: profile.shortBio },
  };
}

export default async function Home() {
  const portfolio = await loadPortfolio();
  return <SignalPage portfolio={portfolio} />;
}
