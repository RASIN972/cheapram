/**
 * Coupon fetcher/parser placeholder.
 * At MVP: coupons can be added manually via DB or a future admin.
 * Later: integrate a single trusted source (e.g. retailer promo page or deal API)
 * and run on the same schedule as refresh-feeds.
 */

import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getCouponsForRetailer(retailerId: number) {
  return db
    .select()
    .from(coupons)
    .where(eq(coupons.retailerId, retailerId))
    .all();
}

export async function getCouponForProduct(productId: number) {
  return db
    .select()
    .from(coupons)
    .where(eq(coupons.productId, productId))
    .get();
}
