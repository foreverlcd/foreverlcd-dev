import { Badge } from "@/components/admin/badge";
import { PageHeader } from "@/components/admin/page-header";
import { ActionForm } from "@/components/admin/action-form";
import { CheckField, SelectField, TextField } from "@/components/admin/fields";
import { InlineForm } from "@/components/admin/inline-form";
import { MoveButtons } from "@/components/admin/move-buttons";
import { emptyStateClass, formPanelClass, panelClass } from "@/components/admin/styles";
import {
  deleteCategory,
  deleteSkill,
  reorderSkills,
  saveCategory,
  saveSkill,
} from "@/server/actions/skills";
import { reorderTimeline, setItemActive } from "@/server/actions/timeline";
import { requireAdmin } from "@/server/auth/require-admin";
import { getAdminSkills } from "@/server/dal/admin/get-admin-dashboard";

export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  await requireAdmin();
  const { categories, skills } = await getAdminSkills();
  const categoryOptions = categories.map((category) => ({ value: category.id, label: category.name }));
  const categoryIds = categories.map((category) => category.id);
  const skillIds = skills.map((skill) => skill.id);

  return (
    <>
      <PageHeader index="05" label="Skills" title="Skills" />

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold tracking-tight">Categorías</h2>
        <ActionForm
          action={saveCategory}
          submitLabel="Crear categoría"
          pendingLabel="Creando…"
          resetOnSuccess
          className={`mt-4 grid max-w-xl gap-3 ${formPanelClass}`}
        >
          <h3 className="font-mono text-xs uppercase tracking-widest text-fg-muted">Nueva categoría</h3>
          <TextField name="name" label="Nombre" required />
          <TextField name="description" label="Descripción" />
          <CheckField name="isActive" label="Activa" defaultChecked />
        </ActionForm>

        {categories.length === 0 && (
          <p className={emptyStateClass}>No hay categorías. Crea una arriba para organizar tus skills.</p>
        )}
        <div className="mt-4 grid gap-3">
          {categories.map((category, index) => (
            <article key={category.id} className={panelClass}>
              <p className="mb-3 flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-widest text-fg-muted">
                {category._count.skills} habilidades
                <Badge tone={category.isActive ? "signal" : "muted"}>{category.isActive ? "Activo" : "Oculto"}</Badge>
              </p>
              <ActionForm action={saveCategory} className="grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="id" value={category.id} />
                <TextField name="name" label="Nombre" defaultValue={category.name} required />
                <TextField name="description" label="Descripción" defaultValue={category.description} />
                <TextField
                  name="displayOrder"
                  label="Orden"
                  type="number"
                  defaultValue={category.displayOrder}
                />
                <CheckField name="isActive" label="Activa" defaultChecked={category.isActive} />
              </ActionForm>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <MoveButtons
                  action={reorderTimeline}
                  fields={{ model: "skillCategory" }}
                  ids={categoryIds}
                  index={index}
                />
                <InlineForm
                  action={setItemActive}
                  fields={{ model: "skillCategory", id: category.id, active: String(!category.isActive) }}
                  label={category.isActive ? "Desactivar" : "Activar"}
                />
                <InlineForm
                  action={deleteCategory}
                  fields={{ id: category.id }}
                  label="Eliminar"
                  destructive
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold tracking-tight">Habilidades</h2>
        {categories.length === 0 ? (
          <p className={emptyStateClass}>Crea primero una categoría para poder añadir habilidades.</p>
        ) : (
          <ActionForm
            action={saveSkill}
            submitLabel="Crear habilidad"
            pendingLabel="Creando…"
            resetOnSuccess
            className={`mt-4 grid max-w-xl gap-3 ${formPanelClass}`}
          >
            <h3 className="font-mono text-xs uppercase tracking-widest text-fg-muted">Nueva habilidad</h3>
            <TextField name="name" label="Nombre" required />
            <SelectField
              name="categoryId"
              label="Categoría"
              required
              options={[{ value: "", label: "Selecciona una categoría" }, ...categoryOptions]}
            />
            <TextField name="icon" label="Icono" />
            <CheckField name="isActive" label="Activa" defaultChecked />
          </ActionForm>
        )}

        {skills.length === 0 && categories.length > 0 && (
          <p className={emptyStateClass}>Aún no hay habilidades. Añade la primera arriba.</p>
        )}
        <div className="mt-4 grid gap-3">
          {skills.map((skill, index) => (
            <article key={skill.id} className={panelClass}>
              <p className="mb-3 flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-widest text-fg-muted">
                {skill.category.name}
                <Badge tone={skill.isActive ? "signal" : "muted"}>{skill.isActive ? "Activo" : "Oculto"}</Badge>
              </p>
              <ActionForm action={saveSkill} className="grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="id" value={skill.id} />
                <TextField name="name" label="Nombre" defaultValue={skill.name} required />
                <SelectField
                  name="categoryId"
                  label="Categoría"
                  options={categoryOptions}
                  defaultValue={skill.categoryId}
                />
                <TextField name="icon" label="Icono" defaultValue={skill.icon} />
                <TextField
                  name="displayOrder"
                  label="Orden"
                  type="number"
                  defaultValue={skill.displayOrder}
                />
                <CheckField name="isActive" label="Activa" defaultChecked={skill.isActive} />
              </ActionForm>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <MoveButtons action={reorderSkills} ids={skillIds} index={index} />
                <InlineForm
                  action={setItemActive}
                  fields={{ model: "skill", id: skill.id, active: String(!skill.isActive) }}
                  label={skill.isActive ? "Desactivar" : "Activar"}
                />
                <InlineForm action={deleteSkill} fields={{ id: skill.id }} label="Eliminar" destructive />
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
