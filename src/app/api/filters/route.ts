import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { retailers, products } from "@/lib/db/schema";
import { isNotNull } from "drizzle-orm";

export async function GET() {
  const retailerList = await db.select({ id: retailers.id, name: retailers.name }).from(retailers).all();
  const capacities = await db
    .selectDistinct({ capacityGb: products.capacityGb })
    .from(products)
    .where(isNotNull(products.capacityGb))
    .orderBy(products.capacityGb)
    .all();
  return NextResponse.json({
    capacities: capacities.map((c: { capacityGb: number | null }) => c.capacityGb).filter((c: number | null): c is number => c != null),
    retailers: retailerList,
    ddrTypes: ["DDR4", "DDR5"],
    formFactors: ["DIMM", "SODIMM"],
  });
}
