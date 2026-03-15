import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { MonthFilter } from "./month-filter";
import { NewExpenseButton } from "./new-expense-button";
import { DeleteExpenseButton } from "./delete-expense-button";

type ExpenseRow =
  | {
      type: "project";
      id: string;
      label: string;
      amount: number;
      date: string;
      href: string;
    }
  | {
      type: "manual";
      id: string;
      label: string;
      amount: number;
      date: string;
    };

type PageProps = { searchParams: Promise<{ month?: string }> };

export default async function ExodaPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");

  const { month: monthParam } = await searchParams;

  const [projectsRes, expensesRes] = await Promise.all([
    supabase
      .from("projects")
      .select("id, customer_name, project_expenses, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("expenses")
      .select("id, amount, description, date")
      .eq("user_id", user.id)
      .order("date", { ascending: false }),
  ]);

  const projects = projectsRes.data ?? [];
  const manualExpenses = expensesRes.data ?? [];

  const projectRows: ExpenseRow[] = projects.map((p) => ({
    type: "project",
    id: `project-${p.id}`,
    label: p.customer_name,
    amount: Number(p.project_expenses ?? 0),
    date: p.created_at,
    href: `/app/erga/${p.id}`,
  }));

  const manualRows: ExpenseRow[] = manualExpenses.map((r) => ({
    type: "manual",
    id: r.id,
    label: r.description || "—",
    amount: Number(r.amount),
    date: r.date,
  }));

  let allRows: ExpenseRow[] = [
    ...projectRows.filter((r) => r.amount > 0),
    ...manualRows,
  ].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (monthParam) {
    const [y, m] = monthParam.split("-").map(Number);
    allRows = allRows.filter((r) => {
      const d = new Date(r.date);
      return d.getFullYear() === y && d.getMonth() + 1 === m;
    });
  }

  const totalFromProjects = projectRows.reduce((s, r) => s + r.amount, 0);
  const totalFromManual = manualRows.reduce((s, r) => s + r.amount, 0);
  const total = totalFromProjects + totalFromManual;
  const displayTotal = monthParam ? allRows.reduce((s, r) => s + r.amount, 0) : total;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Έξοδα
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Από έργα (Εξοδα εργου) + χειροκίνητα. Σύνολο: €
            {displayTotal.toLocaleString("el-GR", { minimumFractionDigits: 2 })}
            {monthParam ? ` (μήνας)` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Suspense fallback={<span className="text-sm text-zinc-400">Μήνας...</span>}>
            <MonthFilter basePath="/app/exoda" />
          </Suspense>
          <NewExpenseButton />
        </div>
      </div>

      {allRows.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            Δεν υπάρχουν έξοδα. Προσθήκη από το &quot;Εξοδα εργου&quot; στα έργα ή
            &quot;+ Νέο Έξοδο&quot; για διάφορα.
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
                    Ποσό
                  </th>
                  <th className="w-10 px-2 py-3" aria-label="Διαγραφή" />
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
                    <td className="px-5 py-3.5 text-right font-medium text-red-700 dark:text-red-400">
                      €
                      {row.amount.toLocaleString("el-GR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-2 py-3.5">
                      {row.type === "manual" ? (
                        <DeleteExpenseButton id={row.id} />
                      ) : null}
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
                  <span className="font-semibold text-red-700 dark:text-red-400">
                    €
                    {row.amount.toLocaleString("el-GR", {
                      minimumFractionDigits: 2,
                    })}
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
                {row.type === "manual" ? (
                  <div className="mt-2 flex justify-end">
                    <DeleteExpenseButton id={row.id} />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
