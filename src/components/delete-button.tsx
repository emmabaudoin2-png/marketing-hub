"use client";

import { useTransition } from "react";

export function DeleteButton({
  id,
  action,
  label = "Supprimer",
  confirmMessage = "Confirmer la suppression ?",
}: {
  id: string;
  action: (formData: FormData) => void;
  label?: string;
  confirmMessage?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(confirmMessage)) return;
        const formData = new FormData();
        formData.set("id", id);
        startTransition(() => {
          action(formData);
        });
      }}
      className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
    >
      {label}
    </button>
  );
}
