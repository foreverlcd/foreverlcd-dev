import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/prisma";

/**
 * La página de espera puede mostrar el correo del perfil aunque todavía no
 * esté publicado, tal como define docs/design-system.md §9.10.
 * Solo se expone el correo; el resto del perfil permanece privado.
 */
export const getProfileContactEmail = cache(async () => {
  const profile = await prisma.profile.findUnique({
    where: {
      id: "main",
    },
    select: {
      email: true,
    },
  });

  return profile?.email?.trim() || null;
});
