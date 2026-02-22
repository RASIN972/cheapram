import type { Metadata } from "next";
import { Filters } from "@/components/Filters";
import { ProductCard } from "@/components/ProductCard";
import { AdSlot } from "@/components/AdSlot";
import {
  getFiltersData,
  getRamListings,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "RAM Deals – Compare Prices",
  description:
    "Compare RAM deals and prices. Filter by capacity, DDR4/DDR5, and retailer. Find the cheapest memory.",
};

export default async function RamPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const capacityNum = params.capacity
    ? parseInt(params.capacity, 10)
    : undefined;
  const ddrType =
    params.type?.toLowerCase() === "ddr5"
      ? "DDR5"
      : params.type?.toLowerCase() === "ddr4"
        ? "DDR4"
        : undefined;
  const formFactor =
    params.form?.toLowerCase() === "sodimm"
      ? "SODIMM"
      : params.form?.toLowerCase() === "dimm"
        ? "DIMM"
        : undefined;
  const retailerId = params.retailer
    ? parseInt(params.retailer, 10)
    : undefined;
  const sort =
    params.sort === "newest" ? ("newest" as const) : ("price" as const);

  const filtersData = await getFiltersData();
  const listings = await getRamListings({
    capacity: capacityNum,
    ddrType,
    formFactor,
    retailerId,
    sort,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">RAM deals</h1>
      </div>
      <Filters data={filtersData} />
      <AdSlot id="listings-top" />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((item: Parameters<typeof ProductCard>[0]) => (
          <li key={item.id}>
            <ProductCard {...item} />
          </li>
        ))}
      </ul>
      {listings.length === 0 && (
        <p className="py-8 text-center text-zinc-500">
          No listings match your filters. Try adjusting filters or run{" "}
          <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-sm">
            npm run refresh-feeds
          </code>{" "}
          to seed data.
        </p>
      )}
      <AdSlot id="listings-bottom" />
    </div>
  );
}
