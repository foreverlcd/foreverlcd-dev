"use client";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  type FormEvent,
  type ReactNode,
} from "react";
import { initialActionState, type ActionState } from "@/server/actions/action-state";
import { primaryButtonClass } from "./styles";

type ActionFormProps = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children: ReactNode;
  className?: string;
  submitLabel?: string;
  pendingLabel?: string;
  resetOnSuccess?: boolean;
};

export function ActionForm({
  action,
  children,
  className,
  submitLabel = "Guardar",
  pendingLabel = "Guardando…",
  resetOnSuccess = false,
}: ActionFormProps) {
  const [state, dispatch, pending] = useActionState(action, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (resetOnSuccess && state.ok) formRef.current?.reset();
  }, [state, resetOnSuccess]);

  // Submitting through a transition keeps typed values when validation fails
  // (React would otherwise reset an uncontrolled form after every action).
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => dispatch(data));
  }

  const errors = state.ok ? [] : [...new Set(Object.values(state.fieldErrors).flat())];

  return (
    <form ref={formRef} onSubmit={onSubmit} className={className}>
      {children}
      {state.message && (
        <div role={state.ok ? "status" : "alert"} className={state.ok ? "text-green-300" : "text-red-300"}>
          <p>{state.message}</p>
          {errors.length > 0 && (
            <ul className="list-disc pl-5 text-sm">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      <button disabled={pending} type="submit" className={primaryButtonClass}>
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
