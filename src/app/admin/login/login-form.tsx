"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const inputClass = "border border-rule bg-ink-900 px-3 py-2 text-base";

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
      <label className="grid gap-2 text-sm">
        Correo
        <input
          required
          type="email"
          name="email"
          autoComplete="username"
          className={inputClass}
        />
      </label>
      <label className="grid gap-2 text-sm">
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
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="bg-paper-100 px-4 py-3 font-medium text-ink-950 disabled:opacity-50"
      >
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
