"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { initialActionState } from "@/server/actions/action-state";
import { setProfilePhoto } from "@/server/actions/profile";
import { uploadImage } from "./cloudinary-upload";
import { inputClass, monoLabelClass, primaryButtonClass } from "./styles";

type ProfilePhotoUploadProps = {
  photoUrl: string | null;
  alt: string;
};

/** Foto de perfil: se sube a Cloudinary (carpeta profile) y se registra; la anterior se borra. */
export function ProfilePhotoUpload({ photoUrl, alt }: ProfilePhotoUploadProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(form: FormData) {
    setBusy(true);
    setMessage(null);
    try {
      const file = form.get("file");
      if (!(file instanceof File) || !file.size) throw new Error("Selecciona una imagen.");
      const image = await uploadImage(file, "profile");
      const registration = new FormData();
      registration.set("photoUrl", image.secure_url);
      registration.set("photoPublicId", image.public_id);
      const result = await setProfilePhoto(initialActionState, registration);
      if (!result.ok) throw new Error(result.message);
      setMessage({ ok: true, text: "Foto subida." });
      router.refresh();
    } catch (error) {
      const text = error instanceof Error ? error.message : "No se pudo subir la foto.";
      setMessage({ ok: false, text });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 grid max-w-3xl gap-4 rounded-[2px] border border-rule bg-surface-deep p-4 sm:grid-cols-[120px_1fr]">
      <div>
        <p className={monoLabelClass}>Foto</p>
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={alt}
            width={120}
            height={150}
            sizes="120px"
            className="mt-2 aspect-[4/5] w-[120px] border border-rule object-cover"
          />
        ) : (
          <p className="mt-2 grid aspect-[4/5] w-[120px] place-items-center border border-dashed border-rule text-xs">
            Sin foto
          </p>
        )}
      </div>
      <form action={submit} className="grid content-start gap-3">
        <label className="grid gap-1 text-sm">
          {photoUrl ? "Cambiar foto" : "Subir foto (obligatoria para publicar)"}
          <input required type="file" name="file" accept="image/*" className={inputClass} />
        </label>
        {message && (
          <p
            role={message.ok ? "status" : "alert"}
            className={`text-sm ${message.ok ? "text-accent-text" : "text-status-danger"}`}
          >
            {message.text}
          </p>
        )}
        <button disabled={busy} className={primaryButtonClass}>
          {busy ? "Subiendo…" : "Subir foto"}
        </button>
      </form>
    </section>
  );
}
