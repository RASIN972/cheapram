import { NextRequest, NextResponse } from "next/server";
import { ensureRetailer, upsertListings } from "@/lib/feeds/ingest";
import { getMockListings } from "@/lib/feeds/mock";
import { fetchNeweggListings } from "@/lib/feeds/newegg";

/**
 * Vercel Cron (or external cron) can call this route to refresh product data.
 * Protect with CRON_SECRET: send it in the Authorization header as "Bearer <CRON_SECRET>".
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const NEWEGG_FEED_URL = process.env.NEWEGG_FEED_URL;
  const hasRealFeeds =
    !!NEWEGG_FEED_URL ||
    !!(process.env.AMAZON_TAG && process.env.AMAZON_ACCESS_KEY);

  if (!hasRealFeeds) {
    const mockRetailerId = await ensureRetailer(
      "CheapRam Demo",
      "demo.cheapram.local",
      null
    );
    const mockListings = getMockListings(mockRetailerId);
    await upsertListings(mockListings);
  }

  if (NEWEGG_FEED_URL) {
    try {
      const neweggRetailerId = await ensureRetailer(
        "Newegg",
        "newegg.com",
        process.env.NEWEGG_AFFILIATE_ID ?? null
      );
      const neweggListings = await fetchNeweggListings(
        neweggRetailerId,
        NEWEGG_FEED_URL
      );
      if (neweggListings.length > 0) {
        await upsertListings(neweggListings);
      }
    } catch (err) {
      console.error("Newegg feed error:", err);
    }
  }

  if (
    process.env.AMAZON_TAG &&
    process.env.AMAZON_ACCESS_KEY &&
    process.env.AMAZON_SECRET_KEY
  ) {
    try {
      const { fetchAmazonListings } = await import("@/lib/feeds/amazon");
      const amazonRetailerId = await ensureRetailer(
        "Amazon",
        "amazon.com",
        process.env.AMAZON_TAG
      );
      const amazonListings = await fetchAmazonListings(amazonRetailerId, {
        accessKey: process.env.AMAZON_ACCESS_KEY,
        secretKey: process.env.AMAZON_SECRET_KEY,
        tag: process.env.AMAZON_TAG,
        region: process.env.AMAZON_REGION || "us-east-1",
      });
      if (amazonListings.length > 0) {
        await upsertListings(amazonListings);
      }
    } catch (err) {
      console.error("Amazon feed error:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
