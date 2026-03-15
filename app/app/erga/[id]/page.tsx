import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ExportProjectPdfButton } from "./export-project-pdf-button";
import { ProjectDetailForm } from "./project-detail-form";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("*, project_income(*), project_other_works(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/app/erga"
          className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Πίσω
        </Link>
        <ExportProjectPdfButton project={project} />
      </div>

      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {project.customer_name}
      </h1>

      <ProjectDetailForm project={project} />

      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        Δημιουργήθηκε: {new Date(project.created_at).toLocaleDateString("el-GR")}
      </p>
    </div>
  );
}
