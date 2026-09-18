"use client";

import { useTransition } from "react";
import { updateTaskStatus } from "@/app/actions";

export function TaskCheckbox({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <input
      type="checkbox"
      disabled={isPending}
      onChange={(e) => {
        const formData = new FormData();
        formData.set("id", id);
        formData.set("status", e.target.checked ? "DONE" : "TODO");
        startTransition(() => {
          updateTaskStatus(formData);
        });
      }}
      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800"
    />
  );
}
