import "server-only";

import type { Portfolio } from "./load-portfolio";

/**
 * Contenido DEMO para desarrollo local con la base de datos vacía.
 *
 * - Solo se activa con `PORTFOLIO_DEMO=1` y fuera de producción.
 * - Todo el texto es de relleno y la interfaz muestra una etiqueta DEMO.
 * - No describe a ninguna persona real ni sustituye datos de la base.
 */
export function isDemoMode() {
  return process.env.PORTFOLIO_DEMO === "1" && process.env.NODE_ENV !== "production";
}

const date = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

const CLD = "https://res.cloudinary.com/demo/image/upload";

/** Iconos DEMO: URL de Cloudinary (imagen), glifo corto o ninguno. */
const skill = (name: string, icon: string | null = null) => ({
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  icon,
});

export function getDemoPortfolio(): Portfolio {
  const skills = {
    ts: skill("TypeScript", `${CLD}/sample.jpg`),
    next: skill("Next.js"),
    pg: skill("PostgreSQL"),
    prisma: skill("Prisma"),
    three: skill("Three.js"),
    node: skill("Node.js"),
    py: skill("Python", "🐍"),
    docker: skill("Docker"),
  };

  const project = (
    n: number,
    title: string,
    shortDescription: string,
    stack: (typeof skills)[keyof typeof skills][],
    start: string,
    end: string | null,
    isFeatured = false,
  ) => ({
    id: `demo-project-${n}`,
    title,
    slug: `demo-${n}`,
    shortDescription,
    demoUrl: isFeatured ? "https://example.com/" : null,
    isFeatured,
    displayOrder: n,
    startDate: date(start),
    endDate: end ? date(end) : null,
    cover: {
      secureUrl: `${CLD}/sample.jpg`,
      alt: `Portada DEMO de ${title}`,
      width: 1600,
      height: 1000,
    },
    skills: stack,
    repositories: [
      { type: "BACKEND" as const, url: `https://github.com/demo-${n}-api`, displayOrder: 0 },
      { type: "FRONTEND" as const, url: `https://github.com/demo-${n}-web`, displayOrder: 1 },
      { type: "OTHER" as const, url: `https://github.com/demo-${n}`, displayOrder: 2 },
    ],
  });

  return {
    demo: true,
    profile: {
      fullName: "Nombre Apellido",
      headline: "Titular de ejemplo: ingeniería de software full stack e IA aplicada",
      shortBio:
        "Texto de relleno para evaluar la composición. Aquí irá la biografía breve real, escrita desde el dashboard.",
      biography:
        "DEMO · Primer párrafo de la biografía de relleno: sirve para evaluar el ritmo de lectura de un texto largo.\n\nDEMO · Segundo párrafo: el contenido real se escribe desde el dashboard y respeta los saltos de párrafo.",
      location: "Ciudad, País",
      email: "demo@example.com",
      photoUrl: `${CLD}/sample.jpg`,
      updatedAt: date("2026-11-16"),
      socialLinks: [
        { id: "demo-gh", platform: "GITHUB", label: "GitHub", url: "https://github.com/", displayOrder: 0 },
        { id: "demo-li", platform: "LINKEDIN", label: "LinkedIn", url: "https://www.linkedin.com/", displayOrder: 1 },
      ],
    },
    contactEmail: "demo@example.com",
    projects: [
      project(1, "Proyecto demo uno", "Descripción de relleno de un proyecto destacado, con el largo típico de una línea y media.", [skills.ts, skills.next, skills.pg, skills.prisma], "2026-03-01", null, true),
      project(2, "Proyecto demo dos", "Descripción de relleno de un servicio backend con una cola de trabajos.", [skills.node, skills.pg, skills.docker], "2025-09-01", "2026-02-01"),
      project(3, "Proyecto demo tres", "Descripción de relleno de una experiencia interactiva en WebGL.", [skills.ts, skills.three], "2025-05-01", "2025-08-01"),
      project(4, "Proyecto demo cuatro", "Descripción de relleno de un prototipo de IA aplicada.", [skills.py, skills.docker, skills.pg], "2024-11-01", "2025-03-01"),
    ],
    experiences: [
      {
        id: "demo-exp-1",
        company: "Empresa de ejemplo",
        jobTitle: "Puesto de ejemplo",
        description: "Descripción de relleno de responsabilidades y resultados.",
        location: "Remoto",
        employmentType: "FULL_TIME",
        startDate: date("2025-06-01"),
        endDate: null,
        isCurrent: true,
        displayOrder: 0,
      },
      {
        id: "demo-exp-2",
        company: "Otra empresa de ejemplo",
        jobTitle: "Prácticas de ejemplo",
        description: "Descripción de relleno de unas prácticas.",
        location: null,
        employmentType: "INTERNSHIP",
        startDate: date("2024-09-01"),
        endDate: date("2025-03-01"),
        isCurrent: false,
        displayOrder: 1,
      },
    ],
    education: [
      {
        id: "demo-edu-1",
        institution: "Universidad de ejemplo",
        degree: "Titulación de ejemplo",
        fieldOfStudy: "Ingeniería informática",
        description: "DEMO · Descripción de relleno de la formación.",
        location: "Ciudad, País",
        type: "FORMAL",
        credentialUrl: "https://example.com/credencial-demo",
        startDate: date("2020-03-01"),
        endDate: date("2025-12-01"),
        isCurrent: false,
        displayOrder: 0,
      },
    ],
    skillCategories: [
      {
        id: "demo-cat-1",
        name: "Backend",
        slug: "backend",
        description: "DEMO · Servicios, datos y colas.",
        displayOrder: 0,
        skills: [skills.node, skills.pg, skills.prisma, skills.py].map((s, i) => ({ ...s, id: `demo-sk-b${i}`, description: null, displayOrder: i })),
      },
      {
        id: "demo-cat-2",
        name: "Frontend",
        slug: "frontend",
        description: "DEMO · Interfaces y experiencias interactivas.",
        displayOrder: 1,
        skills: [skills.ts, skills.next, skills.three].map((s, i) => ({ ...s, id: `demo-sk-f${i}`, description: null, displayOrder: i })),
      },
      {
        id: "demo-cat-3",
        name: "Infraestructura",
        slug: "infraestructura",
        description: "DEMO · Contenedores y despliegue.",
        displayOrder: 2,
        skills: [skills.docker].map((s, i) => ({ ...s, id: `demo-sk-i${i}`, description: null, displayOrder: i })),
      },
    ],
    trace: {
      generatedAt: new Date().toISOString(),
      totalMs: 0,
      region: null,
      spans: [
        { name: "demo.fixtures", start: 0, duration: 0, rows: 4 },
      ],
    },
  };
}
