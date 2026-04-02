import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DeleteProjectButton } from "./delete-project-button";
import { NewProjectButton } from "./new-project-button";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("el-GR");
}

export default async function ErgaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: projects } = await supabase
    .from("projects")
    .select("*, project_income(*), project_other_works(*)")
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
                  <th className="px-5 py-3 font-semibold text-zinc-600 dark:text-zinc-300">Έναρξη</th>
                  <th className="px-5 py-3 font-semibold text-zinc-600 dark:text-zinc-300">Ολοκλήρωση</th>
                  <th className="px-5 py-3 font-semibold text-zinc-600 dark:text-zinc-300">Τιμή/μ.</th>
                  <th className="px-5 py-3 font-semibold text-zinc-600 dark:text-zinc-300">Μερικό Σύνολο</th>
                  <th className="px-5 py-3 font-semibold text-zinc-600 dark:text-zinc-300">Γενικό Σύνολο</th>
                  <th className="px-5 py-3 font-semibold text-zinc-600 dark:text-zinc-300">Πληρωμές</th>
                  <th className="px-5 py-3 font-semibold text-zinc-600 dark:text-zinc-300">Υπόλοιπο</th>
                  <th className="px-5 py-3"></th>
                  <th className="w-10 px-2 py-3" aria-label="Διαγραφή" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {projects.map((project) => {
                  const meriko =
                    Number(project.price_per_meter) * (Number(project.price_metra) ?? 0) +
                    Number(project.sinazi ?? 0) * (Number(project.sinazi_metro) ?? 0) +
                    Number(project.gonies ?? 0) * (Number(project.gonies_metro) ?? 0);
                  const otherTotal = (project.project_other_works ?? []).reduce(
                    (s: number, r: { price: number }) => s + Number(r.price),
                    0
                  );
                  const geniko = meriko + otherTotal;
                  const paymentsTotal = (project.project_income ?? []).reduce(
                    (s: number, r: { amount: unknown; vat_percent?: number }) =>
                      s + Number(r.amount) * (1 + (r.vat_percent ?? 0) / 100),
                    0
                  );
                  const ypoloipo = geniko - paymentsTotal;
                  return (
                  <tr key={project.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-5 py-3.5 font-medium text-zinc-900 dark:text-zinc-100">
                      {project.customer_name}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">
                      {formatDate(project.start_date ?? project.created_at)}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">
                      {formatDate(project.completion_date)}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">
                      €{Number(project.price_per_meter).toLocaleString("el-GR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">
                      €{meriko.toLocaleString("el-GR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">
                      €{geniko.toLocaleString("el-GR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">
                      €{paymentsTotal.toLocaleString("el-GR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">
                      €{ypoloipo.toLocaleString("el-GR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/app/erga/${project.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                      >
                        Λεπτομέρειες →
                      </Link>
                    </td>
                    <td className="px-2 py-3.5">
                      <DeleteProjectButton id={project.id} name={project.customer_name ?? ""} />
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="space-y-3 md:hidden">
            {projects.map((project) => {
              const meriko =
                Number(project.price_per_meter) * (Number(project.price_metra) ?? 0) +
                Number(project.sinazi ?? 0) * (Number(project.sinazi_metro) ?? 0) +
                Number(project.gonies ?? 0) * (Number(project.gonies_metro) ?? 0);
              const otherTotal = (project.project_other_works ?? []).reduce(
                (s: number, r: { price: number }) => s + Number(r.price),
                0
              );
              const geniko = meriko + otherTotal;
              const paymentsTotal = (project.project_income ?? []).reduce(
                (s: number, r: { amount: unknown; vat_percent?: number }) =>
                  s + Number(r.amount) * (1 + (r.vat_percent ?? 0) / 100),
                0
              );
              const ypoloipo = geniko - paymentsTotal;
              return (
              <div
                key={project.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/app/erga/${project.id}`}
                    className="flex-1 font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {project.customer_name}
                  </Link>
                  <DeleteProjectButton id={project.id} name={project.customer_name ?? ""} />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Έναρξη: </span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {formatDate(project.start_date ?? project.created_at)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Ολοκλήρωση: </span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {formatDate(project.completion_date)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Μερικό Σύνολο: </span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      €{meriko.toLocaleString("el-GR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Γενικό Σύνολο: </span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      €{geniko.toLocaleString("el-GR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Πληρωμές: </span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      €{paymentsTotal.toLocaleString("el-GR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Υπόλοιπο: </span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      €{ypoloipo.toLocaleString("el-GR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
