"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerProjectImage } from "@/server/actions/projects";
import { initialActionState } from "@/server/actions/action-state";
import { uploadImage } from "./cloudinary-upload";
import { inputClass, primaryButtonClass } from "./styles";

type ProjectImageUploadProps = {
  projectId: string;
  /** Position for a new gallery image (appended after the existing ones). */
  nextOrder?: number;
};

export function ProjectImageUpload({ projectId, nextOrder = 0 }: ProjectImageUploadProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(form: FormData) {
    setBusy(true);
    setMessage(null);
    try {
      const file = form.get("file");
      if (!(file instanceof File) || !file.size) throw new Error("Selecciona una imagen.");
      const image = await uploadImage(file, "projects");
      const registration = new FormData();
      const fields = {
        projectId,
        type: String(form.get("type")),
        publicId: image.public_id,
        secureUrl: image.secure_url,
        width: image.width,
        height: image.height,
        format: image.format,
        alt: String(form.get("alt")),
        displayOrder: String(nextOrder),
      };
      for (const [key, value] of Object.entries(fields)) registration.set(key, String(value));
      const result = await registerProjectImage(initialActionState, registration);
      if (!result.ok) throw new Error(result.message);
      setMessage({ ok: true, text: "Imagen subida y registrada." });
      router.refresh();
    } catch (error) {
      const text = error instanceof Error ? error.message : "No se pudo subir la imagen.";
      setMessage({ ok: false, text });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form action={submit} className="mt-4 grid max-w-xl gap-3 rounded-[2px] border border-rule bg-surface-deep p-4">
      <h3 className="font-display text-lg font-bold tracking-tight">Subir imagen</h3>
      <label className="grid gap-1 text-sm">
        Archivo
        <input required type="file" name="file" accept="image/*" className={inputClass} />
      </label>
      <label className="grid gap-1 text-sm">
        Texto alternativo
        <input required name="alt" className={inputClass} />
      </label>
      <label className="grid gap-1 text-sm">
        Tipo
        <select name="type" className={inputClass}>
          <option value="GALLERY">Galería</option>
          <option value="COVER">Portada (reemplaza la actual)</option>
        </select>
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
        {busy ? "Subiendo…" : "Subir imagen"}
      </button>
    </form>
  );
}
