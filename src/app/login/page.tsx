import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { login } from "./actions";
import { AUTH_COOKIE, isValidAuthToken } from "@/lib/auth";
import { inputClass, labelClass, buttonClass } from "@/lib/ui-classes";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const store = await cookies();
  if (isValidAuthToken(store.get(AUTH_COOKIE)?.value)) {
    redirect("/");
  }

  const { error } = await searchParams;

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="mb-1 text-xl font-semibold text-zinc-900 dark:text-white">
          Marketing Hub
        </h1>
        <p className="mb-6 text-sm text-zinc-500">
          Entrez le mot de passe pour accéder à l&apos;espace.
        </p>
        <form action={login} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Mot de passe</label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className={inputClass}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">Mot de passe incorrect.</p>
          )}
          <button type="submit" className={buttonClass}>
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
