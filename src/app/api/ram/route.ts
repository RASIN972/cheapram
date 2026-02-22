import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, prices, retailers } from "@/lib/db/schema";

export type RamListingResponse = {
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

export async function GET(request: NextRequest) {
  try {
  const { searchParams } = new URL(request.url);
  const capacity = searchParams.get("capacity");
  const ddrType = searchParams.get("type"); // ddr4 | ddr5
  const formFactor = searchParams.get("form"); // dimm | sodimm
  const retailerId = searchParams.get("retailer");
  const sort = searchParams.get("sort") ?? "price"; // price | newest

  const capacityNum = capacity ? parseInt(capacity, 10) : null;
  const ddrNorm = ddrType?.toLowerCase() === "ddr5" ? "DDR5" : ddrType?.toLowerCase() === "ddr4" ? "DDR4" : null;
  const formNorm = formFactor?.toLowerCase() === "sodimm" ? "SODIMM" : formFactor?.toLowerCase() === "dimm" ? "DIMM" : null;
  const retailerIdNum = retailerId ? parseInt(retailerId, 10) : null;

  const rowsWithRetailer = await db
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
    .all();

  const byProduct2 = new Map<number, (typeof rowsWithRetailer)[0]>();
  for (const row of rowsWithRetailer) {
    if (!byProduct2.has(row.productId)) byProduct2.set(row.productId, row);
  }
  let list2 = Array.from(byProduct2.values());

  if (capacityNum != null && !isNaN(capacityNum)) {
    list2 = list2.filter((r) => r.capacityGb === capacityNum);
  }
  if (ddrNorm) {
    list2 = list2.filter((r) => r.ddrType === ddrNorm);
  }
  if (formNorm) {
    list2 = list2.filter((r) => r.formFactor === formNorm);
  }
  if (retailerIdNum != null && !isNaN(retailerIdNum)) {
    list2 = list2.filter((r) => r.retailerId === retailerIdNum);
  }

  if (sort === "newest") {
    list2.sort((a, b) => b.productId - a.productId);
  } else {
    list2.sort((a, b) => a.priceCents - b.priceCents);
  }

  const body: RamListingResponse[] = list2.map((r) => ({
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
    couponCode: null,
  }));

  return NextResponse.json(body);
  } catch {
    return NextResponse.json([]);
  }
}
