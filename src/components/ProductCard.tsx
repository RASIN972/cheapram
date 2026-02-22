import { AffiliateButton } from "./AffiliateButton";

export interface ProductCardProps {
  id: number;
  name: string;
  capacityGb: number | null;
  speedMhz: number | null;
  ddrType: string | null;
  formFactor: string | null;
  productUrl: string;
  imageUrl: string | null;
  priceCents: number;
  currency: string;
  retailerName: string;
  couponCode: string | null;
}

function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(cents / 100);
}

export function ProductCard({
  name,
  capacityGb,
  speedMhz,
  ddrType,
  formFactor,
  productUrl,
  imageUrl,
  priceCents,
  currency,
  retailerName,
  couponCode,
}: ProductCardProps) {
  const specs = [capacityGb != null ? `${capacityGb}GB` : null, ddrType, speedMhz != null ? `${speedMhz}MHz` : null, formFactor].filter(Boolean);
  return (
    <article className="flex flex-col rounded-xl border border-zinc-700/50 bg-zinc-800/30 p-4 transition hover:border-zinc-600/50">
      <div className="mb-3 flex shrink-0 justify-center bg-zinc-800/50 rounded-lg h-32">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-contain" />
        ) : (
          <span className="flex items-center text-zinc-500 text-sm">No image</span>
        )}
      </div>
      <h3 className="mb-1 font-medium text-zinc-100 line-clamp-2">{name}</h3>
      {specs.length > 0 && (
        <p className="mb-2 text-xs text-zinc-400">{specs.join(" · ")}</p>
      )}
      {couponCode && (
        <p className="mb-2 text-xs text-emerald-400">Code: {couponCode}</p>
      )}
      <p className="mb-3 text-lg font-semibold text-emerald-400">
        {formatPrice(priceCents, currency)}
      </p>
      <p className="mb-3 text-xs text-zinc-500">{retailerName}</p>
      <AffiliateButton href={productUrl} retailerName={retailerName}>
        Check price
      </AffiliateButton>
    </article>
  );
}
