"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_HEIGHT_COEFFICIENT,
  DEFAULT_WALL_HEIGHT,
  metraLineTotal,
} from "@/lib/project-pricing";
import { createClient } from "@/lib/supabase/client";

export function NewProjectButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("projects").insert({
      user_id: user.id,
      customer_name: form.get("customer_name") as string,
      start_date: (form.get("start_date") as string) || new Date().toISOString().slice(0, 10),
      completion_date: (form.get("completion_date") as string) || null,
      price_per_meter: Number(form.get("price_per_meter")) || 0,
      price_metra: form.get("price_metra") ? Number(form.get("price_metra")) : null,
      wall_height: Number(form.get("wall_height")) || DEFAULT_WALL_HEIGHT,
      height_coefficient:
        Number(form.get("height_coefficient")) || DEFAULT_HEIGHT_COEFFICIENT,
      sinazi: (form.get("sinazi") as string) || "",
      sinazi_metro: form.get("sinazi_metro") ? Number(form.get("sinazi_metro")) : null,
      gonies: (form.get("gonies") as string) || "",
      gonies_metro: form.get("gonies_metro") ? Number(form.get("gonies_metro")) : null,
      owed:
        metraLineTotal(
          Number(form.get("price_per_meter") || 0),
          Number(form.get("price_metra") || 0),
          Number(form.get("wall_height")) || DEFAULT_WALL_HEIGHT,
          Number(form.get("height_coefficient")) || DEFAULT_HEIGHT_COEFFICIENT
        ) +
        Number(form.get("sinazi") || 0) * Number(form.get("sinazi_metro") || 0) +
        Number(form.get("gonies") || 0) * Number(form.get("gonies_metro") || 0),
    });

    if (!error) {
      setOpen(false);
      router.refresh();
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
      >
        + Νέο Έργο
      </button>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onClick={() => setOpen(false)}
      >
        <div
          className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Νέο Έργο
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Όνομα πελάτη" name="customer_name" required />
            <div className="grid grid-cols-2 gap-2">
              <Field
                label="Ημ/νία έναρξης"
                name="start_date"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
              <Field label="Ημ/νία ολοκλήρωσης" name="completion_date" type="date" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Μέτρο" name="price_per_meter" type="number" step="0.01" />
              <Field label="Μέτρα" name="price_metra" type="number" step="0.01" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field
                label="Ύψος (μ.)"
                name="wall_height"
                type="number"
                step="0.01"
                defaultValue="1"
              />
              <Field
                label="Συντελεστής"
                name="height_coefficient"
                type="number"
                step="0.01"
                defaultValue="10"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Σινάζι" name="sinazi" />
              <Field label="Σινάζι Μέτρα" name="sinazi_metro" type="number" step="0.01" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Γωνίες" name="gonies" />
              <Field label="Γωνίες Μέτρα" name="gonies_metro" type="number" step="0.01" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Ακύρωση
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
              >
                {loading ? "Αποθήκευση..." : "Αποθήκευση"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  step,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  step?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        step={step}
        defaultValue={defaultValue}
        className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
      />
    </div>
  );
}
