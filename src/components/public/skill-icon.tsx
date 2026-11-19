import Image from "next/image";

export type IconKind = "image" | "glyph" | "none";

const CLOUDINARY = "https://res.cloudinary.com/";

/** Regla de Skill.icon (docs/product/SPEC.md): URL de Cloudinary → imagen; texto ≤ 4 caracteres → glifo; otro valor → nada. */
export function iconKind(icon: string | null | undefined): IconKind {
  const value = icon?.trim();
  if (!value) return "none";
  if (value.startsWith(CLOUDINARY)) return "image";
  if ([...value].length <= 4) return "glyph";
  return "none";
}

export function SkillIcon({ icon, size = 20 }: { icon: string | null | undefined; size?: number }) {
  const kind = iconKind(icon);
  if (kind === "none" || !icon) return null;
  if (kind === "image") {
    return (
      <Image
        src={icon.trim()}
        alt=""
        width={size}
        height={size}
        className="shrink-0 object-contain"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span aria-hidden="true" className="shrink-0 text-center leading-none" style={{ width: size }}>
      {icon.trim()}
    </span>
  );
}
