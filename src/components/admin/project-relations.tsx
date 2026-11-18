"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { inputClass, secondaryButtonClass } from "./styles";

type SkillOption = { id: string; name: string; category: string };
type RepositoryType = "BACKEND" | "FRONTEND" | "OTHER";
type Repository = { type: RepositoryType; url: string };
type RepositoryRow = Repository & { key: number };

const repositoryTypes: { value: RepositoryType; label: string }[] = [
  { value: "BACKEND", label: "Backend" },
  { value: "FRONTEND", label: "Frontend" },
  { value: "OTHER", label: "Otro" },
];

type ProjectRelationsProps = {
  skills: SkillOption[];
  initialSkillIds: string[];
  initialRepositories: Repository[];
};

/** Skills (checkboxes) and repositories (editable rows) of a project; serialised into hidden JSON fields. */
export function ProjectRelations({ skills, initialSkillIds, initialRepositories }: ProjectRelationsProps) {
  const nextKey = useRef(initialRepositories.length);
  const [selected, setSelected] = useState<string[]>(initialSkillIds);
  const [rows, setRows] = useState<RepositoryRow[]>(
    initialRepositories.map((repository, key) => ({ ...repository, key })),
  );

  function toggleSkill(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  function updateRow(key: number, patch: Partial<Repository>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function moveRow(index: number, offset: number) {
    setRows((current) => {
      const target = index + offset;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  const repositories = rows
    .filter((row) => row.url.trim())
    .map(({ type, url }) => ({ type, url: url.trim() }));
  // Keep the catalogue order so the stored order is stable.
  const orderedSelection = skills.filter((skill) => selected.includes(skill.id)).map((skill) => skill.id);

  return (
    <>
      <input type="hidden" name="skillIds" value={JSON.stringify(orderedSelection)} />
      <input type="hidden" name="repositories" value={JSON.stringify(repositories)} />

      <fieldset className="grid gap-2">
        <legend className="text-sm">Habilidades del proyecto</legend>
        {skills.length === 0 ? (
          <p className="text-sm text-fg-muted">
            Aún no hay habilidades.{" "}
            <Link href="/admin/skills" className="underline">
              Crea la primera
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {skills.map((skill) => (
              <label key={skill.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4"
                  checked={selected.includes(skill.id)}
                  onChange={() => toggleSkill(skill.id)}
                />
                {skill.name}
                <span className="text-fg-muted">({skill.category})</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="text-sm">Repositorios</legend>
        {rows.length === 0 && <p className="text-sm text-fg-muted">Sin repositorios.</p>}
        {rows.map((row, index) => (
          <div key={row.key} className="flex flex-wrap items-end gap-2">
            <label className="grid gap-1 text-sm">
              Tipo
              <select
                value={row.type}
                onChange={(event) => updateRow(row.key, { type: event.target.value as RepositoryType })}
                className={inputClass}
              >
                {repositoryTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid min-w-64 flex-1 gap-1 text-sm">
              URL del repositorio
              <input
                type="url"
                value={row.url}
                onChange={(event) => updateRow(row.key, { url: event.target.value })}
                className={inputClass}
              />
            </label>
            <button
              type="button"
              disabled={index === 0}
              onClick={() => moveRow(index, -1)}
              className={secondaryButtonClass}
            >
              Subir
            </button>
            <button
              type="button"
              disabled={index === rows.length - 1}
              onClick={() => moveRow(index, 1)}
              className={secondaryButtonClass}
            >
              Bajar
            </button>
            <button
              type="button"
              onClick={() => setRows((current) => current.filter((item) => item.key !== row.key))}
              className={`${secondaryButtonClass} text-red-300`}
            >
              Quitar
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setRows((current) => [...current, { key: nextKey.current++, type: "OTHER", url: "" }])
          }
          className={secondaryButtonClass}
        >
          Añadir repositorio
        </button>
      </fieldset>
    </>
  );
}
