import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardMonthFilter } from "./dashboard-month-filter";

type PageProps = {
  searchParams: Promise<{ month?: string }>;
};

function getCurrentMonthValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function parseMonthValue(monthValue: string | undefined): { year: number; month: number } | null {
  if (!monthValue || monthValue === "all") return null;
  const [yearString, monthString] = monthValue.split("-");
  const year = Number(yearString);
  const month = Number(monthString);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }
  return { year, month };
}

function isInMonth(dateValue: string, targetMonth: { year: number; month: number } | null) {
  if (!targetMonth) return true;
  const date = new Date(dateValue);
  return date.getFullYear() === targetMonth.year && date.getMonth() + 1 === targetMonth.month;
}

/** Μήνας dashboard για έργα: ημερομηνία έναρξης, αλλιώς παλιά συμπεριφορά (created_at). */
function projectMonthAnchor(project: { start_date?: string | null; created_at: string }) {
  return project.start_date ?? project.created_at;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { month: monthParam } = await searchParams;
  const selectedMonthValue = monthParam ?? getCurrentMonthValue();
  const selectedMonth = parseMonthValue(selectedMonthValue);

  const [projectsRes, incomeRes, expensesRes] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id, customer_name, owed, created_at, start_date, project_income(amount, vat_percent, payment_date)",
        { count: "exact" }
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("income")
      .select("amount, date")
      .eq("user_id", user.id),
    supabase
      .from("expenses")
      .select("amount, date")
      .eq("user_id", user.id),
  ]);

  const projects = projectsRes.data ?? [];
  const filteredProjects = projects.filter((project) =>
    isInMonth(projectMonthAnchor(project), selectedMonth)
  );
  const totalProjects = selectedMonth ? filteredProjects.length : (projectsRes.count ?? filteredProjects.length);
  const incomeFromProjectsWithoutVat = projects.reduce((sum, p) => {
    const rows = (p.project_income ?? []) as { amount: number; payment_date: string }[];
    return (
      sum +
      rows
        .filter((r) => isInMonth(r.payment_date, selectedMonth))
        .reduce((s, r) => s + Number(r.amount), 0)
    );
  }, 0);
  const incomeFromProjectsWithVat = projects.reduce((sum, p) => {
    const rows = (p.project_income ?? []) as {
      amount: number;
      vat_percent: number | null;
      payment_date: string;
    }[];
    return (
      sum +
      rows
        .filter((r) => isInMonth(r.payment_date, selectedMonth))
        .reduce((s, r) => s + Number(r.amount) * (1 + (r.vat_percent ?? 0) / 100), 0)
    );
  }, 0);
  const manualIncomeRows = (incomeRes.data ?? []).filter((income) => isInMonth(income.date, selectedMonth));
  const incomeFromManual = manualIncomeRows.reduce((sum, r) => sum + Number(r.amount), 0);
  const totalIncomeWithoutVat = incomeFromProjectsWithoutVat + incomeFromManual;
  const totalIncomeWithVat = incomeFromProjectsWithVat + incomeFromManual;
  const manualExpenseRows = (expensesRes.data ?? []).filter((expense) => isInMonth(expense.date, selectedMonth));
  const totalExpenses = manualExpenseRows.reduce((sum, r) => sum + Number(r.amount), 0);
  const recentProjects = selectedMonth ? filteredProjects.slice(0, 5) : projects.slice(0, 5);

  const cards = [
    {
      label: "Έργα",
      value: totalProjects.toString(),
      href: "/app/erga",
      color: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: "Έσοδα (χωρίς ΦΠΑ)",
      value: `€${totalIncomeWithoutVat.toLocaleString("el-GR", { minimumFractionDigits: 2 })}`,
      href: "/app/esoda",
      color: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
    {
      label: "Έσοδα (+ ΦΠΑ)",
      value: `€${totalIncomeWithVat.toLocaleString("el-GR", { minimumFractionDigits: 2 })}`,
      href: "/app/esoda",
      color: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
    {
      label: "Έξοδα",
      value: `€${totalExpenses.toLocaleString("el-GR", { minimumFractionDigits: 2 })}`,
      href: "/app/exoda",
      color: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
    {
      label: "Καθαρά",
      value: `€${(totalIncomeWithoutVat - totalExpenses).toLocaleString("el-GR", { minimumFractionDigits: 2 })}`,
      href: "#",
      color: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {selectedMonth
              ? "Έργα: μήνας έναρξης. Πληρωμές έργου & έξοδα έργου: ημερομηνία που δηλώνεις εκεί. Διάφορα έσοδα/έξοδα: ημ/νία εγγραφής."
              : "Προβολή στοιχείων για όλους τους μήνες"}
          </p>
        </div>
        <Suspense fallback={<span className="text-sm text-zinc-400">Μήνας...</span>}>
          <DashboardMonthFilter basePath="/app" defaultMonth={getCurrentMonthValue()} />
        </Suspense>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {card.label}
            </p>
            <p className={`mt-2 text-2xl font-bold ${card.color} inline-block rounded-lg px-2 py-1`}>
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent projects */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
            Πρόσφατα Έργα
          </h2>
          <Link
            href="/app/erga"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Όλα →
          </Link>
        </div>
        {recentProjects.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Δεν υπάρχουν έργα ακόμα.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {recentProjects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/app/erga/${project.id}`}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {project.customer_name}
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    Οφειλή: €{Number(project.owed).toLocaleString("el-GR", { minimumFractionDigits: 2 })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
