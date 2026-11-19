"use client";
import { useState } from "react";

import { dangerButtonClass } from "./styles";

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
      className={dangerButtonClass}
    >
      {pending ? "Eliminando…" : armed ? "Haz clic otra vez para confirmar" : "Eliminar"}
    </button>
  );
}
