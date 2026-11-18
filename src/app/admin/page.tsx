import Link from "next/link";
import { focusRing } from "@/components/admin/styles";
import { requireAdmin } from "@/server/auth/require-admin";
import { getAdminDashboard } from "@/server/dal/admin/get-admin-dashboard";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  await requireAdmin();
  const { projects, skills, experience, education, socialLinks, profile } = await getAdminDashboard();

  const cards = [
    { label: "Proyectos", count: projects, href: "/admin/proyectos" },
    { label: "Skills", count: skills, href: "/admin/skills" },
    { label: "Experiencia", count: experience, href: "/admin/experiencia" },
    { label: "Formación", count: education, href: "/admin/formacion" },
    { label: "Redes", count: socialLinks, href: "/admin/redes" },
  ];

  return (
    <>
      <p className="font-mono text-xs uppercase tracking-widest text-accent-text">Panel</p>
      <h1 className="mt-2 font-display text-h1">Resumen</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`border border-rule bg-surface-raised p-5 ${focusRing}`}
          >
            <span className="text-sm text-fg-muted">{card.label}</span>
            <strong className="mt-3 block font-display text-4xl">{card.count}</strong>
          </Link>
        ))}
      </div>
      <p className="mt-8">
        Portafolio: {profile?.isPublished ? "Publicado" : "Sin publicar"} ·{" "}
        <Link className="text-accent-text underline" href="/admin/perfil">
          Gestionar perfil
        </Link>{" "}
        ·{" "}
        <Link className="text-accent-text underline" href="/" target="_blank">
          Abrir web
        </Link>
      </p>
    </>
  );
}
