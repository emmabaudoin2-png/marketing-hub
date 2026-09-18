import type {
  ContentChannel,
  ContentFormat,
  ContentStatus,
  MetricType,
  TaskStatus,
} from "@prisma/client";

export const contentChannelLabels: Record<ContentChannel, string> = {
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  LINKEDIN: "LinkedIn",
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
  BLOG: "Blog",
  EMAIL: "Email",
  OTHER: "Autre",
};

export const contentFormatLabels: Record<ContentFormat, string> = {
  VIDEO: "Vidéo",
  POST: "Post",
  STORY: "Story",
};

export const contentFormatColors: Record<ContentFormat, string> = {
  VIDEO: "bg-rose-100 text-rose-700",
  POST: "bg-indigo-100 text-indigo-700",
  STORY: "bg-orange-100 text-orange-700",
};

export const contentStatusLabels: Record<ContentStatus, string> = {
  IDEA: "Idée",
  PLANNED: "Planifié",
  IN_PROGRESS: "En cours",
  SCHEDULED: "Programmé",
  PUBLISHED: "Publié",
};

export const contentStatusColors: Record<ContentStatus, string> = {
  IDEA: "bg-zinc-100 text-zinc-700",
  PLANNED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  SCHEDULED: "bg-purple-100 text-purple-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  DONE: "Terminé",
};

export const taskStatusColors: Record<TaskStatus, string> = {
  TODO: "bg-zinc-100 text-zinc-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  DONE: "bg-emerald-100 text-emerald-700",
};

export const metricTypeLabels: Record<MetricType, string> = {
  FOLLOWERS: "Abonnés",
  ENGAGEMENT: "Taux d'engagement (%)",
  WEBSITE_VISITORS: "Visiteurs du site",
  LEADS: "Leads générés",
  BUDGET_SPENT: "Budget dépensé (€)",
  CONVERSIONS: "Conversions",
};
