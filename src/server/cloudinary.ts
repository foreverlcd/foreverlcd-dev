import "server-only";

import { createHash } from "node:crypto";

type CloudinaryParams = Record<string, string | number>;

function cloudConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary no está configurado.");
  }
  return { cloudName, apiKey, apiSecret };
}

/** Firma SHA-1 de Cloudinary: parámetros no vacíos ordenados `k=v&…` + secreto. */
export function cloudinarySignature(params: CloudinaryParams) {
  const { apiSecret } = cloudConfig();
  const canonical = Object.entries(params)
    .filter(([, value]) => value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return createHash("sha1").update(`${canonical}${apiSecret}`).digest("hex");
}

/** Datos que el navegador necesita para la subida firmada (nunca incluye el secreto). */
export function cloudinaryPublicConfig() {
  const { cloudName, apiKey } = cloudConfig();
  return { cloudName, apiKey };
}

export async function destroyImage(publicId: string) {
  const { cloudName, apiKey } = cloudConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = cloudinarySignature({ public_id: publicId, timestamp });

  const body = new FormData();
  body.set("public_id", publicId);
  body.set("timestamp", String(timestamp));
  body.set("api_key", apiKey);
  body.set("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: "POST",
    body,
  });
  if (!response.ok) {
    throw new Error("No se pudo eliminar la imagen en Cloudinary.");
  }
}
