import Link from "next/link";
import clsx from "clsx";
import { prisma } from "@/lib/prisma";
import { ALL_COMPANIES, getCompanies, getSelectedCompanyId } from "@/lib/selection";
import { companyFilter } from "@/lib/queries";
import { createContentItem } from "@/app/actions";
import { Card } from "@/components/ui";
import { ContentItemRow } from "@/components/content-item-row";
import { ContentFilters } from "@/components/content-filters";
import { CalendarGrid } from "@/components/calendar-grid";
import { inputClass, labelClass, buttonClass } from "@/lib/ui-classes";
import { contentChannelLabels, contentFormatLabels, contentStatusLabels } from "@/lib/labels";
import { buildQuery } from "@/lib/query-string";
import {
  buildMonthGrid,
  monthLabel,
  monthParam,
  monthRange,
  nextMonth,
  parseMonthParam,
  previousMonth,
} from "@/lib/calendar-grid";
import type { ContentChannel, ContentFormat, ContentStatus } from "@prisma/client";

type SearchParams = Promise<{
  status?: string;
  channel?: string;
  format?: string;
  view?: string;
  month?: string;
}>;

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const selectedId = await getSelectedCompanyId();
  const isAll = selectedId === ALL_COMPANIES;

  const statusFilter = params.status ?? "";
  const channelFilter = params.channel ?? "";
  const formatFilter = params.format ?? "";
  const view = params.view === "grid" ? "grid" : "list";
  const currentMonth = parseMonthParam(params.month);
  const monthParamValue = monthParam(currentMonth);

  const where: {
    companyId?: string;
    status?: ContentStatus;
    channel?: ContentChannel;
    format?: ContentFormat;
    scheduledAt?: { gte: Date; lte: Date };
  } = { ...companyFilter(selectedId) };
  if (statusFilter) where.status = statusFilter as ContentStatus;
  if (channelFilter) where.channel = channelFilter as ContentChannel;
  if (formatFilter) where.format = formatFilter as ContentFormat;
  if (view === "grid") {
    const { start, end } = monthRange(currentMonth);
    where.scheduledAt = { gte: start, lte: end };
  }

  const [companies, items] = await Promise.all([
    getCompanies(),
    prisma.contentItem.findMany({
      where,
      orderBy: { scheduledAt: "asc" },
      include: { company: true },
    }),
  ]);

  const baseQuery = { status: statusFilter, channel: channelFilter, format: formatFilter };
  const listHref = `/calendrier${buildQuery({ ...baseQuery, view: "list" })}`;
  const gridHref = `/calendrier${buildQuery({ ...baseQuery, view: "grid", month: monthParamValue })}`;
  const resetHref = `/calendrier${buildQuery({ view, month: monthParamValue })}`;
  const prevMonthHref = `/calendrier${buildQuery({ ...baseQuery, view: "grid", month: monthParam(previousMonth(currentMonth)) })}`;
  const nextMonthHref = `/calendrier${buildQuery({ ...baseQuery, view: "grid", month: monthParam(nextMonth(currentMonth)) })}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Calendrier de contenu
        </h1>
        <p className="text-sm text-zinc-500">
          Planifiez et suivez vos publications marketing.
        </p>
      </div>

      <Card title="Ajouter un contenu">
        <form action={createContentItem} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isAll ? (
            <div>
              <label className={labelClass}>Entreprise</label>
              <select name="companyId" required className={inputClass}>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <input type="hidden" name="companyId" value={selectedId} />
          )}

          <div>
            <label className={labelClass}>Titre</label>
            <input name="title" required className={inputClass} placeholder="Ex: Post Instagram promo" />
          </div>

          <div>
            <label className={labelClass}>Canal</label>
            <select name="channel" className={inputClass} defaultValue="OTHER">
              {Object.entries(contentChannelLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Type de contenu</label>
            <select name="format" className={inputClass} defaultValue="POST">
              {Object.entries(contentFormatLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Statut</label>
            <select name="status" className={inputClass} defaultValue="IDEA">
              {Object.entries(contentStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Date prévue</label>
            <input type="date" name="scheduledAt" required className={inputClass} />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className={labelClass}>Description (optionnel)</label>
            <textarea name="description" rows={2} className={inputClass} />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <button type="submit" className={buttonClass}>
              Ajouter au calendrier
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-800">
            <Link
              href={listHref}
              className={clsx(
                "rounded-md px-3 py-1.5 text-sm font-medium",
                view === "list"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 dark:text-zinc-300"
              )}
            >
              Liste
            </Link>
            <Link
              href={gridHref}
              className={clsx(
                "rounded-md px-3 py-1.5 text-sm font-medium",
                view === "grid"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 dark:text-zinc-300"
              )}
            >
              Grille
            </Link>
          </div>

          {view === "grid" && (
            <div className="flex items-center gap-3">
              <Link
                href={prevMonthHref}
                className="rounded-md border border-zinc-200 px-2.5 py-1 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                ← Précédent
              </Link>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                {monthLabel(currentMonth)}
              </p>
              <Link
                href={nextMonthHref}
                className="rounded-md border border-zinc-200 px-2.5 py-1 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                Suivant →
              </Link>
            </div>
          )}
        </div>

        <div className="my-4 border-t border-zinc-100 dark:border-zinc-800" />

        <ContentFilters
          status={statusFilter}
          channel={channelFilter}
          format={formatFilter}
          view={view}
          month={monthParamValue}
          resetHref={resetHref}
        />
      </Card>

      {view === "grid" ? (
        <Card>
          <CalendarGrid weeks={buildMonthGrid(currentMonth)} month={currentMonth} items={items} isAll={isAll} />
        </Card>
      ) : (
        <Card title={`Contenus planifiés (${items.length})`}>
          {items.length === 0 ? (
            <p className="text-sm text-zinc-500">Aucun contenu pour le moment.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
              {items.map((item) => (
                <ContentItemRow key={item.id} item={item} companies={companies} isAll={isAll} />
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
