"use client";
import { startTransition, useActionState, type FormEvent, type ReactNode } from "react";
import type { ActionState } from "@/server/actions/action-state";
import { ConfirmDeleteButton } from "./confirm-delete-button";
import { secondaryButtonClass } from "./styles";

type InlineFormProps = {
  action: (formData: FormData) => Promise<ActionState>;
  /** Hidden fields sent with the form (id, model, ids, ...). */
  fields?: Record<string, string>;
  /** Extra visible inputs (for example an alt text). */
  children?: ReactNode;
  label: string;
  pendingLabel?: string;
  /** Renders the two-click delete button instead of a regular one. */
  destructive?: boolean;
  disabled?: boolean;
  className?: string;
};

/** A small form that runs one server action and reports its ActionState message. */
export function InlineForm({
  action,
  fields = {},
  children,
  label,
  pendingLabel = "Guardando…",
  destructive = false,
  disabled = false,
  className = "flex flex-wrap items-center gap-2",
}: InlineFormProps) {
  const [state, dispatch, pending] = useActionState(
    (_previous: ActionState | null, formData: FormData) => action(formData),
    null as ActionState | null,
  );

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => dispatch(data));
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      {children}
      {destructive ? (
        <ConfirmDeleteButton pending={pending} />
      ) : (
        <button type="submit" disabled={disabled || pending} className={secondaryButtonClass}>
          {pending ? pendingLabel : label}
        </button>
      )}
      {state?.message && (
        <span
          role={state.ok ? "status" : "alert"}
          className={`text-sm ${state.ok ? "text-green-300" : "text-red-300"}`}
        >
          {state.message}
        </span>
      )}
    </form>
  );
}
