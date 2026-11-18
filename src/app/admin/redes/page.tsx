import { Badge } from "@/components/admin/badge";
import { PageHeader } from "@/components/admin/page-header";
import { ActionForm } from "@/components/admin/action-form";
import { CheckField, SelectField, TextField } from "@/components/admin/fields";
import { InlineForm } from "@/components/admin/inline-form";
import { MoveButtons } from "@/components/admin/move-buttons";
import { emptyStateClass, formPanelClass, h2Class, panelClass } from "@/components/admin/styles";
import { deleteSocialLink, reorderSocialLinks, saveSocialLink } from "@/server/actions/social-links";
import { setItemActive } from "@/server/actions/timeline";
import { requireAdmin } from "@/server/auth/require-admin";
import { getAdminSocialLinks } from "@/server/dal/admin/get-admin-dashboard";

export const dynamic = "force-dynamic";

const platforms = [
  "GITHUB",
  "LINKEDIN",
  "EMAIL",
  "WEBSITE",
  "X",
  "YOUTUBE",
  "INSTAGRAM",
  "DISCORD",
  "CUSTOM",
  "OTHER",
].map((value) => ({ value, label: value }));

export default async function SocialLinksPage() {
  await requireAdmin();
  const links = await getAdminSocialLinks();
  const ids = links.map((link) => link.id);

  return (
    <>
      <PageHeader index="03" label="Redes" title="Redes y enlaces" />

      <ActionForm
        action={saveSocialLink}
        submitLabel="Añadir enlace"
        pendingLabel="Añadiendo…"
        resetOnSuccess
        className={`mt-8 grid max-w-3xl gap-4 ${formPanelClass}`}
      >
        <h2 className={h2Class}>Añadir enlace</h2>
        <SelectField name="platform" label="Plataforma" options={platforms} />
        <TextField name="label" label="Etiqueta" required />
        <TextField name="url" label="URL" type="url" required />
        <TextField name="displayOrder" label="Orden" type="number" defaultValue={0} />
        <CheckField name="isActive" label="Activo" defaultChecked />
      </ActionForm>

      {links.length === 0 && <p className={emptyStateClass}>Aún no hay enlaces. Añade el primero arriba.</p>}

      <div className="mt-8 grid gap-4">
        {links.map((link, index) => (
          <article key={link.id} className={panelClass}>
            <p className="mb-3"><Badge tone={link.isActive ? "signal" : "muted"}>{link.isActive ? "Activo" : "Oculto"}</Badge></p>
            <ActionForm action={saveSocialLink} className="grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="id" value={link.id} />
              <SelectField
                name="platform"
                label="Plataforma"
                options={platforms}
                defaultValue={link.platform}
              />
              <TextField name="label" label="Etiqueta" defaultValue={link.label} required />
              <TextField name="url" label="URL" type="url" defaultValue={link.url} required />
              <TextField name="displayOrder" label="Orden" type="number" defaultValue={link.displayOrder} />
              <CheckField name="isActive" label="Activo" defaultChecked={link.isActive} />
            </ActionForm>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <MoveButtons action={reorderSocialLinks} ids={ids} index={index} />
              <InlineForm
                action={setItemActive}
                fields={{ model: "socialLink", id: link.id, active: String(!link.isActive) }}
                label={link.isActive ? "Desactivar" : "Activar"}
              />
              <InlineForm action={deleteSocialLink} fields={{ id: link.id }} label="Eliminar" destructive />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
