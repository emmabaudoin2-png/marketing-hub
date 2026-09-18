import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ALL_COMPANIES, getCompanies, getSelectedCompany, getSelectedCompanyId } from "@/lib/selection";
import {
  getContentCounts,
  getLatestMetrics,
  getMetricSeries,
  getTaskCounts,
  getUpcomingContent,
  getUpcomingTasks,
} from "@/lib/queries";
import { Card, StatCard, Badge } from "@/components/ui";
import { TrendChart } from "@/components/charts/trend-chart";
import { CompareChart } from "@/components/charts/compare-chart";
import { TaskCheckbox } from "@/components/task-checkbox";
import {
  contentStatusColors,
  contentStatusLabels,
  taskPriorityColors,
  taskPriorityLabels,
} from "@/lib/labels";

export default async function DashboardPage() {
  const selectedId = await getSelectedCompanyId();
  const isAll = selectedId === ALL_COMPANIES;

  const [selectedCompany, taskCounts, contentCounts, upcomingTasks, upcomingContent, companies] =
    await Promise.all([
      getSelectedCompany(),
      getTaskCounts(selectedId),
      getContentCounts(selectedId),
      getUpcomingTasks(selectedId, 5),
      getUpcomingContent(selectedId, 5),
      isAll ? getCompanies() : Promise.resolve([]),
    ]);

  const upcomingContentByCompany = isAll
    ? await Promise.all(
        companies.map(async (company) => ({
          company,
          items: await getUpcomingContent(company.id, 4),
        }))
      )
    : [];

  const contentTodo =
    contentCounts.IDEA + contentCounts.PLANNED + contentCounts.IN_PROGRESS + contentCounts.SCHEDULED;

  const tasksCard = (
    <Card title="Tâches à venir">
      {upcomingTasks.length === 0 ? (
        <p className="text-sm text-zinc-500">Aucune tâche en attente.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {upcomingTasks.map((task) => (
            <li key={task.id} className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <TaskCheckbox id={task.id} />
                <div>
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                    {task.title}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {isAll && `${task.company.name} · `}
                    {task.dueDate
                      ? format(task.dueDate, "d MMM yyyy", { locale: fr })
                      : "Sans échéance"}
                  </p>
                </div>
              </div>
              <Badge className={taskPriorityColors[task.priority]}>
                {taskPriorityLabels[task.priority]}
              </Badge>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 text-right">
        <Link
          href="/taches"
          className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Voir toutes les tâches →
        </Link>
      </div>
    </Card>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Tableau de bord
        </h1>
        <p className="text-sm text-zinc-500">
          {isAll ? "Vue globale sur les 3 entreprises" : selectedCompany?.name}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Tâches à faire" value={taskCounts.TODO} />
        <StatCard label="Tâches en cours" value={taskCounts.IN_PROGRESS} />
        <StatCard label="Tâches terminées" value={taskCounts.DONE} />
        <StatCard
          label="Contenus à publier"
          value={contentTodo}
          hint={`${contentCounts.PUBLISHED} déjà publiés`}
        />
      </div>

      <Card title={isAll ? "Comparaison entre entreprises" : "Évolution des métriques"}>
        {isAll ? (
          <CompareChart
            entries={(await getLatestMetrics(selectedId)).map((m) => ({
              companyName: m.company.name,
              color: m.company.color,
              type: m.type,
              value: m.value,
            }))}
          />
        ) : (
          <TrendChart
            entries={(await getMetricSeries(selectedId)).map((m) => ({
              date: m.date.toISOString(),
              type: m.type,
              value: m.value,
            }))}
          />
        )}
        <div className="mt-3 text-right">
          <Link
            href="/entreprises"
            className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Ajouter une métrique →
          </Link>
        </div>
      </Card>

      {isAll ? (
        <>
          {tasksCard}

          <Card title="Contenus à venir">
            <div className="grid gap-5 sm:grid-cols-3">
              {upcomingContentByCompany.map(({ company, items }) => (
                <div key={company.id}>
                  <p
                    className="mb-2 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: company.color }}
                  >
                    {company.name}
                  </p>
                  {items.length === 0 ? (
                    <p className="text-xs text-zinc-400">Aucun contenu planifié.</p>
                  ) : (
                    <ul className="flex flex-col gap-3">
                      {items.map((item) => (
                        <li key={item.id}>
                          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                            {item.title}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {format(item.scheduledAt, "d MMM yyyy", { locale: fr })}
                          </p>
                          <Badge className={`mt-1 ${contentStatusColors[item.status]}`}>
                            {contentStatusLabels[item.status]}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 text-right">
              <Link
                href="/calendrier"
                className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Voir le calendrier →
              </Link>
            </div>
          </Card>
        </>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tasksCard}

          <Card title="Contenus à venir">
            {upcomingContent.length === 0 ? (
              <p className="text-sm text-zinc-500">Aucun contenu planifié.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {upcomingContent.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                        {item.title}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {format(item.scheduledAt, "d MMM yyyy", { locale: fr })}
                      </p>
                    </div>
                    <Badge className={contentStatusColors[item.status]}>
                      {contentStatusLabels[item.status]}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 text-right">
              <Link
                href="/calendrier"
                className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Voir le calendrier →
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
