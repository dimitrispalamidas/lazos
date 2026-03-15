import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NewProjectButton } from "./new-project-button";

export default async function ErgaPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");

  const { data: projects } = await supabase
    .from("projects")
    .select("*, project_income(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Έργα
        </h1>
        <NewProjectButton />
      </div>

      {(!projects || projects.length === 0) ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            Δεν υπάρχουν έργα ακόμα. Πάτα &quot;Νέο Έργο&quot; για να ξεκινήσεις.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm md:block dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                <tr>
                  <th className="px-5 py-3 font-semibold text-zinc-600 dark:text-zinc-300">Πελάτης</th>
                  <th className="px-5 py-3 font-semibold text-zinc-600 dark:text-zinc-300">Τιμή/μ.</th>
                  <th className="px-5 py-3 font-semibold text-zinc-600 dark:text-zinc-300">Οφειλή</th>
                  <th className="px-5 py-3 font-semibold text-zinc-600 dark:text-zinc-300">Έσοδα</th>
                  <th className="px-5 py-3 font-semibold text-zinc-600 dark:text-zinc-300">Εξοδα εργου</th>
                  <th className="px-5 py-3 font-semibold text-zinc-600 dark:text-zinc-300">Προκαταβολή</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {projects.map((project) => (
                  <tr key={project.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-5 py-3.5 font-medium text-zinc-900 dark:text-zinc-100">
                      {project.customer_name}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">
                      €{Number(project.price_per_meter).toLocaleString("el-GR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">
                      €{Number(project.owed).toLocaleString("el-GR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">
                      €{((project.project_income ?? []).reduce((s: number, r: { amount: unknown; vat_percent?: number }) => s + Number(r.amount) * (1 + (r.vat_percent ?? 0) / 100), 0)).toLocaleString("el-GR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">
                      €{Number(project.project_expenses ?? 0).toLocaleString("el-GR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">
                      €{Number(project.advance).toLocaleString("el-GR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/app/erga/${project.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                      >
                        Λεπτομέρειες →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="space-y-3 md:hidden">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/app/erga/${project.id}`}
                className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {project.customer_name}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Οφειλή: </span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      €{Number(project.owed).toLocaleString("el-GR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Έσοδα: </span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      €{((project.project_income ?? []).reduce((s: number, r: { amount: unknown; vat_percent?: number }) => s + Number(r.amount) * (1 + (r.vat_percent ?? 0) / 100), 0)).toLocaleString("el-GR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Εξοδα: </span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      €{Number(project.project_expenses ?? 0).toLocaleString("el-GR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
