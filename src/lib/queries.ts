import { prisma } from "@/lib/prisma";
import { ALL_COMPANIES } from "@/lib/selection";

export function companyFilter(companyId: string) {
  return companyId === ALL_COMPANIES ? {} : { companyId };
}

export async function getTaskCounts(companyId: string) {
  const grouped = await prisma.task.groupBy({
    by: ["status"],
    where: companyFilter(companyId),
    _count: { _all: true },
  });
  const counts = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
  for (const row of grouped) counts[row.status] = row._count._all;
  return counts;
}

export async function getContentCounts(companyId: string) {
  const grouped = await prisma.contentItem.groupBy({
    by: ["status"],
    where: companyFilter(companyId),
    _count: { _all: true },
  });
  const counts = {
    IDEA: 0,
    PLANNED: 0,
    IN_PROGRESS: 0,
    SCHEDULED: 0,
    PUBLISHED: 0,
  };
  for (const row of grouped) counts[row.status] = row._count._all;
  return counts;
}

export function getUpcomingTasks(companyId: string, take = 5) {
  return prisma.task.findMany({
    where: { ...companyFilter(companyId), status: { not: "DONE" } },
    orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
    take,
    include: { company: true },
  });
}

export function getUpcomingContent(companyId: string, take = 5) {
  return prisma.contentItem.findMany({
    where: { ...companyFilter(companyId), status: { not: "PUBLISHED" } },
    orderBy: { scheduledAt: "asc" },
    take,
    include: { company: true },
  });
}

export function getLatestMetrics(companyId: string) {
  return prisma.metricEntry.findMany({
    where: companyFilter(companyId),
    orderBy: [{ date: "desc" }],
    distinct: ["companyId", "type"],
    include: { company: true },
  });
}

export function getMetricSeries(companyId: string) {
  return prisma.metricEntry.findMany({
    where: companyFilter(companyId),
    orderBy: { date: "asc" },
  });
}
