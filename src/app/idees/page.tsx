import { prisma } from "@/lib/prisma";
import { ALL_COMPANIES, getCompanies, getSelectedCompanyId } from "@/lib/selection";
import { companyFilter } from "@/lib/queries";
import { createIdea, deleteIdea, promoteIdeaToContent } from "@/app/actions";
import { Card, Badge } from "@/components/ui";
import { DeleteButton } from "@/components/delete-button";
import { inputClass, labelClass, buttonClass } from "@/lib/ui-classes";
import { contentFormatColors, contentFormatLabels } from "@/lib/labels";

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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Idées</h1>
        <p className="text-sm text-zinc-500">
          Notez vos idées de vidéos ou de posts, avant de les planifier dans le calendrier.
        </p>
      </div>

      <Card title="Ajouter une idée">
        <form action={createIdea} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isAll ? (
            <div>
              <label className={labelClass}>Entreprise</label>
              <select name="companyId" required className={inputClass}>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <input type="hidden" name="companyId" value={selectedId} />
          )}

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

          <div className="flex items-end sm:col-span-2 lg:col-span-4">
            <button type="submit" className={buttonClass}>
              Ajouter l&apos;idée
            </button>
          </div>
        </form>
      </Card>

      <Card title={`Idées (${ideas.length})`}>
        {ideas.length === 0 ? (
          <p className="text-sm text-zinc-500">Aucune idée pour le moment.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
            {ideas.map((idea) => (
              <li key={idea.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <Badge className={contentFormatColors[idea.format]}>
                    {contentFormatLabels[idea.format]}
                  </Badge>
                  <p className="text-sm text-zinc-800 dark:text-zinc-100">{idea.content}</p>
                  {isAll && (
                    <Badge className="bg-transparent" style={{ color: idea.company.color }}>
                      {idea.company.name}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <form action={promoteIdeaToContent} className="flex items-center gap-2">
                    <input type="hidden" name="ideaId" value={idea.id} />
                    <input type="date" name="scheduledAt" required className={`${inputClass} py-1`} />
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
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
