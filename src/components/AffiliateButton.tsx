import type { ReactNode } from "react";

interface AffiliateButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
  retailerName?: string;
}

export function AffiliateButton({
  href,
  children,
  className = "",
  retailerName,
}: AffiliateButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 ${className}`}
      title={retailerName ? `Check price at ${retailerName}` : "Check price"}
    >
      {children}
    </a>
  );
}
