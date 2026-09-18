import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { ALL_COMPANIES, getCompanies, getSelectedCompanyId } from "@/lib/selection";
import { companyFilter } from "@/lib/queries";
import { createTask, deleteTask, updateTaskStatus } from "@/app/actions";
import { Card, Badge } from "@/components/ui";
import { StatusSelect } from "@/components/status-select";
import { DeleteButton } from "@/components/delete-button";
import { TaskFilters } from "@/components/task-filters";
import { inputClass, labelClass, buttonClass } from "@/lib/ui-classes";
import { taskPriorityColors, taskPriorityLabels, taskStatusColors, taskStatusLabels } from "@/lib/labels";
import type { TaskPriority, TaskStatus } from "@prisma/client";

type SearchParams = Promise<{ status?: string; priority?: string }>;

export default async function TasksPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const selectedId = await getSelectedCompanyId();
  const isAll = selectedId === ALL_COMPANIES;

  const statusFilter = params.status ?? "";
  const priorityFilter = params.priority ?? "";

  const where: {
    companyId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
  } = { ...companyFilter(selectedId) };
  if (statusFilter) where.status = statusFilter as TaskStatus;
  if (priorityFilter) where.priority = priorityFilter as TaskPriority;

  const [companies, tasks] = await Promise.all([
    getCompanies(),
    prisma.task.findMany({
      where,
      orderBy: [{ status: "asc" }, { dueDate: { sort: "asc", nulls: "last" } }],
      include: { company: true },
    }),
  ]);

  const statusOptions = Object.entries(taskStatusLabels).map(([value, label]) => ({
    value,
    label,
  }));

  const resetHref = "/taches";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Tâches marketing
        </h1>
        <p className="text-sm text-zinc-500">Suivez ce qui reste à faire, par priorité.</p>
      </div>

      <Card title="Ajouter une tâche">
        <form action={createTask} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

          <div className="sm:col-span-1 lg:col-span-2">
            <label className={labelClass}>Titre</label>
            <input name="title" required className={inputClass} placeholder="Ex: Préparer newsletter" />
          </div>

          <div>
            <label className={labelClass}>Priorité</label>
            <select name="priority" className={inputClass} defaultValue="MEDIUM">
              {Object.entries(taskPriorityLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Échéance (optionnel)</label>
            <input type="date" name="dueDate" className={inputClass} />
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <label className={labelClass}>Notes (optionnel)</label>
            <textarea name="notes" rows={2} className={inputClass} />
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <button type="submit" className={buttonClass}>
              Ajouter la tâche
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <TaskFilters status={statusFilter} priority={priorityFilter} resetHref={resetHref} />
      </Card>

      <Card title={`Tâches (${tasks.length})`}>
        {tasks.length === 0 ? (
          <p className="text-sm text-zinc-500">Aucune tâche ne correspond.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
            {tasks.map((task) => (
              <li key={task.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-zinc-800 dark:text-zinc-100">{task.title}</p>
                    <Badge className={taskPriorityColors[task.priority]}>
                      {taskPriorityLabels[task.priority]}
                    </Badge>
                    {isAll && (
                      <Badge
                        className="bg-transparent"
                        style={{ color: task.company.color }}
                      >
                        {task.company.name}
                      </Badge>
                    )}
                  </div>
                  {task.notes && <p className="mt-1 text-sm text-zinc-500">{task.notes}</p>}
                  <p className="mt-1 text-xs text-zinc-400">
                    {task.dueDate
                      ? `Échéance : ${format(task.dueDate, "d MMMM yyyy", { locale: fr })}`
                      : "Sans échéance"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusSelect
                    id={task.id}
                    value={task.status}
                    options={statusOptions}
                    action={updateTaskStatus}
                    className={`${taskStatusColors[task.status as TaskStatus]} rounded-full border-0 px-2.5 py-1 text-xs font-medium`}
                  />
                  <DeleteButton id={task.id} action={deleteTask} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
