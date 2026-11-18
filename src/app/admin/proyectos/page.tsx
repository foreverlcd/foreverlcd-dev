import Link from "next/link";
import { InlineForm } from "@/components/admin/inline-form";
import { MoveButtons } from "@/components/admin/move-buttons";
import { emptyStateClass, linkClass, panelClass, primaryButtonClass } from "@/components/admin/styles";
import {
  deleteProject,
  reorderProjects,
  setProjectFeatured,
  setProjectStatus,
} from "@/server/actions/projects";
import { requireAdmin } from "@/server/auth/require-admin";
import { getAdminProjects } from "@/server/dal/admin/get-admin-dashboard";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  await requireAdmin();
  const projects = await getAdminProjects();
  const ids = projects.map((project) => project.id);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-h1">Proyectos</h1>
        <Link className={primaryButtonClass} href="/admin/proyectos/nuevo">
          Nuevo proyecto
        </Link>
      </div>

      {projects.length === 0 && (
        <div className={emptyStateClass}>
          <p>Aún no hay proyectos.</p>
          <Link className={`${linkClass} mt-2 inline-block`} href="/admin/proyectos/nuevo">
            Crea el primero
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-3">
        {projects.map((project, index) => {
          const published = project.status === "PUBLISHED";
          return (
            <article key={project.id} className={panelClass}>
              <Link className={`font-medium ${linkClass}`} href={`/admin/proyectos/${project.id}`}>
                {project.title}
              </Link>
              <p className="text-sm text-fg-muted">
                {published ? "Publicado" : "Borrador"}
                {project.isFeatured ? " · Destacado" : ""}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <MoveButtons action={reorderProjects} ids={ids} index={index} />
                <InlineForm
                  action={setProjectStatus}
                  fields={{ id: project.id, status: published ? "DRAFT" : "PUBLISHED" }}
                  label={published ? "Pasar a borrador" : "Publicar"}
                />
                <InlineForm
                  action={setProjectFeatured}
                  fields={{ id: project.id, featured: String(!project.isFeatured) }}
                  label={project.isFeatured ? "Quitar destacado" : "Destacar"}
                />
                <InlineForm action={deleteProject} fields={{ id: project.id }} label="Eliminar" destructive />
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
