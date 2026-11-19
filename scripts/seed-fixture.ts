// Fixture completa: rellena TODOS los campos de docs/product/schema-map.json con datos ficticios.
// Uso: pnpm seed:fixture --yes     (SOLO base local; reemplaza el contenido del portfolio)
// No toca las tablas de auth (User, Session, Account, Verification).
// Los textos de marcador de abajo son los que verifican las aserciones de scripts/ui-plans/coverage.json.
import { randomUUID } from "node:crypto";

// --- Guardas: antes de importar Prisma (src/lib/prisma.ts conecta al importarse) -----------------
const rawUrl = process.env.DATABASE_URL;
let host = "";
try {
  host = new URL(rawUrl ?? "").hostname;
} catch {
  // host queda vacío y aborta abajo
}
if (host !== "localhost" && host !== "127.0.0.1") {
  console.error(`ABORTADO: solo base local (host "${host || "desconocido"}"). Esta fixture borra contenido.`);
  console.error("Corrige: apunta DATABASE_URL a localhost/127.0.0.1 (ver .env.example).");
  process.exit(1);
}
if (!process.argv.includes("--yes")) {
  console.error("ABORTADO: esto reemplaza todo el contenido del portfolio (perfil, proyectos, skills...).");
  console.error("Corrige: vuelve a correrlo con `pnpm seed:fixture --yes` solo si la base local es desechable.");
  process.exit(1);
}

const { prisma } = await import("../src/lib/prisma.ts");

// --- Imágenes públicas de demo de Cloudinary, con sus dimensiones reales -------------------------
const CLD = "https://res.cloudinary.com/demo/image/upload";
const KNOWN: Record<string, [number, number]> = {
  sample: [864, 576],
  "cld-sample": [1870, 1250],
  "cld-sample-2": [1870, 1250],
  "cld-sample-3": [1870, 1250],
  "cld-sample-4": [1870, 1250],
  "cld-sample-5": [1870, 1250],
};

async function dims(name: string): Promise<{ width: number; height: number; format: string }> {
  try {
    const res = await fetch(`${CLD}/fl_getinfo/${name}`, { signal: AbortSignal.timeout(8000) });
    const info = (await res.json()) as { input?: { width?: number; height?: number } };
    if (info.input?.width && info.input.height) {
      return { width: info.input.width, height: info.input.height, format: "jpg" };
    }
  } catch {
    // sin red: usa las dimensiones conocidas
  }
  const [width, height] = KNOWN[name] ?? KNOWN.sample;
  return { width, height, format: "jpg" };
}

const img = async (name: string) => ({
  publicId: `demo/${name}`,
  secureUrl: `${CLD}/${name}.jpg`,
  ...(await dims(name)),
});
const [cover1, cover2, cover3, cover4, gallery1, gallery2] = await Promise.all(
  ["sample", "cld-sample", "cld-sample-2", "cld-sample-3", "cld-sample-4", "cld-sample-5"].map(img),
);

const d = (s: string) => new Date(`${s}T00:00:00Z`);
const BIO =
  "Ada es una ingeniera de software ficticia que existe solo para probar el portfolio. " +
  "Biografía larga de marcador: cuenta su recorrido por backend, datos y experiencias interactivas, " +
  "los problemas que le gusta resolver y cómo trabaja con equipos pequeños. ".repeat(3).trim();

// Skills: id fijo para enlazarlas con los proyectos.
const skillIds = Object.fromEntries(
  ["typescript", "nextjs", "postgresql", "python", "docker", "tailwind-css"].map((s) => [s, randomUUID()]),
);
const catBackend = randomUUID();
const catFront = randomUUID();

await prisma.$transaction(async (tx) => {
  // Orden: hijos con Restrict (Skill) antes que su categoría; el resto cae en cascada.
  await tx.project.deleteMany();
  await tx.skill.deleteMany();
  await tx.skillCategory.deleteMany();
  await tx.profile.deleteMany();

  await tx.profile.create({
    data: {
      id: "main",
      fullName: "Ada Valentina Ríos Mendoza (ficticio)",
      headline: "Ingeniera de software full stack (perfil ficticio de prueba)",
      shortBio: "Biografía corta ficticia: construyo backends sólidos y experiencias web interactivas.",
      biography: BIO,
      location: "Lima, Perú (ficticio)",
      email: "ada.rios@example.com",
      photoUrl: `${CLD}/sample.jpg`,
      photoPublicId: "demo/sample",
      isPublished: true,
      socialLinks: {
        create: [
          { platform: "GITHUB", label: "GitHub", url: "https://example.com/ada/github", displayOrder: 0 },
          { platform: "LINKEDIN", label: "LinkedIn", url: "https://example.com/ada/linkedin", displayOrder: 1 },
          { platform: "WEBSITE", label: "Sitio web", url: "https://example.com/ada", displayOrder: 2 },
        ],
      },
      experiences: {
        create: [
          {
            company: "Empresa Actual Ficticia",
            jobTitle: "Ingeniera Backend Senior (ficticio)",
            description: "Trabajo actual de marcador: diseño de APIs y plataforma de datos.",
            location: "Remoto (ficticio)",
            employmentType: "FULL_TIME",
            startDate: d("2022-03-01"),
            isCurrent: true,
            displayOrder: 0,
          },
          {
            company: "Estudio Freelance Ficticio",
            jobTitle: "Desarrolladora Freelance (ficticio)",
            description: "Trabajo anterior de marcador: sitios y herramientas internas para clientes.",
            location: "Lima (ficticio)",
            employmentType: "FREELANCE",
            startDate: d("2019-01-01"),
            endDate: d("2022-02-01"),
            displayOrder: 1,
          },
          {
            company: "Empresa Inactiva Oculta (ficticia)",
            jobTitle: "Puesto Inactivo Oculto",
            description: "No debe verse en el sitio.",
            employmentType: "PART_TIME",
            startDate: d("2017-01-01"),
            endDate: d("2018-12-01"),
            isActive: false,
            displayOrder: 2,
          },
        ],
      },
      education: {
        create: [
          {
            institution: "Instituto Ficticio de Datos",
            degree: "Certificación en Ingeniería de Datos (ficticia)",
            fieldOfStudy: "Ingeniería de datos",
            description: "Descripción de marcador de la certificación.",
            location: "Online (ficticio)",
            type: "CERTIFICATION",
            credentialUrl: "https://example.com/ada/credencial",
            startDate: d("2021-01-01"),
            endDate: d("2021-06-01"),
            displayOrder: 0,
          },
          {
            institution: "Universidad Ficticia del Norte",
            degree: "Ingeniería de Sistemas (ficticia)",
            fieldOfStudy: "Ingeniería de Sistemas (ficticia)",
            location: "Lima (ficticio)",
            type: "FORMAL",
            startDate: d("2013-03-01"),
            endDate: d("2018-12-01"),
            displayOrder: 1,
          },
        ],
      },
    },
  });

  await tx.skillCategory.create({
    data: {
      id: catBackend,
      name: "Backend y datos",
      slug: "backend-datos",
      description: "Categoría de marcador: servicios, bases de datos e infraestructura.",
      displayOrder: 0,
      skills: {
        create: [
          { id: skillIds.typescript, name: "TypeScript", slug: "typescript", icon: `${CLD}/cld-sample.jpg`,
            description: "Descripción de marcador de TypeScript.", displayOrder: 0 },
          { id: skillIds.postgresql, name: "PostgreSQL", slug: "postgresql", icon: "🐘",
            description: "Descripción de marcador de PostgreSQL.", displayOrder: 1 },
          { id: skillIds.python, name: "Python", slug: "python", icon: `${CLD}/cld-sample-2.jpg`,
            description: "Descripción de marcador de Python.", displayOrder: 2 },
          { id: skillIds.docker, name: "Docker", slug: "docker", icon: "🐳",
            description: "Descripción de marcador de Docker.", displayOrder: 3 },
        ],
      },
    },
  });
  await tx.skillCategory.create({
    data: {
      id: catFront,
      name: "Frontend y experiencias",
      slug: "frontend-experiencias",
      description: "Categoría de marcador: interfaces y gráficos en el navegador.",
      displayOrder: 1,
      skills: {
        create: [
          { id: skillIds.nextjs, name: "Next.js", slug: "nextjs", icon: `${CLD}/cld-sample-3.jpg`,
            description: "Descripción de marcador de Next.js.", displayOrder: 0 },
          { id: skillIds["tailwind-css"], name: "Tailwind CSS", slug: "tailwind-css", icon: "🎨",
            description: "Descripción de marcador de Tailwind CSS.", displayOrder: 1 },
        ],
      },
    },
  });

  const sk = (...names: string[]) => names.map((n, i) => ({ skillId: skillIds[n], displayOrder: i }));
  const cover = (c: typeof cover1, alt: string) => ({ type: "COVER" as const, alt, displayOrder: 0, ...c });
  const repos = (slug: string) => [
    { type: "BACKEND" as const, url: `https://example.com/ada/${slug}-api`, displayOrder: 0 },
    { type: "FRONTEND" as const, url: `https://example.com/ada/${slug}-web`, displayOrder: 1 },
    { type: "OTHER" as const, url: `https://example.com/ada/${slug}-docs`, displayOrder: 2 },
  ];

  await tx.project.create({
    data: {
      title: "Proyecto Aurora (ficticio)", slug: "fixture-aurora",
      shortDescription: "Descripción corta de marcador de Aurora.",
      description: "Descripción larga de marcador de Aurora, con varios párrafos de texto de prueba.",
      demoUrl: "https://example.com/aurora", isFeatured: true, status: "PUBLISHED", displayOrder: 0,
      startDate: d("2023-02-01"), endDate: d("2023-09-01"),
      images: { create: [
        cover(cover1, "Portada de marcador de Aurora"),
        { type: "GALLERY", alt: "Galería 1 de marcador de Aurora", displayOrder: 0, ...gallery1 },
        { type: "GALLERY", alt: "Galería 2 de marcador de Aurora", displayOrder: 1, ...gallery2 },
      ] },
      skills: { create: sk("typescript", "postgresql", "nextjs") },
      repositories: { create: repos("aurora") },
    },
  });
  await tx.project.create({
    data: {
      title: "Proyecto Boreal (ficticio)", slug: "fixture-boreal",
      shortDescription: "Descripción corta de marcador de Boreal.",
      description: "Descripción larga de marcador de Boreal.",
      demoUrl: "https://example.com/boreal", isFeatured: true, status: "PUBLISHED", displayOrder: 1,
      startDate: d("2022-05-01"), endDate: d("2022-12-01"),
      images: { create: [cover(cover2, "Portada de marcador de Boreal")] },
      skills: { create: sk("python", "docker") },
      repositories: { create: repos("boreal").slice(0, 2) },
    },
  });
  await tx.project.create({
    data: {
      title: "Proyecto Cénit (ficticio)", slug: "fixture-cenit",
      shortDescription: "Descripción corta de marcador de Cénit.",
      description: "Descripción larga de marcador de Cénit.",
      demoUrl: "https://example.com/cenit", status: "PUBLISHED", displayOrder: 2,
      startDate: d("2021-03-01"), endDate: d("2021-08-01"),
      images: { create: [cover(cover3, "Portada de marcador de Cénit")] },
      skills: { create: sk("nextjs", "tailwind-css") },
      repositories: { create: repos("cenit").slice(2) },
    },
  });
  await tx.project.create({
    data: {
      title: "Proyecto Delta (ficticio)", slug: "fixture-delta",
      shortDescription: "Descripción corta de marcador de Delta.",
      description: "Descripción larga de marcador de Delta.",
      status: "PUBLISHED", displayOrder: 3, startDate: d("2020-01-01"),
      images: { create: [cover(cover4, "Portada de marcador de Delta")] },
      skills: { create: sk("typescript") },
    },
  });
  await tx.project.create({
    data: {
      title: "Proyecto Borrador Oculto (ficticio)", slug: "fixture-borrador",
      shortDescription: "No debe verse en el sitio.",
      description: "Borrador de marcador: nunca público.",
      status: "DRAFT", displayOrder: 4, skills: { create: sk("docker") },
    },
  });
});

console.log("Fixture cargada: perfil ficticio publicado, 6 skills, 4 proyectos publicados y 1 borrador.");
await prisma.$disconnect();
