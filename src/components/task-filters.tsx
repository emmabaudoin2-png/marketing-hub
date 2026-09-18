"use client";

import Form from "next/form";
import Link from "next/link";
import { taskPriorityLabels, taskStatusLabels } from "@/lib/labels";
import { inputClass, labelClass } from "@/lib/ui-classes";

export function TaskFilters({
  status,
  priority,
  resetHref,
}: {
  status: string;
  priority: string;
  resetHref: string;
}) {
  const hasFilters = Boolean(status || priority);

  return (
    <Form action="" className="flex flex-wrap items-end gap-3">
      <div>
        <label className={labelClass}>Statut</label>
        <select
          name="status"
          defaultValue={status}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className={inputClass}
        >
          <option value="">Tous</option>
          {Object.entries(taskStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Priorité</label>
        <select
          name="priority"
          defaultValue={priority}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className={inputClass}
        >
          <option value="">Toutes</option>
          {Object.entries(taskPriorityLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <Link
          href={resetHref}
          className="pb-2 text-xs font-medium text-zinc-500 hover:underline dark:text-zinc-400"
        >
          Réinitialiser les filtres
        </Link>
      )}
    </Form>
  );
}
