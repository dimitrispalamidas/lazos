"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type OtherWorkRow = { id?: string; name: string; price: string };
type IncomeRow = { id?: string; amount: string; vat_percent: string };

function rowTotal(amount: number, vatPercent: number | null): number {
  if (vatPercent == null || vatPercent === 0) return amount;
  return amount * (1 + vatPercent / 100);
}

type Project = {
  id: string;
  customer_name: string;
  price_per_meter: number;
  price_metra: number | null;
  sinazi: string | null;
  sinazi_metro: number | null;
  gonies: string | null;
  gonies_metro: number | null;
  owed: number;
  vat_percent?: number | null;
  created_at: string;
  project_income?: { id: string; amount: number; vat_percent: number | null }[];
  project_other_works?: { id: string; name: string; price: number }[];
};

const inputClass =
  "block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";
const rowInputClass =
  "block rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

export function ProjectDetailForm({ project }: { project: Project }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customer_name: project.customer_name,
    price_per_meter: String(project.price_per_meter),
    price_metra: String(project.price_metra ?? ""),
    sinazi: project.sinazi ?? "",
    sinazi_metro: String(project.sinazi_metro ?? ""),
    gonies: project.gonies ?? "",
    gonies_metro: String(project.gonies_metro ?? ""),
    vat_percent: project.vat_percent != null ? String(project.vat_percent) : "",
  });
  const [incomeRows, setIncomeRows] = useState<IncomeRow[]>(
    (project.project_income ?? []).map((r) => ({
      id: r.id,
      amount: String(r.amount),
      vat_percent: r.vat_percent != null ? String(r.vat_percent) : "",
    }))
  );
  const [otherWorks, setOtherWorks] = useState<OtherWorkRow[]>(
    (project.project_other_works ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      price: String(r.price),
    }))
  );

  function addIncomeRow() {
    setIncomeRows((prev) => [...prev, { amount: "", vat_percent: "" }]);
  }
  function removeIncomeRow(index: number) {
    setIncomeRows((prev) => prev.filter((_, i) => i !== index));
  }
  function updateIncomeRow(index: number, field: "amount" | "vat_percent", value: string) {
    setIncomeRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function addOtherWork() {
    setOtherWorks((prev) => [...prev, { name: "", price: "" }]);
  }
  function removeOtherWork(index: number) {
    setOtherWorks((prev) => prev.filter((_, i) => i !== index));
  }
  function updateOtherWork(index: number, field: "name" | "price", value: string) {
    setOtherWorks((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    const { error: updateError } = await supabase
      .from("projects")
      .update({
        customer_name: form.customer_name,
        price_per_meter: Number(form.price_per_meter) || 0,
        price_metra: form.price_metra.trim() !== "" ? Number(form.price_metra) : null,
        sinazi: form.sinazi || null,
        sinazi_metro: form.sinazi_metro.trim() !== "" ? Number(form.sinazi_metro) : null,
        gonies: form.gonies || null,
        gonies_metro: form.gonies_metro.trim() !== "" ? Number(form.gonies_metro) : null,
        vat_percent: form.vat_percent.trim() !== "" ? Number(form.vat_percent) : null,
        owed:
          Number(form.price_per_meter) * (Number(form.price_metra) || 0) +
          Number(form.sinazi || 0) * (Number(form.sinazi_metro) || 0) +
          Number(form.gonies || 0) * (Number(form.gonies_metro) || 0),
      })
      .eq("id", project.id);

    if (updateError) {
      setSaving(false);
      return;
    }

    await supabase.from("project_income").delete().eq("project_id", project.id);
    const toInsertIncome = incomeRows
      .filter((r) => Number(r.amount) !== 0)
      .map((r) => ({
        project_id: project.id,
        amount: Number(r.amount) || 0,
        vat_percent: r.vat_percent.trim() !== "" ? Number(r.vat_percent) : null,
      }));
    if (toInsertIncome.length > 0) {
      await supabase.from("project_income").insert(toInsertIncome);
    }

    await supabase.from("project_other_works").delete().eq("project_id", project.id);
    if (otherWorks.length > 0) {
      await supabase.from("project_other_works").insert(
        otherWorks
          .filter((r) => r.name.trim() !== "" || Number(r.price) !== 0)
          .map((r) => ({
            project_id: project.id,
            name: r.name.trim() || "—",
            price: Number(r.price) || 0,
          }))
      );
    }

    router.refresh();
    setSaving(false);
  }

  const mainFieldsBefore: { label: string; key: keyof typeof form; type?: "text" | "number"; step?: string }[] = [
    { label: "Όνομα πελάτη", key: "customer_name" },
    { label: "ΦΠΑ % (έργο)", key: "vat_percent", type: "number", step: "0.01" },
  ];
  const mainFieldsAfter: { label: string; key: keyof typeof form; type?: "text" | "number"; step?: string }[] = [];

  const pricePerMeterVal = Number(form.price_per_meter) || 0;
  const priceMetraVal = Number(form.price_metra) || 0;
  const metraTotal = pricePerMeterVal * priceMetraVal;
  const sinaziVal = Number(form.sinazi) || 0;
  const sinaziMetro = Number(form.sinazi_metro) || 0;
  const goniesVal = Number(form.gonies) || 0;
  const goniesMetro = Number(form.gonies_metro) || 0;
  const sinaziTotal = sinaziVal * sinaziMetro;
  const goniesTotal = goniesVal * goniesMetro;

  const projectVat = form.vat_percent.trim() !== "" ? Number(form.vat_percent) : null;
  const merikoTotal = metraTotal + sinaziTotal + goniesTotal;
  const merikoTotalWithVat = projectVat != null && projectVat !== 0 ? merikoTotal * (1 + projectVat / 100) : null;
  const otherWorksTotal = otherWorks.reduce((sum, r) => sum + (Number(r.price) || 0), 0);
  const genikoTotal = merikoTotal + otherWorksTotal;
  const genikoTotalWithVat = projectVat != null && projectVat !== 0 ? genikoTotal * (1 + projectVat / 100) : null;
  const incomeTotal = incomeRows.reduce((sum, r) => {
    const amt = Number(r.amount) || 0;
    const vat = r.vat_percent.trim() !== "" ? Number(r.vat_percent) : null;
    return sum + rowTotal(amt, vat);
  }, 0);
  const incomeTotalWithoutVat = incomeRows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const vatCollectedFromPayments = incomeRows.reduce((sum, r) => {
    const amt = Number(r.amount) || 0;
    const vat = r.vat_percent.trim() !== "" ? Number(r.vat_percent) : null;
    if (vat == null || vat === 0) return sum;
    return sum + amt * (vat / 100);
  }, 0);
  const targetTotal = genikoTotalWithVat ?? genikoTotal;
  const ypoloipo = targetTotal - incomeTotal;

  return (
    <form onSubmit={handleSubmit} className="space-y-0">
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <dl className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {mainFieldsBefore.map(({ label, key, type = "text", step }) => (
            <div
              key={key}
              className="grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-3 sm:gap-4"
            >
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                <label htmlFor={key}>{label}</label>
              </dt>
              <dd className="text-sm sm:col-span-2">
                <input
                  id={key}
                  name={key}
                  type={type}
                  step={step}
                  value={form[key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  className={inputClass}
                />
              </dd>
            </div>
          ))}

          {/* Μετρο + Μετρα → Σύνολο (τιμή × μετρα) */}
          <div className="grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Μετρο
            </dt>
            <dd className="flex flex-wrap items-center gap-2 text-sm sm:col-span-2">
              <input
                name="price_per_meter"
                type="number"
                step="0.01"
                placeholder="Τιμή"
                value={form.price_per_meter}
                onChange={(e) => setForm((prev) => ({ ...prev, price_per_meter: e.target.value }))}
                className={`${rowInputClass} w-20 sm:w-24`}
              />
              <span className="text-zinc-500 dark:text-zinc-400">Μετρα</span>
              <input
                name="price_metra"
                type="number"
                step="0.01"
                placeholder="Μετρα"
                value={form.price_metra}
                onChange={(e) => setForm((prev) => ({ ...prev, price_metra: e.target.value }))}
                className={`${rowInputClass} w-20 sm:w-24`}
              />
              <span className="min-w-[5rem] text-zinc-600 dark:text-zinc-400">
                Σύνολο: {metraTotal.toLocaleString("el-GR", { minimumFractionDigits: 2 })} €
              </span>
            </dd>
          </div>

          {/* Σιναζι + Μετρα → Σύνολο (τιμή × μετρα) */}
          <div className="grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Σιναζι
            </dt>
            <dd className="flex flex-wrap items-center gap-2 text-sm sm:col-span-2">
              <input
                name="sinazi"
                type="text"
                inputMode="decimal"
                placeholder="Τιμή"
                value={form.sinazi}
                onChange={(e) => setForm((prev) => ({ ...prev, sinazi: e.target.value }))}
                className={`${rowInputClass} w-20 sm:w-24`}
              />
              <span className="text-zinc-500 dark:text-zinc-400">Μετρα</span>
              <input
                name="sinazi_metro"
                type="number"
                step="0.01"
                placeholder="Μετρα"
                value={form.sinazi_metro}
                onChange={(e) => setForm((prev) => ({ ...prev, sinazi_metro: e.target.value }))}
                className={`${rowInputClass} w-20 sm:w-24`}
              />
              <span className="min-w-[5rem] text-zinc-600 dark:text-zinc-400">
                Σύνολο: {sinaziTotal.toLocaleString("el-GR", { minimumFractionDigits: 2 })} €
              </span>
            </dd>
          </div>

          {/* Γωνίες + Μετρα → Σύνολο (τιμή × μετρα) */}
          <div className="grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Γωνίες
            </dt>
            <dd className="flex flex-wrap items-center gap-2 text-sm sm:col-span-2">
              <input
                name="gonies"
                type="text"
                inputMode="decimal"
                placeholder="Τιμή"
                value={form.gonies}
                onChange={(e) => setForm((prev) => ({ ...prev, gonies: e.target.value }))}
                className={`${rowInputClass} w-20 sm:w-24`}
              />
              <span className="text-zinc-500 dark:text-zinc-400">Μετρα</span>
              <input
                name="gonies_metro"
                type="number"
                step="0.01"
                placeholder="Μετρα"
                value={form.gonies_metro}
                onChange={(e) => setForm((prev) => ({ ...prev, gonies_metro: e.target.value }))}
                className={`${rowInputClass} w-20 sm:w-24`}
              />
              <span className="min-w-[5rem] text-zinc-600 dark:text-zinc-400">
                Σύνολο: {goniesTotal.toLocaleString("el-GR", { minimumFractionDigits: 2 })} €
              </span>
            </dd>
          </div>

          {/* Μερικό Σύνολο = Μετρο + Σιναζι + Γωνίες */}
          <div className="grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Μερικό Σύνολο
            </dt>
            <dd className="text-sm font-medium text-zinc-700 dark:text-zinc-300 sm:col-span-2">
              {merikoTotal.toLocaleString("el-GR", { minimumFractionDigits: 2 })} €
              {merikoTotalWithVat != null && (
                <span className="ml-2 text-zinc-500 dark:text-zinc-400">
                  (+ ΦΠΑ: {merikoTotalWithVat.toLocaleString("el-GR", { minimumFractionDigits: 2 })} €)
                </span>
              )}
            </dd>
          </div>

          {mainFieldsAfter.map(({ label, key, type = "text", step }) => (
            <div
              key={key}
              className="grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-3 sm:gap-4"
            >
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                <label htmlFor={key}>{label}</label>
              </dt>
              <dd className="text-sm sm:col-span-2">
                <input
                  id={key}
                  name={key}
                  type={type}
                  step={step}
                  value={form[key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  className={inputClass}
                />
              </dd>
            </div>
          ))}

          {/* Άλλες εργασίες */}
          <div className="grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Άλλες εργασίες
            </dt>
            <dd className="space-y-3 text-sm sm:col-span-2">
              <ul className="space-y-2">
                {otherWorks.map((row, index) => (
                  <li
                    key={row.id ?? `new-${index}`}
                    className="flex flex-nowrap items-center gap-2 sm:gap-3"
                  >
                    <input
                      type="text"
                      placeholder="Όνομα"
                      value={row.name}
                      onChange={(e) => updateOtherWork(index, "name", e.target.value)}
                      className={`${rowInputClass} min-w-0 flex-1`}
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Τιμή"
                      value={row.price}
                      onChange={(e) => updateOtherWork(index, "price", e.target.value)}
                      className={`${rowInputClass} w-20 shrink-0 sm:w-24`}
                    />
                    <button
                      type="button"
                      onClick={() => removeOtherWork(index)}
                      className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800 dark:hover:text-red-400"
                      title="Αφαίρεση"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={addOtherWork}
                className="rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600 hover:border-blue-500 hover:text-blue-600 dark:border-zinc-600 dark:text-zinc-400 dark:hover:border-blue-500 dark:hover:text-blue-400"
              >
                + Προσθήκη εργασίας
              </button>
            </dd>
          </div>

          {/* Γενικό Σύνολο = Μερικό + Άλλες εργασίες */}
          <div className="grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Γενικό Σύνολο
            </dt>
            <dd className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 sm:col-span-2">
              {genikoTotal.toLocaleString("el-GR", { minimumFractionDigits: 2 })} €
              {genikoTotalWithVat != null && (
                <span className="ml-2 font-medium text-zinc-600 dark:text-zinc-400">
                  (+ ΦΠΑ: {genikoTotalWithVat.toLocaleString("el-GR", { minimumFractionDigits: 2 })} €)
                </span>
              )}
            </dd>
          </div>

          {/* Πληρωμές: λίστα Ποσό + ΦΠΑ % (προαιρετικό), υπολογιζόμενο σύνολο ανά γραμμή και συνολικά */}
          <div className="grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Πληρωμές
            </dt>
            <dd className="space-y-3 text-sm sm:col-span-2">
              <ul className="space-y-2">
                {incomeRows.map((row, index) => {
                  const amt = Number(row.amount) || 0;
                  const vat = row.vat_percent.trim() !== "" ? Number(row.vat_percent) : null;
                  const total = rowTotal(amt, vat);
                  return (
                    <li
                      key={row.id ?? `inc-${index}`}
                      className="flex flex-nowrap items-center gap-2 sm:gap-3"
                    >
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Ποσό"
                        value={row.amount}
                        onChange={(e) => updateIncomeRow(index, "amount", e.target.value)}
                        className={`${rowInputClass} w-24 shrink-0 sm:w-28`}
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="ΦΠΑ %"
                        value={row.vat_percent}
                        onChange={(e) => updateIncomeRow(index, "vat_percent", e.target.value)}
                        className={`${rowInputClass} w-16 shrink-0 sm:w-20`}
                        title="Προαιρετικό"
                      />
                      <span className="min-w-[4rem] shrink-0 text-right text-zinc-600 dark:text-zinc-400">
                        Σύνολο: {total.toLocaleString("el-GR", { minimumFractionDigits: 2 })} €
                      </span>
                      <button
                        type="button"
                        onClick={() => removeIncomeRow(index)}
                        className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800 dark:hover:text-red-400"
                        title="Αφαίρεση"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                onClick={addIncomeRow}
                className="rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600 hover:border-blue-500 hover:text-blue-600 dark:border-zinc-600 dark:text-zinc-400 dark:hover:border-blue-500 dark:hover:text-blue-400"
              >
                + Προσθήκη πληρωμής
              </button>
              {incomeRows.length > 0 && (
                <>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Σύνολο πληρωμών: {incomeTotal.toLocaleString("el-GR", { minimumFractionDigits: 2 })} €
                    {incomeTotalWithoutVat !== incomeTotal && (
                      <span className="ml-1 text-zinc-500 dark:text-zinc-400">
                        (χωρίς ΦΠΑ: {incomeTotalWithoutVat.toLocaleString("el-GR", { minimumFractionDigits: 2 })} €)
                      </span>
                    )}
                  </p>
                  {vatCollectedFromPayments > 0 && (
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      ΦΠΑ εισπραχθέν (έσοδα για απόπληρωση ΦΠΑ): {vatCollectedFromPayments.toLocaleString("el-GR", { minimumFractionDigits: 2 })} €
                    </p>
                  )}
                </>
              )}
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Υπόλοιπο ({genikoTotalWithVat != null ? "Γενικό με ΦΠΑ" : "Γενικό"} − Πληρωμές): {ypoloipo.toLocaleString("el-GR", { minimumFractionDigits: 2 })} €
              </p>
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          disabled={saving}
          onClick={(e) => {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
        >
          {saving ? "Αποθήκευση..." : "Αποθήκευση"}
        </button>
      </div>
    </form>
  );
}
