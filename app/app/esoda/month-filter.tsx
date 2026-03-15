"use client";

import { useRouter, useSearchParams } from "next/navigation";

const MONTH_LABELS: Record<string, string> = {
  "01": "Ιαν", "02": "Φεβ", "03": "Μαρ", "04": "Απρ", "05": "Μαϊ", "06": "Ιουν",
  "07": "Ιουλ", "08": "Αυγ", "09": "Σεπ", "10": "Οκτ", "11": "Νοε", "12": "Δεκ",
};

function getMonthOptions() {
  const now = new Date();
  const options: { value: string; label: string }[] = [{ value: "", label: "Όλοι οι μήνες" }];
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    options.push({ value: `${y}-${m}`, label: `${MONTH_LABELS[m] ?? m} ${y}` });
  }
  return options;
}

const OPTIONS = getMonthOptions();

export function MonthFilter({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("month") ?? "";

  return (
    <select
      value={current}
      onChange={(e) => {
        const month = e.target.value;
        const url = month ? `${basePath}?month=${encodeURIComponent(month)}` : basePath;
        router.push(url);
      }}
      className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value || "all"} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
