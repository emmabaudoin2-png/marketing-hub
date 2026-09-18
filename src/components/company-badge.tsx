export function CompanyBadge({
  name,
  color,
  logoUrl,
  className = "",
}: {
  name: string;
  color: string;
  logoUrl?: string | null;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${className}`}
      style={{ color: logoUrl ? undefined : color }}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" className="h-4 w-4 rounded-full object-cover" />
      ) : (
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      )}
      {name}
    </span>
  );
}
