import { ActionForm } from "@/components/admin/action-form";
import { ProjectFields } from "@/components/admin/project-fields";
import { requireAdmin } from "@/server/auth/require-admin";
import { getAdminSkills } from "@/server/dal/admin/get-admin-dashboard";
import { saveProject } from "@/server/actions/projects";

export const dynamic = "force-dynamic";

export default async function NewProject() {
  await requireAdmin();
  const { skills } = await getAdminSkills();
  const skillOptions = skills.map((skill) => ({
    id: skill.id,
    name: skill.name,
    category: skill.category.name,
  }));

  return (
    <>
      <h1 className="font-display text-h1">Nuevo proyecto</h1>
      <p className="mt-3 text-fg-muted">
        Guarda el proyecto para poder subir sus imágenes desde la pantalla de edición.
      </p>
      <ActionForm
        action={saveProject}
        submitLabel="Crear proyecto"
        pendingLabel="Creando…"
        className="mt-8 grid max-w-3xl gap-4"
      >
        <ProjectFields skills={skillOptions} />
      </ActionForm>
    </>
  );
}
