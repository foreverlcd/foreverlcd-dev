import type { ActionState } from "@/server/actions/action-state";
import { InlineForm } from "./inline-form";

type MoveButtonsProps = {
  action: (formData: FormData) => Promise<ActionState>;
  ids: string[];
  index: number;
  /** Extra hidden fields, e.g. the model for the shared timeline reorder action. */
  fields?: Record<string, string>;
};

function swap(ids: string[], index: number, offset: number) {
  const target = index + offset;
  if (target < 0 || target >= ids.length) return ids;
  const next = [...ids];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function MoveButtons({ action, ids, index, fields = {} }: MoveButtonsProps) {
  return (
    <>
      <InlineForm
        action={action}
        fields={{ ...fields, ids: JSON.stringify(swap(ids, index, -1)) }}
        label="Subir"
        pendingLabel="…"
        disabled={index === 0}
      />
      <InlineForm
        action={action}
        fields={{ ...fields, ids: JSON.stringify(swap(ids, index, 1)) }}
        label="Bajar"
        pendingLabel="…"
        disabled={index === ids.length - 1}
      />
    </>
  );
}
