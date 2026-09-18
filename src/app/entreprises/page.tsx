import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { getCompanies } from "@/lib/selection";
import {
  createCompany,
  createMetricEntry,
  deleteCompany,
  deleteMetricEntry,
  updateCompany,
} from "@/app/actions";
import { Card } from "@/components/ui";
import { DeleteButton } from "@/components/delete-button";
import { inputClass, labelClass, buttonClass } from "@/lib/ui-classes";
import { metricTypeLabels } from "@/lib/labels";

export default async function CompaniesPage() {
  const [companies, recentMetrics] = await Promise.all([
    getCompanies(),
    prisma.metricEntry.findMany({
      orderBy: { date: "desc" },
      take: 20,
      include: { company: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Entreprises</h1>
        <p className="text-sm text-zinc-500">
          Gérez vos 3 entreprises et alimentez leurs métriques marketing.
        </p>
      </div>

      <Card title="Vos entreprises">
        <ul className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
          {companies.map((company) => (
            <li key={company.id} className="flex flex-wrap items-center gap-3 py-3">
              {company.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={company.logoUrl}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span
                  className="h-9 w-9 shrink-0 rounded-full"
                  style={{ backgroundColor: company.color }}
                />
              )}
              <form action={updateCompany} className="flex flex-1 flex-wrap items-center gap-3">
                <input type="hidden" name="id" value={company.id} />
                <input type="color" name="color" defaultValue={company.color} className="h-9 w-12 rounded border border-zinc-300 dark:border-zinc-700" />
                <input name="name" defaultValue={company.name} required className={`${inputClass} max-w-xs`} />
                <input
                  name="logoUrl"
                  defaultValue={company.logoUrl ?? ""}
                  placeholder="URL du logo (ex: /logos/monentreprise.png)"
                  className={`${inputClass} max-w-xs`}
                />
                <button type="submit" className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                  Enregistrer
                </button>
              </form>
              <DeleteButton
                id={company.id}
                action={deleteCompany}
                confirmMessage={`Supprimer ${company.name} et toutes ses données (tâches, contenus, métriques) ?`}
              />
            </li>
          ))}
        </ul>

        <form action={createCompany} className="mt-4 flex flex-wrap items-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <div>
            <label className={labelClass}>Couleur</label>
            <input type="color" name="color" defaultValue="#6366f1" className="h-9 w-12 rounded border border-zinc-300 dark:border-zinc-700" />
          </div>
          <div className="flex-1">
            <label className={labelClass}>Nouvelle entreprise</label>
            <input name="name" required className={inputClass} placeholder="Nom de l'entreprise" />
          </div>
          <button type="submit" className={buttonClass}>
            Ajouter
          </button>
        </form>
      </Card>

      <Card title="Ajouter une métrique">
        <form action={createMetricEntry} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <div>
            <label className={labelClass}>Métrique</label>
            <select name="type" required className={inputClass} defaultValue="FOLLOWERS">
              {Object.entries(metricTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Valeur</label>
            <input type="number" step="any" name="value" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Date</label>
            <input type="date" name="date" required className={inputClass} />
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <button type="submit" className={buttonClass}>
              Enregistrer la métrique
            </button>
          </div>
        </form>
      </Card>

      <Card title="Dernières métriques">
        {recentMetrics.length === 0 ? (
          <p className="text-sm text-zinc-500">Aucune métrique enregistrée.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
            {recentMetrics.map((metric) => (
              <li key={metric.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="text-sm">
                  <span className="font-medium text-zinc-800 dark:text-zinc-100">
                    {metric.company.name}
                  </span>
                  <span className="text-zinc-500"> · {metricTypeLabels[metric.type]} · </span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {metric.value.toLocaleString("fr-FR")}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {" "}
                    ({format(metric.date, "d MMM yyyy", { locale: fr })})
                  </span>
                </div>
                <DeleteButton id={metric.id} action={deleteMetricEntry} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
