"use client";

import { useRouter, useSearchParams } from "next/navigation";

const MONTH_LABELS: Record<string, string> = {
  "01": "Ιαν",
  "02": "Φεβ",
  "03": "Μαρ",
  "04": "Απρ",
  "05": "Μαϊ",
  "06": "Ιουν",
  "07": "Ιουλ",
  "08": "Αυγ",
  "09": "Σεπ",
  "10": "Οκτ",
  "11": "Νοε",
  "12": "Δεκ",
};

function getMonthOptions() {
  const now = new Date();
  const options: { value: string; label: string }[] = [{ value: "all", label: "Όλοι οι μήνες" }];
  for (let i = 0; i < 24; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    options.push({ value: `${year}-${month}`, label: `${MONTH_LABELS[month] ?? month} ${year}` });
  }
  return options;
}

const OPTIONS = getMonthOptions();

type DashboardMonthFilterProps = {
  basePath: string;
  defaultMonth: string;
};

export function DashboardMonthFilter({ basePath, defaultMonth }: DashboardMonthFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedMonth = searchParams.get("month") ?? defaultMonth;

  return (
    <select
      value={selectedMonth}
      onChange={(event) => {
        const month = event.target.value;
        router.push(`${basePath}?month=${encodeURIComponent(month)}`);
      }}
      className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
    >
      {OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
