"use client";
import { useState } from "react";

const className =
  "px-2 py-1 text-sm text-red-300 underline disabled:opacity-50 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text";

type ConfirmDeleteButtonProps = { pending?: boolean };

/** Two-click confirmation (no native dialogs). The second click submits the parent form. */
export function ConfirmDeleteButton({ pending = false }: ConfirmDeleteButtonProps) {
  const [armed, setArmed] = useState(false);

  function onClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (armed) return;
    event.preventDefault();
    setArmed(true);
  }

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={onClick}
      onBlur={() => setArmed(false)}
      className={className}
    >
      {pending ? "Eliminando…" : armed ? "Haz clic otra vez para confirmar" : "Eliminar"}
    </button>
  );
}
