import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/server/auth/require-admin";

const links = [
  ["Resumen", "/admin"],
  ["Perfil", "/admin/perfil"],
  ["Redes", "/admin/redes"],
  ["Proyectos", "/admin/proyectos"],
  ["Skills", "/admin/skills"],
  ["Experiencia", "/admin/experiencia"],
  ["Formación", "/admin/formacion"],
];

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text";

async function signOut() {
  "use server";
  const { headers } = await import("next/headers");
  const { auth } = await import("@/lib/auth");
  await auth.api.signOut({ headers: await headers() });
  redirect("/admin/login");
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) return <>{children}</>;

  return (
    <div data-surface="ink" className="min-h-screen bg-surface text-fg">
      <header className="border-b border-rule bg-surface-raised p-4 md:hidden">
        <nav aria-label="Administración" className="flex flex-wrap gap-2">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className={`rounded px-3 py-1 text-fg-muted ${focusRing}`}>
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <aside
        className="fixed inset-y-0 left-0 hidden w-64 border-r border-rule bg-surface-raised p-6 md:block"
      >
        <Link className={`font-display text-2xl ${focusRing}`} href="/admin">
          foreverlcd
        </Link>
        <nav aria-label="Administración" className="mt-10 grid gap-2">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className={`rounded px-3 py-2 text-fg-muted hover:bg-ink-800 hover:text-fg ${focusRing}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <form action={signOut} className="mt-10">
          <button className={`text-sm text-fg-muted ${focusRing}`}>Cerrar sesión</button>
        </form>
      </aside>
      <main className="mx-auto max-w-6xl px-5 py-10 md:ml-64 md:px-10">{children}</main>
    </div>
  );
}
