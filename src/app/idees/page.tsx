import { prisma } from "@/lib/prisma";
import { ALL_COMPANIES, getCompanies, getSelectedCompanyId } from "@/lib/selection";
import { companyFilter } from "@/lib/queries";
import { createIdea, deleteIdea, promoteIdeaToContent } from "@/app/actions";
import { Card, Badge } from "@/components/ui";
import { DeleteButton } from "@/components/delete-button";
import { CompanyBadge } from "@/components/company-badge";
import { inputClass, labelClass, buttonClass } from "@/lib/ui-classes";
import { contentFormatColors, contentFormatLabels } from "@/lib/labels";
import type { Company, Idea } from "@prisma/client";

type IdeaWithCompany = Idea & { company: Company };

function IdeaRow({ idea }: { idea: IdeaWithCompany }) {
  return (
    <li className="flex flex-col gap-2 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={contentFormatColors[idea.format]}>
          {contentFormatLabels[idea.format]}
        </Badge>
        <p className="text-sm text-zinc-800 dark:text-zinc-100">{idea.content}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <form action={promoteIdeaToContent} className="flex items-center gap-2">
          <input type="hidden" name="ideaId" value={idea.id} />
          <input
            type="date"
            name="scheduledAt"
            required
            className={`${inputClass} px-2 py-1 text-xs`}
          />
          <button
            type="submit"
            className="whitespace-nowrap text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Planifier →
          </button>
        </form>
        <DeleteButton id={idea.id} action={deleteIdea} />
      </div>
    </li>
  );
}

export default async function IdeasPage() {
  const selectedId = await getSelectedCompanyId();
  const isAll = selectedId === ALL_COMPANIES;

  const [companies, ideas] = await Promise.all([
    getCompanies(),
    prisma.idea.findMany({
      where: companyFilter(selectedId),
      orderBy: { createdAt: "desc" },
      include: { company: true },
    }),
  ]);

  const ideasByCompany = new Map<string, IdeaWithCompany[]>();
  for (const idea of ideas) {
    const list = ideasByCompany.get(idea.companyId) ?? [];
    list.push(idea);
    ideasByCompany.set(idea.companyId, list);
  }

  const visibleCompanies = isAll ? companies : companies.filter((c) => c.id === selectedId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Idées</h1>
        <p className="text-sm text-zinc-500">
          Notez vos idées de vidéos ou de posts, avant de les planifier dans le calendrier.
        </p>
      </div>

      <Card title="Ajouter une idée">
        <form action={createIdea} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Entreprise(s)</label>
            {isAll ? (
              <div className="flex flex-wrap gap-3">
                {companies.map((c) => (
                  <label
                    key={c.id}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
                  >
                    <input
                      type="checkbox"
                      name="companyIds"
                      value={c.id}
                      className="rounded border-zinc-300 dark:border-zinc-600"
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            ) : (
              <input type="hidden" name="companyIds" value={selectedId} />
            )}
            {isAll && (
              <p className="mt-1.5 text-xs text-zinc-400">
                Cochez plusieurs entreprises pour une idée partagée (ex: même vidéo à
                décliner sur plusieurs comptes).
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-1 lg:col-span-2">
              <label className={labelClass}>Idée</label>
              <input
                name="content"
                required
                className={inputClass}
                placeholder="Ex: Vidéo behind-the-scenes de l'atelier"
              />
            </div>

            <div>
              <label className={labelClass}>Type</label>
              <select name="format" className={inputClass} defaultValue="POST">
                {Object.entries(contentFormatLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <button type="submit" className={buttonClass}>
              Ajouter l&apos;idée
            </button>
          </div>
        </form>
      </Card>

      <div className={isAll ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : ""}>
        {visibleCompanies.map((company) => {
          const companyIdeas = ideasByCompany.get(company.id) ?? [];
          return (
            <Card key={company.id} title={isAll ? undefined : `Idées (${companyIdeas.length})`}>
              {isAll && (
                <div className="mb-3 flex items-center justify-between">
                  <CompanyBadge
                    name={company.name}
                    color={company.color}
                    logoUrl={company.logoUrl}
                    className="text-sm font-semibold"
                  />
                  <span className="text-xs text-zinc-400">{companyIdeas.length}</span>
                </div>
              )}
              {companyIdeas.length === 0 ? (
                <p className="text-sm text-zinc-500">Aucune idée.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
                  {companyIdeas.map((idea) => (
                    <IdeaRow key={idea.id} idea={idea} />
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
