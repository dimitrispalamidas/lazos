"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { ProjectPdfDocument, type ProjectForPdf } from "./project-pdf-document";

const LOGO_PATH = "/logo-black.png";

type Props = { project: ProjectForPdf };

export function ExportProjectPdfButton({ project }: Props) {
  const [loading, setLoading] = useState(false);
  const [includePaymentsInPdf, setIncludePaymentsInPdf] = useState(true);

  const logoSrc =
    typeof window !== "undefined" ? `${window.location.origin}${LOGO_PATH}` : undefined;

  async function handleExport() {
    setLoading(true);
    try {
      const blob = await pdf(
        <ProjectPdfDocument
          project={project}
          logoSrc={logoSrc}
          showPaymentsInPdf={includePaymentsInPdf}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeFilename(project.customer_name)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <input
          type="checkbox"
          checked={includePaymentsInPdf}
          onChange={(e) => setIncludePaymentsInPdf(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
        />
        Πληρωμές και υπόλοιπα στο PDF
      </label>
      <button
        type="button"
        onClick={handleExport}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
      >
        {loading ? (
          "Δημιουργία PDF..."
        ) : (
          <>
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export PDF
          </>
        )}
      </button>
    </div>
  );
}

function safeFilename(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "ergo";
  const safe = trimmed
    .replace(/[\/:*?"<>|\\]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return safe || "ergo";
}
