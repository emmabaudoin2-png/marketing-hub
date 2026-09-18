"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MetricType } from "@prisma/client";
import { metricTypeLabels } from "@/lib/labels";

type Entry = {
  companyName: string;
  color: string;
  type: MetricType;
  value: number;
};

export function CompareChart({ entries }: { entries: Entry[] }) {
  const types = useMemo(
    () => Array.from(new Set(entries.map((e) => e.type))),
    [entries]
  );
  const [selected, setSelected] = useState<MetricType | undefined>(types[0]);
  const activeType = selected && types.includes(selected) ? selected : types[0];

  const data = useMemo(
    () =>
      entries
        .filter((e) => e.type === activeType)
        .map((e) => ({ name: e.companyName, value: e.value, color: e.color })),
    [entries, activeType]
  );

  if (types.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Aucune métrique enregistrée pour l&apos;instant.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setSelected(type)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              type === activeType
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {metricTypeLabels[type]}
          </button>
        ))}
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={entry.name + index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
