"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type {
  ContentChannel,
  ContentFormat,
  ContentStatus,
  MetricType,
  TaskPriority,
  TaskStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SELECTED_COMPANY_COOKIE } from "@/lib/selection";

export async function setSelectedCompany(companyId: string) {
  const store = await cookies();
  store.set(SELECTED_COMPANY_COOKIE, companyId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/", "layout");
}

// --- Companies ---

export async function createCompany(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const color = String(formData.get("color") ?? "#6366f1");
  if (!name) return;
  await prisma.company.create({ data: { name, color } });
  revalidatePath("/", "layout");
}

export async function updateCompany(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const color = String(formData.get("color") ?? "#6366f1");
  const logoUrl = (String(formData.get("logoUrl") ?? "").trim() || null) as string | null;
  if (!id || !name) return;
  await prisma.company.update({ where: { id }, data: { name, color, logoUrl } });
  revalidatePath("/", "layout");
}

export async function deleteCompany(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.company.delete({ where: { id } });
  revalidatePath("/", "layout");
}

// --- Content calendar ---

export async function createContentItem(formData: FormData) {
  const companyId = String(formData.get("companyId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = (String(formData.get("description") ?? "").trim() || null) as
    | string
    | null;
  const channel = String(formData.get("channel") ?? "OTHER") as ContentChannel;
  const format = String(formData.get("format") ?? "POST") as ContentFormat;
  const status = String(formData.get("status") ?? "IDEA") as ContentStatus;
  const publishedUrl = (String(formData.get("publishedUrl") ?? "").trim() || null) as
    | string
    | null;
  const scheduledAtRaw = String(formData.get("scheduledAt") ?? "");
  if (!companyId || !title || !scheduledAtRaw) return;

  await prisma.contentItem.create({
    data: {
      companyId,
      title,
      description,
      channel,
      format,
      status,
      publishedUrl,
      scheduledAt: new Date(scheduledAtRaw),
    },
  });
  revalidatePath("/calendrier");
  revalidatePath("/");
}

export async function updateContentItem(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const companyId = String(formData.get("companyId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = (String(formData.get("description") ?? "").trim() || null) as
    | string
    | null;
  const channel = String(formData.get("channel") ?? "OTHER") as ContentChannel;
  const format = String(formData.get("format") ?? "POST") as ContentFormat;
  const status = String(formData.get("status") ?? "IDEA") as ContentStatus;
  const publishedUrl = (String(formData.get("publishedUrl") ?? "").trim() || null) as
    | string
    | null;
  const scheduledAtRaw = String(formData.get("scheduledAt") ?? "");
  if (!id || !companyId || !title || !scheduledAtRaw) return;

  await prisma.contentItem.update({
    where: { id },
    data: {
      companyId,
      title,
      description,
      channel,
      format,
      status,
      publishedUrl,
      scheduledAt: new Date(scheduledAtRaw),
    },
  });
  revalidatePath("/calendrier");
  revalidatePath("/");
}

export async function updateContentItemStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as ContentStatus;
  if (!id || !status) return;
  await prisma.contentItem.update({ where: { id }, data: { status } });
  revalidatePath("/calendrier");
  revalidatePath("/");
}

export async function deleteContentItem(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.contentItem.delete({ where: { id } });
  revalidatePath("/calendrier");
  revalidatePath("/");
}

// --- Tasks ---

export async function createTask(formData: FormData) {
  const companyId = String(formData.get("companyId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const notes = (String(formData.get("notes") ?? "").trim() || null) as string | null;
  const priority = String(formData.get("priority") ?? "MEDIUM") as TaskPriority;
  const dueDateRaw = String(formData.get("dueDate") ?? "");
  if (!companyId || !title) return;

  await prisma.task.create({
    data: {
      companyId,
      title,
      notes,
      priority,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
    },
  });
  revalidatePath("/taches");
  revalidatePath("/");
}

export async function updateTaskStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as TaskStatus;
  if (!id || !status) return;
  await prisma.task.update({ where: { id }, data: { status } });
  revalidatePath("/taches");
  revalidatePath("/");
}

export async function deleteTask(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.task.delete({ where: { id } });
  revalidatePath("/taches");
  revalidatePath("/");
}

// --- Metrics ---

export async function createMetricEntry(formData: FormData) {
  const companyId = String(formData.get("companyId") ?? "");
  const type = String(formData.get("type") ?? "") as MetricType;
  const value = Number(formData.get("value"));
  const dateRaw = String(formData.get("date") ?? "");
  if (!companyId || !type || Number.isNaN(value) || !dateRaw) return;

  await prisma.metricEntry.create({
    data: { companyId, type, value, date: new Date(dateRaw) },
  });
  revalidatePath("/");
  revalidatePath("/entreprises");
}

export async function deleteMetricEntry(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.metricEntry.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/entreprises");
}

// --- Ideas ---

export async function createIdea(formData: FormData) {
  const companyIds = formData.getAll("companyIds").map(String).filter(Boolean);
  const content = String(formData.get("content") ?? "").trim();
  const format = String(formData.get("format") ?? "POST") as ContentFormat;
  if (companyIds.length === 0 || !content) return;

  await prisma.idea.createMany({
    data: companyIds.map((companyId) => ({ companyId, content, format })),
  });
  revalidatePath("/idees");
}

export async function deleteIdea(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.idea.delete({ where: { id } });
  revalidatePath("/idees");
}

export async function promoteIdeaToContent(formData: FormData) {
  const ideaId = String(formData.get("ideaId") ?? "");
  const scheduledAtRaw = String(formData.get("scheduledAt") ?? "");
  if (!ideaId || !scheduledAtRaw) return;

  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) return;

  await prisma.$transaction([
    prisma.contentItem.create({
      data: {
        companyId: idea.companyId,
        title: idea.content,
        format: idea.format,
        status: "PLANNED",
        scheduledAt: new Date(scheduledAtRaw),
      },
    }),
    prisma.idea.delete({ where: { id: ideaId } }),
  ]);

  revalidatePath("/idees");
  revalidatePath("/calendrier");
  revalidatePath("/");
}
