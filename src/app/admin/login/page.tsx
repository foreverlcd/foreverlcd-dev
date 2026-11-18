import { redirect } from "next/navigation";
import { getAdminSession } from "@/server/auth/require-admin";
import LoginForm from "./login-form";

export default async function LoginPage() {
  if (await getAdminSession()) redirect("/admin");

  return (
    <main
      data-surface="ink"
      className="grid min-h-screen place-items-center bg-surface px-5 text-fg"
    >
      <section className="w-full max-w-md rounded-[2px] border border-rule bg-surface-raised p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-accent-text">
          <span aria-hidden>■ </span>ACCESO RESTRINGIDO
        </p>
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">Iniciar sesión</h1>
        <LoginForm />
      </section>
    </main>
  );
}
