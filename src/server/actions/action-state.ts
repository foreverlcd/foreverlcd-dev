export type ActionState =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors: Record<string, string[]> };

export const initialActionState: ActionState = { ok: false, message: "", fieldErrors: {} };

type ValidationIssue = { path: PropertyKey[]; message: string };

export function validationFailure(error: { issues: ValidationIssue[] }): ActionState {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "general");
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return { ok: false, message: "Revisa los campos marcados.", fieldErrors };
}

export function failure(message: string): ActionState {
  return { ok: false, message, fieldErrors: {} };
}

export function readForm(formData: FormData) {
  return Object.fromEntries(formData.entries());
}
