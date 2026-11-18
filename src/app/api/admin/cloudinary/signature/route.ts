import { NextResponse } from "next/server";

import { getAdminSession } from "@/server/auth/require-admin";
import { cloudinaryPublicConfig, cloudinarySignature } from "@/server/cloudinary";

const FOLDERS = {
  profile: "foreverlcd/profile",
  projects: "foreverlcd/projects",
} as const;

/** Firma una subida directa navegador → Cloudinary. Solo administradores; carpeta en lista blanca. */
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const body: { folder?: unknown } = await request.json().catch(() => ({}));
  const folder = body.folder === "profile" ? FOLDERS.profile : FOLDERS.projects;
  const timestamp = Math.floor(Date.now() / 1000);

  try {
    const config = cloudinaryPublicConfig();
    const signature = cloudinarySignature({ folder, timestamp });
    return NextResponse.json({ timestamp, signature, folder, ...config });
  } catch {
    return NextResponse.json({ message: "Cloudinary no está configurado." }, { status: 503 });
  }
}
