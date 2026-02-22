import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { getCheapestByCapacity } from "@/lib/data";

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default async function HomePage() {
  const featured = await getCheapestByCapacity();
  return (
    <div className="space-y-10">
      <section className="text-center">
        <h1 className="text-3xl font-bold text-zinc-100 md:text-4xl">
          Find the cheapest RAM prices
        </h1>
        <p className="mt-2 text-zinc-400">
          Compare DDR4 and DDR5 memory across US retailers. Updated regularly.
        </p>
        <Link
          href="/ram"
          className="mt-6 inline-block rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-500"
        >
          Browse all deals
        </Link>
      </section>

      <AdSlot id="home-ad" />

      {featured.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-zinc-200">
            Cheapest by capacity
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map(({ capacity, priceCents, name, id }) => (
              <li key={id}>
                <Link
                  href={`/ram?capacity=${capacity}`}
                  className="block rounded-xl border border-zinc-700/50 bg-zinc-800/30 p-4 transition hover:border-zinc-600/50"
                >
                  <span className="font-medium text-zinc-100">{capacity}GB</span>
                  <p className="mt-1 text-lg text-emerald-400">
                    {formatPrice(priceCents)}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                    {name}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
