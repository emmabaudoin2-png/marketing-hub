import { getCompanies, getSelectedCompanyId } from "@/lib/selection";
import { CompanySwitcher } from "@/components/company-switcher";
import { NavLinks } from "@/components/nav-links";

export async function Header() {
  const [companies, selectedId] = await Promise.all([
    getCompanies(),
    getSelectedCompanyId(),
  ]);

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-6">
          <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
            Marketing Hub
          </span>
          <NavLinks />
        </div>
        <CompanySwitcher companies={companies} selectedId={selectedId} />
      </div>
    </header>
  );
}
