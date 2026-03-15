"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
      price_per_meter: Number(form.get("price_per_meter")) || 0,
      sinazi: (form.get("sinazi") as string) || "",
      gonies: (form.get("gonies") as string) || "",
      owed: Number(form.get("owed")) || 0,
      advance: Number(form.get("advance")) || 0,
      project_expenses: 0,
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
            <Field label="Τιμή ανά μέτρο" name="price_per_meter" type="number" step="0.01" />
            <Field label="Σιναζι" name="sinazi" />
            <Field label="Γωνίες" name="gonies" />
            <Field label="Οφειλή" name="owed" type="number" step="0.01" />
            <Field label="Προκαταβολή" name="advance" type="number" step="0.01" />

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
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  step?: string;
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
        className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
      />
    </div>
  );
}
