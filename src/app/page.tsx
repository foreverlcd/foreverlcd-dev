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

  return {
    title: { absolute: `${profile.fullName.trim() || "Portfolio"} — foreverlcd.dev` },
    description: profile.shortBio,
    robots: { index: true, follow: true },
  };
}

export default async function Home() {
  const portfolio = await loadPortfolio();
  return <SignalPage portfolio={portfolio} />;
}
