import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { AlertIcon, ChevronDownIcon } from "./icons";
import { cn } from "./utils";

type FieldCommonProps = {
  label: string;
  name: string;
  id?: string;
  description?: string;
  error?: string;
  containerClassName?: string;
  className?: string;
};

type FieldControlOmissions =
  | "name"
  | "id"
  | "className"
  | "aria-describedby"
  | "aria-invalid";

type InputFieldProps = FieldCommonProps & {
  as?: "input";
} & Omit<ComponentPropsWithoutRef<"input">, FieldControlOmissions>;

type TextareaFieldProps = FieldCommonProps & {
  as: "textarea";
} & Omit<ComponentPropsWithoutRef<"textarea">, FieldControlOmissions>;

type SelectFieldProps = FieldCommonProps & {
  as: "select";
  options: ReadonlyArray<{ value: string; label: string }>;
} & Omit<
    ComponentPropsWithoutRef<"select">,
    FieldControlOmissions | "children" | "multiple"
  >;

export type FieldProps = InputFieldProps | TextareaFieldProps | SelectFieldProps;

const controlClasses =
  "w-full rounded-control border border-[var(--border-strong)] bg-transparent text-fg placeholder:text-fg-muted transition-colors duration-fast ease-standard focus:border-[var(--focus)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus disabled:cursor-not-allowed disabled:bg-surface-raised disabled:text-fg-disabled aria-[invalid=true]:border-[var(--status-danger)]";

function fieldId(name: string, id?: string): string {
  return id ?? name.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function describedBy(
  id: string,
  description?: string,
  error?: string,
): string | undefined {
  const ids = [
    description ? `${id}-description` : null,
    error ? `${id}-error` : null,
  ].filter(Boolean);

  return ids.length > 0 ? ids.join(" ") : undefined;
}

function FieldShell({
  id,
  label,
  description,
  error,
  required,
  containerClassName,
  children,
}: {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  containerClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex w-full flex-col gap-2", containerClassName)}>
      <label
        htmlFor={id}
        className="font-mono text-2xs font-medium uppercase tracking-[0.08em] text-fg-muted"
      >
        {label}
        {required ? (
          <>
            <span aria-hidden="true" className="ml-1 text-[var(--status-danger)]">
              *
            </span>
            <span className="sr-only"> (obligatorio)</span>
          </>
        ) : null}
      </label>
      {children}
      {description ? (
        <p id={`${id}-description`} className="text-xs text-fg-muted">
          {description}
        </p>
      ) : null}
      {error ? (
        <p
          id={`${id}-error`}
          aria-live="polite"
          className="flex items-start gap-1.5 text-[13px] leading-snug text-[var(--status-danger)]"
        >
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

function InputField(props: InputFieldProps) {
  const {
    as: _as,
    label,
    name,
    id,
    description,
    error,
    containerClassName,
    className,
    ...controlProps
  } = props;
  void _as;

  const resolvedId = fieldId(name, id);

  return (
    <FieldShell
      id={resolvedId}
      label={label}
      description={description}
      error={error}
      required={controlProps.required}
      containerClassName={containerClassName}
    >
      <input
        id={resolvedId}
        name={name}
        className={cn(controlClasses, "h-11 px-3 text-sm", className)}
        aria-describedby={describedBy(resolvedId, description, error)}
        aria-invalid={error ? true : undefined}
        {...controlProps}
      />
    </FieldShell>
  );
}

function TextareaField(props: TextareaFieldProps) {
  const {
    as: _as,
    label,
    name,
    id,
    description,
    error,
    containerClassName,
    className,
    rows = 4,
    ...controlProps
  } = props;
  void _as;

  const resolvedId = fieldId(name, id);

  return (
    <FieldShell
      id={resolvedId}
      label={label}
      description={description}
      error={error}
      required={controlProps.required}
      containerClassName={containerClassName}
    >
      <textarea
        id={resolvedId}
        name={name}
        rows={rows}
        className={cn(
          controlClasses,
          "min-h-30 resize-y px-3 py-2.5 text-sm",
          className,
        )}
        aria-describedby={describedBy(resolvedId, description, error)}
        aria-invalid={error ? true : undefined}
        {...controlProps}
      />
    </FieldShell>
  );
}

function SelectField(props: SelectFieldProps) {
  const {
    as: _as,
    label,
    name,
    id,
    description,
    error,
    containerClassName,
    className,
    options,
    ...controlProps
  } = props;
  void _as;

  const resolvedId = fieldId(name, id);

  return (
    <FieldShell
      id={resolvedId}
      label={label}
      description={description}
      error={error}
      required={controlProps.required}
      containerClassName={containerClassName}
    >
      <div className="relative">
        <select
          id={resolvedId}
          name={name}
          className={cn(
            controlClasses,
            "h-11 appearance-none px-3 pr-9 text-sm",
            className,
          )}
          aria-describedby={describedBy(resolvedId, description, error)}
          aria-invalid={error ? true : undefined}
          {...controlProps}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-fg-muted" />
      </div>
    </FieldShell>
  );
}

export function Field(props: FieldProps) {
  if (props.as === "textarea") {
    return <TextareaField {...props} />;
  }

  if (props.as === "select") {
    return <SelectField {...props} />;
  }

  return <InputField {...props} />;
}
