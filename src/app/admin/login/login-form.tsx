"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

import { inputClass, primaryButtonClass } from "@/components/admin/styles";

export default function LoginForm() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function submit(formData: FormData) {
    setPending(true);
    setError("");
    const result = await authClient.signIn.email({
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    });
    setPending(false);
    if (result.error) {
      setError("No se pudo iniciar sesión. Comprueba tus credenciales.");
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <form action={submit} className="mt-8 grid gap-5">
      <label className="grid gap-2 font-mono text-xs uppercase tracking-wider text-fg-muted">
        Correo
        <input
          required
          type="email"
          name="email"
          autoComplete="username"
          className={inputClass}
        />
      </label>
      <label className="grid gap-2 font-mono text-xs uppercase tracking-wider text-fg-muted">
        Contraseña
        <input
          required
          type="password"
          name="password"
          autoComplete="current-password"
          className={inputClass}
        />
      </label>
      {error && (
        <p role="alert" className="font-mono text-xs uppercase tracking-wider text-status-danger">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className={`${primaryButtonClass} min-h-11 w-full justify-center`}
      >
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
