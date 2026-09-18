"use client";

import { useTransition } from "react";
import { setSelectedCompany } from "@/app/actions";
import { ALL_COMPANIES } from "@/lib/constants";

type Company = {
  id: string;
  name: string;
  color: string;
};

export function CompanySwitcher({
  companies,
  selectedId,
}: {
  companies: Company[];
  selectedId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={selectedId}
      disabled={isPending}
      onChange={(e) => {
        const value = e.target.value;
        startTransition(() => {
          setSelectedCompany(value);
        });
      }}
      className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
    >
      <option value={ALL_COMPANIES}>Toutes les entreprises</option>
      {companies.map((company) => (
        <option key={company.id} value={company.id}>
          {company.name}
        </option>
      ))}
    </select>
  );
}
