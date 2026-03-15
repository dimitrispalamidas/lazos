import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NewEntryButton } from "./new-entry-button";

type IncomeRow =
  | {
      type: "project";
      id: string;
      label: string;
      amountWithoutVat: number;
      amountWithVat: number;
      date: string;
      href: string;
    }
  | {
      type: "manual";
      id: string;
      label: string;
      amountWithoutVat: number;
      amountWithVat: number;
      date: string;
    };

export default async function EsodaPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");

  const [projectsRes, incomeRes] = await Promise.all([
    supabase
      .from("projects")
      .select("id, customer_name, created_at, project_income(amount, vat_percent)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("income")
      .select("id, amount, description, date")
      .eq("user_id", user.id)
      .order("date", { ascending: false }),
  ]);

  const projects = projectsRes.data ?? [];
  const manualIncome = incomeRes.data ?? [];

  const projectRows: IncomeRow[] = projects.map((p) => {
    const incomeRows = (p.project_income ?? []) as { amount: number; vat_percent: number | null }[];
    const amountWithoutVat = incomeRows.reduce((s, r) => s + Number(r.amount), 0);
    const amountWithVat = incomeRows.reduce(
      (s, r) => s + Number(r.amount) * (1 + (r.vat_percent ?? 0) / 100),
      0
    );
    return {
      type: "project",
      id: `project-${p.id}`,
      label: p.customer_name,
      amountWithoutVat,
      amountWithVat,
      date: p.created_at,
      href: `/app/erga/${p.id}`,
    };
  });

  const manualRows: IncomeRow[] = manualIncome.map((r) => {
    const amt = Number(r.amount);
    return {
      type: "manual",
      id: r.id,
      label: r.description || "—",
      amountWithoutVat: amt,
      amountWithVat: amt,
      date: r.date,
    };
  });

  const allRows: IncomeRow[] = [
    ...projectRows.filter((r) => r.amountWithVat > 0 || r.amountWithoutVat > 0),
    ...manualRows,
  ].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalWithoutVat = allRows.reduce((s, r) => s + r.amountWithoutVat, 0);
  const totalWithVat = allRows.reduce((s, r) => s + r.amountWithVat, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Έσοδα
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Έσοδα (χωρίς ΦΠΑ): €{totalWithoutVat.toLocaleString("el-GR", { minimumFractionDigits: 2 })} · Έσοδα (+ ΦΠΑ): €{totalWithVat.toLocaleString("el-GR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <NewEntryButton />
      </div>

      {allRows.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            Δεν υπάρχουν έσοδα. Προσθήκη από το &quot;Έσοδα&quot; στα έργα ή
            &quot;+ Νέο Έσοδο&quot; για διάφορα.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm md:block dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                <tr>
                  <th className="px-5 py-3 font-semibold text-zinc-600 dark:text-zinc-300">
                    Πηγή
                  </th>
                  <th className="px-5 py-3 font-semibold text-zinc-600 dark:text-zinc-300">
                    Έργο / Αιτιολογία
                  </th>
                  <th className="px-5 py-3 font-semibold text-zinc-600 dark:text-zinc-300">
                    Ημερομηνία
                  </th>
                  <th className="px-5 py-3 font-semibold text-zinc-600 dark:text-zinc-300 text-right">
                    Έσοδα (χωρίς ΦΠΑ)
                  </th>
                  <th className="px-5 py-3 font-semibold text-zinc-600 dark:text-zinc-300 text-right">
                    Έσοδα (+ ΦΠΑ)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {allRows.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          row.type === "project"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {row.type === "project" ? "Από έργο" : "Διάφορα"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-900 dark:text-zinc-100">
                      {row.type === "project" ? (
                        <Link
                          href={row.href}
                          className="font-medium hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {row.label}
                        </Link>
                      ) : (
                        row.label
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">
                      {new Date(row.date).toLocaleDateString("el-GR")}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-green-700 dark:text-green-400">
                      €
                      {row.amountWithoutVat.toLocaleString("el-GR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-green-700 dark:text-green-400">
                      €
                      {row.amountWithVat.toLocaleString("el-GR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {allRows.map((row) => (
              <div
                key={row.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      row.type === "project"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {row.type === "project" ? "Από έργο" : "Διάφορα"}
                  </span>
                  <span className="text-right text-sm">
                    <span className="text-zinc-500 dark:text-zinc-400">χ. ΦΠΑ: </span>
                    <span className="font-semibold text-green-700 dark:text-green-400">
                      €{row.amountWithoutVat.toLocaleString("el-GR", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="mx-1 text-zinc-400">·</span>
                    <span className="text-zinc-500 dark:text-zinc-400">+ ΦΠΑ: </span>
                    <span className="font-semibold text-green-700 dark:text-green-400">
                      €{row.amountWithVat.toLocaleString("el-GR", { minimumFractionDigits: 2 })}
                    </span>
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                  {row.type === "project" ? (
                    <Link
                      href={row.href}
                      className="font-medium hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {row.label}
                    </Link>
                  ) : (
                    row.label
                  )}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(row.date).toLocaleDateString("el-GR")}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
