import Link from "next/link";
import { redirect } from "next/navigation";
import { MobileNav } from "@/components/admin/mobile-nav";
import { NavLink } from "@/components/admin/nav-link";
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

function Brand() {
  return (
    <Link
      className={`inline-flex min-h-11 items-center gap-2 font-mono text-xs uppercase tracking-widest ${focusRing}`}
      href="/admin"
    >
      <span aria-hidden className="text-accent-text">
        ■
      </span>
      N.A / ADMIN
    </Link>
  );
}

function SignOut() {
  return (
    <form action={signOut}>
      <button
        className={`min-h-11 px-3 font-mono text-xs uppercase tracking-widest text-fg-muted hover:text-status-danger ${focusRing}`}
      >
        Cerrar sesión
      </button>
    </form>
  );
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) return <>{children}</>;

  const items = links.map(([label, href], index) => (
    <NavLink key={href} href={href} index={String(index + 1).padStart(2, "0")} label={label} />
  ));

  return (
    <div data-surface="ink" className="min-h-screen bg-surface text-fg">
      <header className="sticky top-0 z-20 border-b border-rule bg-surface md:hidden">
        <div className="flex items-center justify-between px-2">
          <Brand />
          <Link
            href="/"
            target="_blank"
            className={`flex min-h-11 items-center px-3 font-mono text-xs uppercase tracking-widest text-accent-text ${focusRing}`}
          >
            Ver web ↗
          </Link>
        </div>
        <MobileNav>
          {items}
          <SignOut />
        </MobileNav>
      </header>
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-rule bg-surface p-5 md:flex">
        <Brand />
        <nav aria-label="Administración" className="mt-8 grid gap-1">
          {items}
        </nav>
        <div className="mt-auto grid gap-1 border-t border-rule pt-4">
          <Link
            href="/"
            target="_blank"
            className={`flex min-h-11 items-center px-3 font-mono text-xs uppercase tracking-widest text-accent-text ${focusRing}`}
          >
            Ver web ↗
          </Link>
          <SignOut />
        </div>
      </aside>
      <main className="md:pl-60">
        <div className="mx-auto max-w-[1100px] px-5 py-8 md:px-10 md:py-10">{children}</div>
      </main>
    </div>
  );
}
