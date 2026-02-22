"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface FiltersData {
  capacities: number[];
  retailers: { id: number; name: string }[];
  ddrTypes: string[];
  formFactors: string[];
}

interface FiltersProps {
  data: FiltersData;
}

export function Filters({ data }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const capacity = searchParams.get("capacity") ?? "";
  const type = searchParams.get("type") ?? "";
  const form = searchParams.get("form") ?? "";
  const retailer = searchParams.get("retailer") ?? "";
  const sort = searchParams.get("sort") ?? "price";

  function update(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/ram?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4">
      <label className="flex items-center gap-2">
        <span className="text-sm text-zinc-400">Capacity</span>
        <select
          value={capacity}
          onChange={(e) => update("capacity", e.target.value)}
          className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-200"
        >
          <option value="">Any</option>
          {data.capacities.map((c) => (
            <option key={c} value={c}>{c}GB</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="text-sm text-zinc-400">Type</span>
        <select
          value={type}
          onChange={(e) => update("type", e.target.value)}
          className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-200"
        >
          <option value="">Any</option>
          {data.ddrTypes.map((t) => (
            <option key={t} value={t.toLowerCase()}>{t}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="text-sm text-zinc-400">Form</span>
        <select
          value={form}
          onChange={(e) => update("form", e.target.value)}
          className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-200"
        >
          <option value="">Any</option>
          {data.formFactors.map((f) => (
            <option key={f} value={f.toLowerCase()}>{f}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="text-sm text-zinc-400">Retailer</span>
        <select
          value={retailer}
          onChange={(e) => update("retailer", e.target.value)}
          className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-200"
        >
          <option value="">Any</option>
          {data.retailers.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="text-sm text-zinc-400">Sort</span>
        <select
          value={sort}
          onChange={(e) => update("sort", e.target.value)}
          className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-200"
        >
          <option value="price">Price low to high</option>
          <option value="newest">Newest</option>
        </select>
      </label>
    </div>
  );
}
