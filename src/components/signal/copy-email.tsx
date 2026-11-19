"use client";

import { useEffect, useState } from "react";

/** Botón mínimo: copia el correo al portapapeles y lo anuncia ("Copiado") a lectores de pantalla. */
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    navigator.clipboard?.writeText(email).then(
      () => setCopied(true),
      () => undefined,
    );
  };

  return (
    <>
      <button type="button" className="sg-cta sg-cta-ghost" onClick={copy}>
        {copied ? "Copiado" : "Copiar correo"}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Copiado" : ""}
      </span>
    </>
  );
}
