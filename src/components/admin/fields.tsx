import { inputClass } from "./styles";

type BaseProps = { name: string; label: string; className?: string };

export function TextField({
  name,
  label,
  defaultValue,
  type = "text",
  required,
  placeholder,
  className = "",
}: BaseProps & {
  defaultValue?: string | number | null;
  type?: "text" | "url" | "email" | "date" | "number";
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className={`grid gap-1 font-mono text-xs uppercase tracking-wider text-fg-muted ${className}`}>
      {label}
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        className={inputClass}
      />
    </label>
  );
}

export function TextAreaField({
  name,
  label,
  defaultValue,
  required,
  rows = 4,
  className = "",
}: BaseProps & { defaultValue?: string | null; required?: boolean; rows?: number }) {
  return (
    <label className={`grid gap-1 font-mono text-xs uppercase tracking-wider text-fg-muted ${className}`}>
      {label}
      <textarea
        name={name}
        required={required}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        className={inputClass}
      />
    </label>
  );
}

export function SelectField({
  name,
  label,
  options,
  defaultValue,
  required,
  className = "",
}: BaseProps & {
  options: readonly { value: string; label: string }[];
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className={`grid gap-1 font-mono text-xs uppercase tracking-wider text-fg-muted ${className}`}>
      {label}
      <select name={name} required={required} defaultValue={defaultValue ?? ""} className={inputClass}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CheckField({
  name,
  label,
  defaultChecked,
  className = "",
}: BaseProps & { defaultChecked?: boolean }) {
  return (
    <label className={`flex min-h-10 items-center gap-2 font-mono text-xs uppercase tracking-wider ${className}`}>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 accent-[#d4ff3a]" />
      {label}
    </label>
  );
}
