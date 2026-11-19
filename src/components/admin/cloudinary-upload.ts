/** Subida firmada navegador → Cloudinary (sin SDK). El servidor firma solo carpetas en lista blanca. */

export type UploadFolder = "profile" | "projects";

type CloudinarySignature = {
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
  cloudName: string;
  message?: string;
};

export type UploadedImage = {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
};

async function requestSignature(folder: UploadFolder): Promise<CloudinarySignature> {
  const response = await fetch("/api/admin/cloudinary/signature", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  const signature = await response.json();
  if (!response.ok) throw new Error(signature.message || "Subidas no disponibles.");
  return signature;
}

export async function uploadImage(file: File, folder: UploadFolder): Promise<UploadedImage> {
  const signature = await requestSignature(folder);
  const upload = new FormData();
  upload.set("file", file);
  upload.set("api_key", signature.apiKey);
  upload.set("timestamp", String(signature.timestamp));
  upload.set("folder", signature.folder);
  upload.set("signature", signature.signature);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, {
    method: "POST",
    body: upload,
  });
  const image = await response.json();
  if (!response.ok) throw new Error(image.error?.message || "Falló la subida.");
  return image;
}
