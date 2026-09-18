import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ALL_COMPANIES, SELECTED_COMPANY_COOKIE } from "@/lib/constants";

export { ALL_COMPANIES, SELECTED_COMPANY_COOKIE };

export async function getSelectedCompanyId(): Promise<string> {
  const store = await cookies();
  return store.get(SELECTED_COMPANY_COOKIE)?.value ?? ALL_COMPANIES;
}

export function getCompanies() {
  return prisma.company.findMany({ orderBy: { createdAt: "asc" } });
}

export async function getSelectedCompany() {
  const id = await getSelectedCompanyId();
  if (id === ALL_COMPANIES) return null;
  return prisma.company.findUnique({ where: { id } });
}
