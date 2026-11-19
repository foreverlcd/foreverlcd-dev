import Link from "next/link";

import { SkillIcon } from "./skill-icon";

type Props = { skill: { name: string; slug: string; icon: string | null } };

export function SkillChip({ skill }: Props) {
  return (
    <Link
      href={`/stack/${skill.slug}`}
      className="inline-flex min-h-9 items-center gap-2 border border-(--line) px-3 font-mono text-xs uppercase tracking-wider text-(--ash) transition-colors hover:border-(--signal) hover:text-(--signal)"
    >
      <SkillIcon icon={skill.icon} />
      {skill.name}
    </Link>
  );
}
