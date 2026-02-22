import { eq, and } from "drizzle-orm";
import { db, products, prices, retailers } from "../db";
import type { NormalizedRamListing } from "./types";

const now = new Date();

export async function upsertListings(
  listings: NormalizedRamListing[]
): Promise<void> {
  for (const row of listings) {
    const existing = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.retailerId, row.retailerId),
          eq(products.externalId, row.externalId)
        )
      )
      .get();

    if (existing) {
      await db
        .update(products)
        .set({
          name: row.name,
          capacityGb: row.capacityGb,
          speedMhz: row.speedMhz,
          ddrType: row.ddrType,
          formFactor: row.formFactor,
          productUrl: row.productUrl,
          imageUrl: row.imageUrl,
          lastSeenAt: now,
        })
        .where(eq(products.id, existing.id))
        .run();
      await db.insert(prices).values({
        productId: existing.id,
        priceCents: row.priceCents,
        currency: row.currency,
        recordedAt: now,
      }).run();
    } else {
      await db.insert(products).values({
        retailerId: row.retailerId,
        externalId: row.externalId,
        name: row.name,
        capacityGb: row.capacityGb,
        speedMhz: row.speedMhz,
        ddrType: row.ddrType,
        formFactor: row.formFactor,
        productUrl: row.productUrl,
        imageUrl: row.imageUrl,
        lastSeenAt: now,
      }).run();
      const inserted = await db
        .select({ id: products.id })
        .from(products)
        .where(
          and(
            eq(products.retailerId, row.retailerId),
            eq(products.externalId, row.externalId)
          )
        )
        .get();
      if (inserted) {
        await db.insert(prices).values({
          productId: inserted.id,
          priceCents: row.priceCents,
          currency: row.currency,
          recordedAt: now,
        }).run();
      }
    }
  }
}

export async function ensureRetailer(
  name: string,
  domain: string,
  affiliateParam: string | null
): Promise<number> {
  const existing = await db
    .select({ id: retailers.id })
    .from(retailers)
    .where(eq(retailers.domain, domain))
    .get();
  if (existing) return existing.id;
  const result = await db
    .insert(retailers)
    .values({ name, domain, affiliateParam })
    .returning({ id: retailers.id })
    .get();
  return result?.id ?? 0;
}
