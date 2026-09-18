import { format, isSameMonth, isToday } from "date-fns";
import clsx from "clsx";
import type { Company, ContentItem } from "@prisma/client";
import { weekdayLabels } from "@/lib/calendar-grid";
import { contentFormatColors, contentFormatLabels } from "@/lib/labels";

type ItemWithCompany = ContentItem & { company: Company };

export function CalendarGrid({
  weeks,
  month,
  items,
  isAll,
}: {
  weeks: Date[][];
  month: Date;
  items: ItemWithCompany[];
  isAll: boolean;
}) {
  const itemsByDay = new Map<string, ItemWithCompany[]>();
  for (const item of items) {
    const key = format(item.scheduledAt, "yyyy-MM-dd");
    const list = itemsByDay.get(key) ?? [];
    list.push(item);
    itemsByDay.set(key, list);
  }

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[720px] grid-cols-7 gap-px overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="bg-zinc-50 px-2 py-1.5 text-center text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
          >
            {label}
          </div>
        ))}

        {weeks.flatMap((week) =>
          week.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayItems = itemsByDay.get(key) ?? [];
            const inMonth = isSameMonth(day, month);
            const shown = dayItems.slice(0, 3);
            const extra = dayItems.length - shown.length;

            return (
              <div
                key={key}
                className={clsx(
                  "min-h-[104px] bg-white p-1.5 dark:bg-zinc-950",
                  !inMonth && "bg-zinc-50 dark:bg-zinc-900/40"
                )}
              >
                <p
                  className={clsx(
                    "mb-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs",
                    isToday(day)
                      ? "bg-zinc-900 font-semibold text-white dark:bg-white dark:text-zinc-900"
                      : inMonth
                        ? "text-zinc-600 dark:text-zinc-300"
                        : "text-zinc-300 dark:text-zinc-700"
                  )}
                >
                  {format(day, "d")}
                </p>
                <div className="flex flex-col gap-1">
                  {shown.map((item) => (
                    <p
                      key={item.id}
                      title={`${item.title}${isAll ? ` · ${item.company.name}` : ""}`}
                      className={clsx(
                        "truncate rounded px-1.5 py-0.5 text-[11px] font-medium",
                        contentFormatColors[item.format]
                      )}
                    >
                      {item.title}
                    </p>
                  ))}
                  {extra > 0 && (
                    <p className="px-1.5 text-[11px] text-zinc-400">+{extra} autre{extra > 1 ? "s" : ""}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        {Object.entries(contentFormatLabels).map(([value, label]) => (
          <span key={value} className="inline-flex items-center gap-1.5">
            <span className={clsx("h-2.5 w-2.5 rounded-full", contentFormatColors[value as keyof typeof contentFormatColors])} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
