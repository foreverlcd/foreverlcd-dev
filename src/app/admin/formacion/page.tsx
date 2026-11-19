import { Badge } from "@/components/admin/badge";
import { PageHeader } from "@/components/admin/page-header";
import { ActionForm } from "@/components/admin/action-form";
import { CheckField, SelectField, TextAreaField, TextField } from "@/components/admin/fields";
import { InlineForm } from "@/components/admin/inline-form";
import { MoveButtons } from "@/components/admin/move-buttons";
import { emptyStateClass, formPanelClass, monoLabelClass, panelClass } from "@/components/admin/styles";
import {
  deleteEducation,
  reorderTimeline,
  saveEducation,
  setItemActive,
} from "@/server/actions/timeline";
import { requireAdmin } from "@/server/auth/require-admin";
import { getAdminEducation } from "@/server/dal/admin/get-admin-dashboard";

export const dynamic = "force-dynamic";

type EducationRow = Awaited<ReturnType<typeof getAdminEducation>>[number];

const educationTypes = [
  { value: "FORMAL", label: "Formal" },
  { value: "CERTIFICATION", label: "Certificación" },
  { value: "COURSE", label: "Curso" },
  { value: "SPECIALIZATION", label: "Especialización" },
  { value: "OTHER", label: "Otro" },
];

function dateValue(date: Date | null | undefined) {
  return date ? date.toISOString().slice(0, 10) : "";
}

function EducationFields({ row }: { row?: EducationRow }) {
  return (
    <>
      <TextField name="institution" label="Institución" defaultValue={row?.institution} required />
      <TextField name="degree" label="Grado" defaultValue={row?.degree} required />
      <TextField name="fieldOfStudy" label="Área de estudio" defaultValue={row?.fieldOfStudy} required />
      <TextField name="location" label="Ubicación" defaultValue={row?.location} />
      <TextField name="startDate" label="Inicio" type="date" defaultValue={dateValue(row?.startDate)} />
      <TextField name="endDate" label="Fin" type="date" defaultValue={dateValue(row?.endDate)} />
      <TextField
        name="credentialUrl"
        label="URL de credencial"
        type="url"
        defaultValue={row?.credentialUrl}
      />
      <SelectField
        name="type"
        label="Tipo"
        options={educationTypes}
        defaultValue={row?.type ?? "FORMAL"}
      />
      <TextAreaField
        name="description"
        label="Descripción"
        defaultValue={row?.description}
        className="sm:col-span-2"
      />
      <TextField name="displayOrder" label="Orden" type="number" defaultValue={row?.displayOrder ?? 0} />
      <div className="flex flex-wrap items-center gap-6">
        <CheckField name="isCurrent" label="En curso" defaultChecked={row?.isCurrent} />
        <CheckField name="isActive" label="Visible" defaultChecked={row ? row.isActive : true} />
      </div>
    </>
  );
}

export default async function EducationPage() {
  await requireAdmin();
  const rows = await getAdminEducation();
  const ids = rows.map((row) => row.id);

  return (
    <>
      <PageHeader index="07" label="Formación" title="Formación" />

      <ActionForm
        action={saveEducation}
        submitLabel="Añadir formación"
        pendingLabel="Añadiendo…"
        resetOnSuccess
        className={`mt-8 grid max-w-3xl gap-3 ${formPanelClass} sm:grid-cols-2`}
      >
        <h2 className="font-display text-lg font-bold tracking-tight sm:col-span-2">Añadir formación</h2>
        <EducationFields />
      </ActionForm>

      {rows.length === 0 && (
        <p className={emptyStateClass}>Aún no hay formación. Añade la primera arriba.</p>
      )}

      <div className="mt-8 grid gap-4">
        {rows.map((row, index) => (
          <article key={row.id} className={panelClass}>
            <p className="font-medium">
              {row.degree} · {row.institution}
            </p>
            <p className="mb-3">
              <Badge tone={row.isActive ? "signal" : "muted"}>{row.isActive ? "Activo" : "Oculto"}</Badge>
            </p>
            <details>
              <summary className={`${monoLabelClass} inline-flex min-h-10 cursor-pointer items-center text-accent-text`}>
                Editar
              </summary>
              <ActionForm action={saveEducation} className="mt-3 grid gap-3 sm:grid-cols-2" secondary>
                <input type="hidden" name="id" value={row.id} />
                <EducationFields row={row} />
              </ActionForm>
            </details>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <MoveButtons
                action={reorderTimeline}
                fields={{ model: "education" }}
                ids={ids}
                index={index}
              />
              <InlineForm
                action={setItemActive}
                fields={{ model: "education", id: row.id, active: String(!row.isActive) }}
                label={row.isActive ? "Ocultar" : "Mostrar"}
              />
              <InlineForm action={deleteEducation} fields={{ id: row.id }} label="Eliminar" destructive />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
