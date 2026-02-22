import { desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, prices, retailers } from "@/lib/db/schema";
import { getCouponForProduct } from "@/lib/coupons";

export type RamListing = {
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
  retailerDomain: string;
  couponCode: string | null;
};

export type FiltersData = {
  capacities: number[];
  retailers: { id: number; name: string }[];
  ddrTypes: string[];
  formFactors: string[];
};

function dedupeLatestPrice<T extends { productId: number }>(rows: T[]): T[] {
  const byProduct = new Map<number, T>();
  for (const row of rows) {
    if (!byProduct.has(row.productId)) byProduct.set(row.productId, row);
  }
  return Array.from(byProduct.values());
}

export async function getRamListings(params: {
  capacity?: number;
  ddrType?: string;
  formFactor?: string;
  retailerId?: number;
  sort?: "price" | "newest";
}): Promise<RamListing[]> {
  type Row = {
    productId: number;
    retailerId: number;
    name: string;
    capacityGb: number | null;
    speedMhz: number | null;
    ddrType: string | null;
    formFactor: string | null;
    productUrl: string;
    imageUrl: string | null;
    priceCents: number;
    currency: string | null;
    retailerName: string;
    retailerDomain: string;
  };
  const rows = (await db
    .select({
      productId: products.id,
      retailerId: products.retailerId,
      name: products.name,
      capacityGb: products.capacityGb,
      speedMhz: products.speedMhz,
      ddrType: products.ddrType,
      formFactor: products.formFactor,
      productUrl: products.productUrl,
      imageUrl: products.imageUrl,
      priceCents: prices.priceCents,
      currency: prices.currency,
      retailerName: retailers.name,
      retailerDomain: retailers.domain,
    })
    .from(products)
    .innerJoin(retailers, eq(products.retailerId, retailers.id))
    .innerJoin(prices, eq(prices.productId, products.id))
    .orderBy(desc(prices.recordedAt))
    .all()) as Row[];

  let list = dedupeLatestPrice(rows);

  if (params.capacity != null) {
    list = list.filter((r) => r.capacityGb === params.capacity);
  }
  if (params.ddrType) {
    list = list.filter((r) => r.ddrType === params.ddrType);
  }
  if (params.formFactor) {
    list = list.filter((r) => r.formFactor === params.formFactor);
  }
  if (params.retailerId != null) {
    list = list.filter((r) => r.retailerId === params.retailerId);
  }

  if (params.sort === "newest") {
    list.sort((a, b) => b.productId - a.productId);
  } else {
    list.sort((a, b) => a.priceCents - b.priceCents);
  }

  const result: RamListing[] = [];
  for (const r of list) {
    const coupon = await getCouponForProduct(r.productId);
    result.push({
      id: r.productId,
      name: r.name,
      capacityGb: r.capacityGb,
      speedMhz: r.speedMhz,
      ddrType: r.ddrType,
      formFactor: r.formFactor,
      productUrl: r.productUrl,
      imageUrl: r.imageUrl,
      priceCents: r.priceCents,
      currency: r.currency ?? "USD",
      retailerName: r.retailerName,
      retailerDomain: r.retailerDomain,
      couponCode: coupon?.code ?? null,
    });
  }
  return result;
}

export async function getCheapestByCapacity(): Promise<
  Array<{ capacity: number; priceCents: number; name: string; id: number }>
> {
  const list = await getRamListings({ sort: "price" });
  const byCap = new Map<
    number,
    { priceCents: number; name: string; id: number }
  >();
  for (const row of list) {
    if (row.capacityGb == null) continue;
    const cur = byCap.get(row.capacityGb);
    if (!cur || row.priceCents < cur.priceCents) {
      byCap.set(row.capacityGb, {
        priceCents: row.priceCents,
        name: row.name,
        id: row.id,
      });
    }
  }
  return Array.from(byCap.entries())
    .map(([capacity, v]) => ({ capacity, ...v }))
    .sort((a, b) => a.capacity - b.capacity);
}

export async function getFiltersData(): Promise<FiltersData> {
  const retailerList = await db
    .select({ id: retailers.id, name: retailers.name })
    .from(retailers)
    .all();
  const capRows = (await db
    .selectDistinct({ capacityGb: products.capacityGb })
    .from(products)
    .where(isNotNull(products.capacityGb))
    .orderBy(products.capacityGb)
    .all()) as { capacityGb: number | null }[];
  const capacities = capRows
    .map((c) => c.capacityGb)
    .filter((c): c is number => c != null);
  return {
    capacities,
    retailers: retailerList,
    ddrTypes: ["DDR4", "DDR5"],
    formFactors: ["DIMM", "SODIMM"],
  };
}
