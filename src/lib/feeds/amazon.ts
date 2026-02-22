import type { NormalizedRamListing } from "./types";
import { parseRamFromTitle } from "./newegg";

export interface AmazonPaApiConfig {
  accessKey: string;
  secretKey: string;
  tag: string;
  region?: string;
}

/**
 * Parse Amazon price display amount (e.g. "$49.99") to cents.
 */
function parsePriceToCents(displayAmount: string | undefined): number | null {
  if (!displayAmount) return null;
  const cleaned = displayAmount.replace(/[$,\s]/g, "");
  const num = parseFloat(cleaned);
  if (Number.isNaN(num) || num < 0) return null;
  return Math.round(num * 100);
}

function isRamTitle(title: string): boolean {
  const t = title.toUpperCase();
  return (
    t.includes("RAM") ||
    t.includes("MEMORY") ||
    t.includes("DDR4") ||
    t.includes("DDR5") ||
    t.includes("DRAM") ||
    t.includes("SODIMM") ||
    t.includes("DESKTOP MEMORY") ||
    t.includes("LAPTOP MEMORY")
  );
}

/**
 * Fetch RAM listings from Amazon Product Advertising API 5.0 (SearchItems).
 * Requires AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_TAG. Builds affiliate URL with tag.
 */
export async function fetchAmazonListings(
  retailerId: number,
  config: AmazonPaApiConfig
): Promise<NormalizedRamListing[]> {
  const region = config.region || "us-east-1";
  const { createRequire } = await import("module");
  const require = createRequire(import.meta.url);
  const ProductAdvertisingAPIv1 = require("paapi5-nodejs-sdk");
  const ApiClient = ProductAdvertisingAPIv1.ApiClient;
  const DefaultApi = ProductAdvertisingAPIv1.DefaultApi;
  const SearchItemsRequest = ProductAdvertisingAPIv1.SearchItemsRequest;

  const client = ApiClient.instance;
  client.accessKey = config.accessKey;
  client.secretKey = config.secretKey;
  client.host = "webservices.amazon.com";
  client.region = region;

  const api = new DefaultApi();
  const allListings: NormalizedRamListing[] = [];
  const keywordsList = ["DDR5 RAM", "DDR4 RAM", "computer memory 32GB"];

  for (const keywords of keywordsList) {
    const req = new SearchItemsRequest();
    req["PartnerTag"] = config.tag;
    req["PartnerType"] = "Associates";
    req["Keywords"] = keywords;
    req["SearchIndex"] = "Computers";
    req["ItemCount"] = 10;
    req["Resources"] = [
      "Images.Primary.Medium",
      "ItemInfo.Title",
      "Offers.Listings.Price",
    ];

    const result = await new Promise<unknown>((resolve, reject) => {
      api.searchItems(req, (error: unknown, data: unknown) => {
        if (error) reject(error);
        else resolve(data);
      });
    });

    const response = result as {
      SearchResult?: { Items?: Array<Record<string, unknown>> };
    };
    const items = response?.SearchResult?.Items ?? [];
    for (const item of items) {
      const asin = item.ASIN as string | undefined;
      const titleObj = item.ItemInfo as { Title?: { DisplayValue?: string } } | undefined;
      const title = titleObj?.Title?.DisplayValue ?? "";
      if (!asin || !title || !isRamTitle(title)) continue;

      const offers = item.Offers as { Listings?: Array<{ Price?: { DisplayAmount?: string } }> } | undefined;
      const priceDisplay = offers?.Listings?.[0]?.Price?.DisplayAmount;
      const priceCents = parsePriceToCents(priceDisplay);
      if (priceCents == null) continue;

      const detailUrl = (item.DetailPageURL as string) || "";
      const productUrl = detailUrl.includes("tag=")
        ? detailUrl
        : `https://www.amazon.com/dp/${asin}?tag=${config.tag}`;

      const images = item.Images as { Primary?: { Medium?: { URL?: string } } } | undefined;
      const imageUrl = images?.Primary?.Medium?.URL ?? null;

      const { capacityGb, speedMhz, ddrType, formFactor } = parseRamFromTitle(title);

      allListings.push({
        retailerId,
        externalId: asin,
        name: title.slice(0, 500),
        capacityGb,
        speedMhz,
        ddrType,
        formFactor,
        productUrl,
        imageUrl,
        priceCents,
        currency: "USD",
      });
    }
  }

  // Dedupe by ASIN (externalId)
  const byAsin = new Map<string, NormalizedRamListing>();
  for (const row of allListings) {
    if (!byAsin.has(row.externalId)) byAsin.set(row.externalId, row);
  }
  return Array.from(byAsin.values());
}
