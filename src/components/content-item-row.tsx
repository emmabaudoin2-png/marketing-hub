"use client";

import { useState, useTransition } from "react";
import { format as formatDate } from "date-fns";
import { fr } from "date-fns/locale";
import type { Company, ContentItem } from "@prisma/client";
import { deleteContentItem, updateContentItem, updateContentItemStatus } from "@/app/actions";
import { Badge } from "@/components/ui";
import { CompanyBadge } from "@/components/company-badge";
import { StatusSelect } from "@/components/status-select";
import { DeleteButton } from "@/components/delete-button";
import { inputClass, labelClass, buttonClass } from "@/lib/ui-classes";
import {
  contentChannelLabels,
  contentFormatColors,
  contentFormatLabels,
  contentStatusColors,
  contentStatusLabels,
} from "@/lib/labels";

type ItemWithCompany = ContentItem & { company: Company };

export function ContentItemRow({
  item,
  companies,
  isAll,
}: {
  item: ItemWithCompany;
  companies: Company[];
  isAll: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const statusOptions = Object.entries(contentStatusLabels).map(([value, label]) => ({
    value,
    label,
  }));

  if (isEditing) {
    return (
      <li className="py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            startTransition(async () => {
              await updateContentItem(formData);
              setIsEditing(false);
            });
          }}
          className="grid gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60 sm:grid-cols-2 lg:grid-cols-3"
        >
          <input type="hidden" name="id" value={item.id} />
          {isAll ? (
            <div>
              <label className={labelClass}>Entreprise</label>
              <select name="companyId" defaultValue={item.companyId} required className={inputClass}>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <input type="hidden" name="companyId" value={item.companyId} />
          )}

          <div>
            <label className={labelClass}>Titre</label>
            <input name="title" defaultValue={item.title} required className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Canal</label>
            <select name="channel" defaultValue={item.channel} className={inputClass}>
              {Object.entries(contentChannelLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Type de contenu</label>
            <select name="format" defaultValue={item.format} className={inputClass}>
              {Object.entries(contentFormatLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Statut</label>
            <select name="status" defaultValue={item.status} className={inputClass}>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Date prévue</label>
            <input
              type="date"
              name="scheduledAt"
              defaultValue={formatDate(item.scheduledAt, "yyyy-MM-dd")}
              required
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className={labelClass}>Description (optionnel)</label>
            <textarea
              name="description"
              defaultValue={item.description ?? ""}
              rows={2}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className={labelClass}>Lien vers la publication (optionnel)</label>
            <input
              type="url"
              name="publishedUrl"
              defaultValue={item.publishedUrl ?? ""}
              placeholder="https://instagram.com/p/..."
              className={inputClass}
            />
          </div>

          <div className="flex items-center gap-4 sm:col-span-2 lg:col-span-3">
            <button type="submit" disabled={isPending} className={buttonClass}>
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-sm font-medium text-zinc-500 hover:underline"
            >
              Annuler
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-zinc-800 dark:text-zinc-100">{item.title}</p>
          <Badge className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {contentChannelLabels[item.channel]}
          </Badge>
          <Badge className={contentFormatColors[item.format]}>
            {contentFormatLabels[item.format]}
          </Badge>
          {isAll && (
            <CompanyBadge
              name={item.company.name}
              color={item.company.color}
              logoUrl={item.company.logoUrl}
            />
          )}
        </div>
        {item.description && <p className="mt-1 text-sm text-zinc-500">{item.description}</p>}
        <p className="mt-1 text-xs text-zinc-400">
          {formatDate(item.scheduledAt, "EEEE d MMMM yyyy", { locale: fr })}
          {item.publishedUrl && (
            <>
              {" · "}
              <a
                href={item.publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Voir la publication ↗
              </a>
            </>
          )}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <StatusSelect
          id={item.id}
          value={item.status}
          options={statusOptions}
          action={updateContentItemStatus}
          className={`${contentStatusColors[item.status]} rounded-full border-0 px-2.5 py-1 text-xs font-medium`}
        />
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Modifier
        </button>
        <DeleteButton id={item.id} action={deleteContentItem} />
      </div>
    </li>
  );
}
