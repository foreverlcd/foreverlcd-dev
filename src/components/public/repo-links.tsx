const LABEL: Record<string, string> = {
  BACKEND: "Backend",
  FRONTEND: "Frontend",
  OTHER: "Código",
};

type Props = { repositories: { type: string; url: string }[]; className?: string };

export function RepoLinks({ repositories, className = "" }: Props) {
  if (repositories.length === 0) return null;
  return (
    <ul className={`flex flex-wrap gap-x-5 gap-y-1 ${className}`} aria-label="Repositorios">
      {repositories.map((repo) => (
        <li key={`${repo.type}-${repo.url}`}>
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center border-b border-(--line) font-mono text-xs uppercase tracking-widest text-(--ink) hover:border-(--signal) hover:text-(--signal)"
          >
            {LABEL[repo.type] ?? "Código"} ↗
          </a>
        </li>
      ))}
    </ul>
  );
}
