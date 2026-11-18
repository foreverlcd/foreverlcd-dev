import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/admin/action-form";
import { InlineForm } from "@/components/admin/inline-form";
import { MoveButtons } from "@/components/admin/move-buttons";
import { ProjectFields } from "@/components/admin/project-fields";
import { ProjectImageUpload } from "@/components/admin/project-image-upload";
import { emptyStateClass, inputClass, linkClass, panelClass } from "@/components/admin/styles";
import {
  deleteProject,
  deleteProjectImage,
  reorderProjectImages,
  saveProject,
  setProjectFeatured,
  setProjectStatus,
  updateProjectImageAlt,
} from "@/server/actions/projects";
import { requireAdmin } from "@/server/auth/require-admin";
import { getAdminProject, getAdminSkills } from "@/server/dal/admin/get-admin-dashboard";

export const dynamic = "force-dynamic";

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [project, { skills }] = await Promise.all([getAdminProject(id), getAdminSkills()]);
  if (!project) notFound();

  const skillOptions = skills.map((skill) => ({
    id: skill.id,
    name: skill.name,
    category: skill.category.name,
  }));
  const published = project.status === "PUBLISHED";
  const imageIds = project.images.map((image) => image.id);

  return (
    <>
      <Link href="/admin/proyectos" className={`text-sm ${linkClass}`}>
        ← Proyectos
      </Link>
      <h1 className="mt-4 font-display text-h1">Editar proyecto</h1>

      <section className="mt-6 flex flex-wrap items-center gap-3">
        <p className="text-sm text-fg-muted">
          {published ? "Publicado" : "Borrador"}
          {project.isFeatured ? " · Destacado" : ""}
        </p>
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
        {published && (
          <Link href={`/proyectos/${project.slug}`} target="_blank" className={`text-sm ${linkClass}`}>
            Ver en la web
          </Link>
        )}
        <InlineForm action={deleteProject} fields={{ id: project.id }} label="Eliminar" destructive />
      </section>

      <ActionForm action={saveProject} className="mt-8 grid max-w-3xl gap-4">
        <input type="hidden" name="id" value={project.id} />
        <ProjectFields project={project} skills={skillOptions} />
      </ActionForm>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Imágenes</h2>
        {project.images.length === 0 && (
          <p className={emptyStateClass}>Este proyecto aún no tiene imágenes. Sube la primera abajo.</p>
        )}
        <div className="mt-4 grid max-w-3xl gap-3">
          {project.images.map((image, index) => (
            <article key={image.id} className={panelClass}>
              <p className="text-sm text-fg-muted">
                {image.type === "COVER" ? "Portada" : "Galería"} · {image.width}×{image.height} ·{" "}
                <a href={image.secureUrl} target="_blank" rel="noreferrer" className={linkClass}>
                  Ver imagen
                </a>
              </p>
              <InlineForm
                action={updateProjectImageAlt}
                fields={{ id: image.id }}
                label="Guardar texto"
                className="mt-3 flex flex-wrap items-end gap-2"
              >
                <label className="grid flex-1 gap-1 text-sm">
                  Texto alternativo
                  <input required name="alt" defaultValue={image.alt} className={inputClass} />
                </label>
              </InlineForm>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <MoveButtons action={reorderProjectImages} ids={imageIds} index={index} />
                <InlineForm
                  action={deleteProjectImage}
                  fields={{ id: image.id }}
                  label="Eliminar"
                  destructive
                />
              </div>
            </article>
          ))}
        </div>
        <ProjectImageUpload projectId={project.id} nextOrder={project.images.length} />
      </section>
    </>
  );
}
