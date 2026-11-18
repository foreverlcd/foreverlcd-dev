import Link from "next/link";
import { Badge } from "@/components/admin/badge";
import { PageHeader } from "@/components/admin/page-header";
import { focusRing, primaryButtonClass, secondaryButtonClass } from "@/components/admin/styles";
import { requireAdmin } from "@/server/auth/require-admin";
import { getAdminDashboard } from "@/server/dal/admin/get-admin-dashboard";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  await requireAdmin();
  const { projects, skills, experience, education, socialLinks, profile } = await getAdminDashboard();

  const linePanel = "rounded-[2px] border border-rule";
  const cards = [
    { label: "Proyectos", count: projects, href: "/admin/proyectos" },
    { label: "Skills", count: skills, href: "/admin/skills" },
    { label: "Experiencia", count: experience, href: "/admin/experiencia" },
    { label: "Formación", count: education, href: "/admin/formacion" },
    { label: "Redes", count: socialLinks, href: "/admin/redes" },
  ];

  return (
    <>
      <PageHeader
        index="01"
        label="Resumen"
        title="Resumen"
        state={profile?.isPublished ? "PORTFOLIO PUBLICADO" : "PORTFOLIO SIN PUBLICAR"}
      />
      <section className={`${linePanel} p-4 flex flex-wrap items-center gap-4`} aria-label="Estado del portfolio">
        <span className="font-mono text-xs uppercase tracking-widest text-fg-muted">Portfolio</span>
        <Badge tone={profile?.isPublished ? "signal" : "muted"}>
          {profile?.isPublished ? "Publicado" : "Sin publicar"}
        </Badge>
        <div className="flex flex-wrap gap-3 sm:ml-auto">
          {profile ? (
            <Link className={secondaryButtonClass} href="/admin/perfil">
              Gestionar perfil
            </Link>
          ) : (
            <Link className={primaryButtonClass} href="/admin/perfil">
              Completa tu perfil
            </Link>
          )}
          <Link className={secondaryButtonClass} href="/" target="_blank">
            Abrir web ↗
          </Link>
        </div>
      </section>
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {cards.map((card, index) => (
          <Link
            key={card.href}
            href={card.href}
            className={`${linePanel} p-5 hover:border-fg-muted ${focusRing} max-lg:last:odd:col-span-2`}
          >
            <span className="font-mono text-xs uppercase tracking-widest text-fg-muted">
              {String(index + 1).padStart(2, "0")} {card.label}
            </span>
            <strong className="mt-4 block font-mono text-5xl font-normal text-fg">
              {String(card.count).padStart(2, "0")}
            </strong>
          </Link>
        ))}
      </div>
    </>
  );
}
