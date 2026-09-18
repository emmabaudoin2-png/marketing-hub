import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { ALL_COMPANIES, getCompanies, getSelectedCompanyId } from "@/lib/selection";
import { companyFilter } from "@/lib/queries";
import { createContentItem, deleteContentItem, updateContentItemStatus } from "@/app/actions";
import { Card, Badge } from "@/components/ui";
import { StatusSelect } from "@/components/status-select";
import { DeleteButton } from "@/components/delete-button";
import { inputClass, labelClass, buttonClass } from "@/lib/ui-classes";
import { contentChannelLabels, contentStatusColors, contentStatusLabels } from "@/lib/labels";
import type { ContentStatus } from "@prisma/client";

export default async function CalendarPage() {
  const selectedId = await getSelectedCompanyId();
  const isAll = selectedId === ALL_COMPANIES;

  const [companies, items] = await Promise.all([
    getCompanies(),
    prisma.contentItem.findMany({
      where: companyFilter(selectedId),
      orderBy: { scheduledAt: "asc" },
      include: { company: true },
    }),
  ]);

  const statusOptions = Object.entries(contentStatusLabels).map(([value, label]) => ({
    value,
    label,
  }));

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
            <label className={labelClass}>Statut</label>
            <select name="status" className={inputClass} defaultValue="IDEA">
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
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

      <Card title={`Contenus planifiés (${items.length})`}>
        {items.length === 0 ? (
          <p className="text-sm text-zinc-500">Aucun contenu pour le moment.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
            {items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-zinc-800 dark:text-zinc-100">{item.title}</p>
                    <Badge className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {contentChannelLabels[item.channel]}
                    </Badge>
                    {isAll && (
                      <Badge
                        className="bg-transparent text-zinc-500"
                        style={{ color: item.company.color }}
                      >
                        {item.company.name}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="mt-1 text-sm text-zinc-500">{item.description}</p>
                  )}
                  <p className="mt-1 text-xs text-zinc-400">
                    {format(item.scheduledAt, "EEEE d MMMM yyyy", { locale: fr })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusSelect
                    id={item.id}
                    value={item.status}
                    options={statusOptions}
                    action={updateContentItemStatus}
                    className={`${contentStatusColors[item.status as ContentStatus]} rounded-full border-0 px-2.5 py-1 text-xs font-medium`}
                  />
                  <DeleteButton id={item.id} action={deleteContentItem} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
