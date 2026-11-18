import { ActionForm } from "@/components/admin/action-form";
import { TextAreaField, TextField } from "@/components/admin/fields";
import { InlineForm } from "@/components/admin/inline-form";
import { emptyStateClass } from "@/components/admin/styles";
import { setProfilePublished, updateProfile } from "@/server/actions/profile";
import { requireAdmin } from "@/server/auth/require-admin";
import { getAdminProfile } from "@/server/dal/admin/get-admin-dashboard";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  await requireAdmin();
  const profile = await getAdminProfile();

  return (
    <>
      <h1 className="font-display text-h1">Perfil</h1>
      {!profile && (
        <p className={emptyStateClass}>
          Aún no hay perfil. Completa el formulario y guarda para crearlo; después podrás publicarlo.
        </p>
      )}
      {profile && (
        <section className="mt-6 flex flex-wrap items-center gap-4">
          <p>Estado: {profile.isPublished ? "Publicado" : "Sin publicar"}</p>
          <InlineForm
            action={setProfilePublished}
            fields={{ published: profile.isPublished ? "false" : "true" }}
            label={profile.isPublished ? "Despublicar perfil" : "Publicar perfil"}
          />
        </section>
      )}
      <ActionForm action={updateProfile} className="mt-8 grid max-w-3xl gap-4">
        <TextField name="fullName" label="Nombre" defaultValue={profile?.fullName} required />
        <TextField name="headline" label="Titular" defaultValue={profile?.headline} required />
        <TextAreaField
          name="shortBio"
          label="Biografía breve (máx. 280 caracteres)"
          defaultValue={profile?.shortBio}
          rows={3}
        />
        <TextAreaField name="biography" label="Biografía" defaultValue={profile?.biography} rows={6} />
        <TextField name="location" label="Ubicación" defaultValue={profile?.location} />
        <TextField name="email" label="Correo" type="email" defaultValue={profile?.email} />
        <TextField name="photoUrl" label="URL de foto" type="url" defaultValue={profile?.photoUrl} />
        <TextField name="photoPublicId" label="ID de foto" defaultValue={profile?.photoPublicId} />
      </ActionForm>
    </>
  );
}
