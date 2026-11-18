import { Badge } from "@/components/admin/badge";
import { PageHeader } from "@/components/admin/page-header";
import { ActionForm } from "@/components/admin/action-form";
import { CheckField, SelectField, TextAreaField, TextField } from "@/components/admin/fields";
import { InlineForm } from "@/components/admin/inline-form";
import { MoveButtons } from "@/components/admin/move-buttons";
import { emptyStateClass, formPanelClass, monoLabelClass, panelClass } from "@/components/admin/styles";
import {
  deleteExperience,
  reorderTimeline,
  saveExperience,
  setItemActive,
} from "@/server/actions/timeline";
import { requireAdmin } from "@/server/auth/require-admin";
import { getAdminExperiences } from "@/server/dal/admin/get-admin-dashboard";

export const dynamic = "force-dynamic";

type ExperienceRow = Awaited<ReturnType<typeof getAdminExperiences>>[number];

const employmentTypes = [
  { value: "FULL_TIME", label: "Tiempo completo" },
  { value: "PART_TIME", label: "Medio tiempo" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "INTERNSHIP", label: "Prácticas" },
  { value: "VOLUNTEERING", label: "Voluntariado" },
  { value: "PERSONAL_PROJECT", label: "Proyecto personal" },
  { value: "OTHER", label: "Otro" },
];

function dateValue(date: Date | null | undefined) {
  return date ? date.toISOString().slice(0, 10) : "";
}

function ExperienceFields({ row }: { row?: ExperienceRow }) {
  return (
    <>
      <TextField name="company" label="Empresa" defaultValue={row?.company} required />
      <TextField name="jobTitle" label="Cargo" defaultValue={row?.jobTitle} required />
      <TextField
        name="startDate"
        label="Inicio"
        type="date"
        defaultValue={dateValue(row?.startDate)}
        required
      />
      <TextField name="endDate" label="Fin" type="date" defaultValue={dateValue(row?.endDate)} />
      <TextField name="location" label="Ubicación" defaultValue={row?.location} />
      <SelectField
        name="employmentType"
        label="Tipo de empleo"
        options={employmentTypes}
        defaultValue={row?.employmentType ?? "FULL_TIME"}
      />
      <TextAreaField
        name="description"
        label="Descripción"
        defaultValue={row?.description}
        required
        className="sm:col-span-2"
      />
      <TextField name="displayOrder" label="Orden" type="number" defaultValue={row?.displayOrder ?? 0} />
      <div className="flex flex-wrap items-center gap-6">
        <CheckField name="isCurrent" label="Actualmente" defaultChecked={row?.isCurrent} />
        <CheckField name="isActive" label="Visible" defaultChecked={row ? row.isActive : true} />
      </div>
    </>
  );
}

export default async function ExperiencePage() {
  await requireAdmin();
  const rows = await getAdminExperiences();
  const ids = rows.map((row) => row.id);

  return (
    <>
      <PageHeader index="06" label="Experiencia" title="Experiencia" />

      <ActionForm
        action={saveExperience}
        submitLabel="Añadir experiencia"
        pendingLabel="Añadiendo…"
        resetOnSuccess
        className={`mt-8 grid max-w-3xl gap-3 ${formPanelClass} sm:grid-cols-2`}
      >
        <h2 className="font-display text-lg font-bold tracking-tight sm:col-span-2">Añadir experiencia</h2>
        <ExperienceFields />
      </ActionForm>

      {rows.length === 0 && (
        <p className={emptyStateClass}>Aún no hay experiencia. Añade la primera arriba.</p>
      )}

      <div className="mt-8 grid gap-4">
        {rows.map((row, index) => (
          <article key={row.id} className={panelClass}>
            <p className="font-medium">
              {row.jobTitle} · {row.company}
            </p>
            <p className="mb-3">
              <Badge tone={row.isActive ? "signal" : "muted"}>{row.isActive ? "Activo" : "Oculto"}</Badge>
            </p>
            <details>
              <summary className={`${monoLabelClass} inline-flex min-h-10 cursor-pointer items-center text-accent-text`}>
                Editar
              </summary>
              <ActionForm action={saveExperience} className="mt-3 grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="id" value={row.id} />
                <ExperienceFields row={row} />
              </ActionForm>
            </details>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <MoveButtons
                action={reorderTimeline}
                fields={{ model: "experience" }}
                ids={ids}
                index={index}
              />
              <InlineForm
                action={setItemActive}
                fields={{ model: "experience", id: row.id, active: String(!row.isActive) }}
                label={row.isActive ? "Ocultar" : "Mostrar"}
              />
              <InlineForm action={deleteExperience} fields={{ id: row.id }} label="Eliminar" destructive />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
