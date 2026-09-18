"use client";

import Form from "next/form";
import Link from "next/link";
import { contentChannelLabels, contentFormatLabels, contentStatusLabels } from "@/lib/labels";
import { inputClass, labelClass } from "@/lib/ui-classes";

export function ContentFilters({
  status,
  channel,
  format,
  view,
  month,
  resetHref,
}: {
  status: string;
  channel: string;
  format: string;
  view: string;
  month: string;
  resetHref: string;
}) {
  const hasFilters = Boolean(status || channel || format);

  return (
    <Form action="" className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="view" value={view} />
      <input type="hidden" name="month" value={month} />

      <div>
        <label className={labelClass}>Statut</label>
        <select
          name="status"
          defaultValue={status}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className={inputClass}
        >
          <option value="">Tous</option>
          {Object.entries(contentStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Canal</label>
        <select
          name="channel"
          defaultValue={channel}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className={inputClass}
        >
          <option value="">Tous</option>
          {Object.entries(contentChannelLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Type</label>
        <select
          name="format"
          defaultValue={format}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className={inputClass}
        >
          <option value="">Tous</option>
          {Object.entries(contentFormatLabels).map(([value, label]) => (
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
