"use client";

import { useTransition } from "react";

export function StatusSelect({
  id,
  value,
  options,
  action,
  className,
}: {
  id: string;
  value: string;
  options: { value: string; label: string }[];
  action: (formData: FormData) => void;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={value}
      disabled={isPending}
      onChange={(e) => {
        const formData = new FormData();
        formData.set("id", id);
        formData.set("status", e.target.value);
        startTransition(() => {
          action(formData);
        });
      }}
      className={className}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
