#!/usr/bin/env npx tsx
/**
 * Refresh product and price data from affiliate feeds and coupon sources.
 * Run via: npm run refresh-feeds
 * Schedule with cron (e.g. daily) or a job runner.
 */
import { ensureRetailer, upsertListings } from "../src/lib/feeds/ingest";
import { getMockListings } from "../src/lib/feeds/mock";
import { fetchNeweggListings } from "../src/lib/feeds/newegg";

const NEWEGG_FEED_URL = process.env.NEWEGG_FEED_URL;
const DATABASE_PATH = process.env.DATABASE_PATH;

async function main() {
  if (DATABASE_PATH) {
    process.env.DATABASE_PATH = DATABASE_PATH;
  }

  const hasRealFeeds =
    !!NEWEGG_FEED_URL ||
    !!(process.env.AMAZON_TAG && process.env.AMAZON_ACCESS_KEY);

  // Only run mock feed when no real feeds are configured (so production shows real data only)
  if (!hasRealFeeds) {
    const mockRetailerId = await ensureRetailer(
      "CheapRam Demo",
      "demo.cheapram.local",
      null
    );
    const mockListings = getMockListings(mockRetailerId);
    await upsertListings(mockListings);
    console.log(`Upserted ${mockListings.length} mock listings.`);
  }

  if (NEWEGG_FEED_URL) {
    const neweggRetailerId = await ensureRetailer(
      "Newegg",
      "newegg.com",
      process.env.NEWEGG_AFFILIATE_ID ?? null
    );
    try {
      const neweggListings = await fetchNeweggListings(
        neweggRetailerId,
        NEWEGG_FEED_URL
      );
      if (neweggListings.length > 0) {
        await upsertListings(neweggListings);
        console.log(`Upserted ${neweggListings.length} Newegg listings.`);
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
    const { fetchAmazonListings } = await import(
      "../src/lib/feeds/amazon"
    );
    const amazonRetailerId = await ensureRetailer(
      "Amazon",
      "amazon.com",
      process.env.AMAZON_TAG
    );
    try {
      const amazonListings = await fetchAmazonListings(amazonRetailerId, {
        accessKey: process.env.AMAZON_ACCESS_KEY,
        secretKey: process.env.AMAZON_SECRET_KEY,
        tag: process.env.AMAZON_TAG,
        region: process.env.AMAZON_REGION || "us-east-1",
      });
      if (amazonListings.length > 0) {
        await upsertListings(amazonListings);
        console.log(`Upserted ${amazonListings.length} Amazon listings.`);
      }
    } catch (err) {
      console.error("Amazon feed error:", err);
    }
  }

  console.log("Refresh complete.");
}

main();
