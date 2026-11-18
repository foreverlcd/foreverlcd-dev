import { CheckField, SelectField, TextAreaField, TextField } from "./fields";
import { ProjectRelations } from "./project-relations";

export type ProjectFieldsProject = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  demoUrl: string | null;
  status: "DRAFT" | "PUBLISHED";
  isFeatured: boolean;
  displayOrder: number;
  startDate: Date | null;
  endDate: Date | null;
  skills: { skillId: string }[];
  repositories: { type: "BACKEND" | "FRONTEND" | "OTHER"; url: string }[];
};

type ProjectFieldsProps = {
  project?: ProjectFieldsProject;
  skills: { id: string; name: string; category: string }[];
};

const statusOptions = [
  { value: "DRAFT", label: "Borrador" },
  { value: "PUBLISHED", label: "Publicado" },
];

function dateValue(date: Date | null | undefined) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export function ProjectFields({ project, skills }: ProjectFieldsProps) {
  return (
    <>
      <TextField name="title" label="Título" defaultValue={project?.title} required />
      <TextField name="slug" label="Slug (opcional)" defaultValue={project?.slug} />
      <TextField
        name="shortDescription"
        label="Descripción breve"
        defaultValue={project?.shortDescription}
        required
      />
      <TextAreaField
        name="description"
        label="Descripción"
        defaultValue={project?.description}
        rows={8}
        required
      />
      <TextField name="demoUrl" label="URL de la demo" type="url" defaultValue={project?.demoUrl} />
      <SelectField
        name="status"
        label="Estado"
        options={statusOptions}
        defaultValue={project?.status ?? "DRAFT"}
      />
      <CheckField name="isFeatured" label="Destacado" defaultChecked={project?.isFeatured} />
      <TextField
        name="displayOrder"
        label="Orden"
        type="number"
        defaultValue={project?.displayOrder ?? 0}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="startDate"
          label="Fecha inicial"
          type="date"
          defaultValue={dateValue(project?.startDate)}
        />
        <TextField
          name="endDate"
          label="Fecha final"
          type="date"
          defaultValue={dateValue(project?.endDate)}
        />
      </div>
      <ProjectRelations
        skills={skills}
        initialSkillIds={project?.skills.map((skill) => skill.skillId) ?? []}
        initialRepositories={project?.repositories.map(({ type, url }) => ({ type, url })) ?? []}
      />
    </>
  );
}
