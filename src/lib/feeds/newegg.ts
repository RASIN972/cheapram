import type { NormalizedRamListing } from "./types";

const RAM_KEYWORDS = [
  "RAM",
  "MEMORY",
  "DDR4",
  "DDR5",
  "DRAM",
  "SODIMM",
  "DIMM",
  "DESKTOP MEMORY",
  "LAPTOP MEMORY",
];

function isRamRow(title: string, category?: string): boolean {
  const text = `${(title || "").toUpperCase()} ${(category || "").toUpperCase()}`;
  return RAM_KEYWORDS.some((k) => text.includes(k));
}

/**
 * Parse CSV line respecting quoted fields (handles commas inside quotes).
 */
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (!inQuotes && (c === "," || c === "\t")) {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}

/**
 * Infer column index by possible header names (case-insensitive).
 */
function findColumnIndex(
  headers: string[],
  names: string[]
): number {
  const lower = headers.map((h) => h.toLowerCase().replace(/\s/g, ""));
  for (const name of names) {
    const n = name.toLowerCase().replace(/\s/g, "");
    const i = lower.findIndex((h) => h === n || h.includes(n) || n.includes(h));
    if (i >= 0) return i;
  }
  return -1;
}

/**
 * Parse price string to cents (e.g. "$49.99" or "49.99" -> 4999).
 */
function parsePriceToCents(value: string): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[$,\s]/g, "");
  const num = parseFloat(cleaned);
  if (Number.isNaN(num) || num < 0) return null;
  return Math.round(num * 100);
}

export function parseRamFromTitle(title: string): {
  capacityGb: number | null;
  speedMhz: number | null;
  ddrType: string | null;
  formFactor: string | null;
} {
  const t = title.toUpperCase();
  let capacityGb: number | null = null;
  const gbMatch = t.match(/(\d+)\s*GB/);
  if (gbMatch) capacityGb = parseInt(gbMatch[1], 10);

  let speedMhz: number | null = null;
  const mhzMatch = t.match(/(\d+)\s*MHZ/);
  if (mhzMatch) speedMhz = parseInt(mhzMatch[1], 10);

  const ddrType = t.includes("DDR5")
    ? "DDR5"
    : t.includes("DDR4")
      ? "DDR4"
      : null;
  const formFactor = t.includes("SODIMM") ? "SODIMM" : "DIMM";

  return { capacityGb, speedMhz, ddrType, formFactor };
}

/**
 * Newegg affiliate product feed.
 * Fetches CSV (or XML) from feedUrl, parses, filters for RAM, and returns normalized listings.
 * Set NEWEGG_FEED_URL in env to enable. Feed URL from affiliate dashboard usually includes affiliate ID in product URLs.
 */
export async function fetchNeweggListings(
  retailerId: number,
  feedUrl: string
): Promise<NormalizedRamListing[]> {
  const res = await fetch(feedUrl, {
    headers: { Accept: "text/csv, application/xml, text/xml, */*" },
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) return [];

  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  const text = await res.text();

  if (contentType.includes("xml") || text.trimStart().startsWith("<")) {
    return parseNeweggXml(text, retailerId);
  }
  return parseNeweggCsv(text, retailerId);
}

function parseNeweggCsv(
  csv: string,
  retailerId: number
): NormalizedRamListing[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  const titleIdx = findColumnIndex(headers, [
    "title",
    "productname",
    "name",
    "product name",
  ]);
  const urlIdx = findColumnIndex(headers, [
    "url",
    "producturl",
    "link",
    "product url",
  ]);
  const priceIdx = findColumnIndex(headers, [
    "price",
    "currentprice",
    "sale price",
  ]);
  const imageIdx = findColumnIndex(headers, [
    "image",
    "imageurl",
    "image url",
    "thumbnail",
  ]);
  const idIdx = findColumnIndex(headers, ["sku", "id", "productid", "item id"]);
  const categoryIdx = findColumnIndex(headers, [
    "category",
    "producttype",
    "categorypath",
  ]);

  if (titleIdx < 0 || urlIdx < 0 || priceIdx < 0) return [];

  const listings: NormalizedRamListing[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    const title = row[titleIdx] ?? "";
    const url = (row[urlIdx] ?? "").trim();
    const priceRaw = row[priceIdx] ?? "";
    const category = categoryIdx >= 0 ? row[categoryIdx] : undefined;

    if (!url || !title) continue;
    if (!isRamRow(title, category)) continue;

    const priceCents = parsePriceToCents(priceRaw);
    if (priceCents == null) continue;

    const externalId =
      idIdx >= 0 && row[idIdx]
        ? String(row[idIdx]).trim()
        : `newegg-${i}-${url.slice(-20).replace(/\W/g, "")}`;
    const imageUrl =
      imageIdx >= 0 && row[imageIdx] ? (row[imageIdx] as string).trim() : null;

    const { capacityGb, speedMhz, ddrType, formFactor } =
      parseRamFromTitle(title);

    listings.push({
      retailerId,
      externalId,
      name: title.slice(0, 500),
      capacityGb,
      speedMhz,
      ddrType,
      formFactor,
      productUrl: url,
      imageUrl: imageUrl || null,
      priceCents,
      currency: "USD",
    });
  }
  return listings;
}

/**
 * Simple XML parse for feed format with <item> or <product> elements containing title, link, price, etc.
 */
function parseNeweggXml(xml: string, retailerId: number): NormalizedRamListing[] {
  const listings: NormalizedRamListing[] = [];
  const itemRegex =
    /<item[^>]*>([\s\S]*?)<\/item>|<product[^>]*>([\s\S]*?)<\/product>/gi;
  const getTag = (block: string, tag: string): string => {
    const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
    const m = block.match(re);
    return m ? m[1].replace(/<[^>]+>/g, "").trim() : "";
  };

  let m: RegExpExecArray | null;
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = (m[1] ?? m[2]) ?? "";
    const title = getTag(block, "title") || getTag(block, "name");
    const url = getTag(block, "link") || getTag(block, "url");
    const priceRaw = getTag(block, "price") || getTag(block, "currentprice");
    const category = getTag(block, "category");

    if (!url || !title) continue;
    if (!isRamRow(title, category)) continue;

    const priceCents = parsePriceToCents(priceRaw);
    if (priceCents == null) continue;

    const id = getTag(block, "sku") || getTag(block, "id") || getTag(block, "asin");
    const externalId = id
      ? String(id).trim()
      : `newegg-xml-${listings.length}-${url.slice(-15).replace(/\W/g, "")}`;
    const imageUrl = getTag(block, "image") || getTag(block, "imageurl") || null;

    const { capacityGb, speedMhz, ddrType, formFactor } =
      parseRamFromTitle(title);

    listings.push({
      retailerId,
      externalId,
      name: title.slice(0, 500),
      capacityGb,
      speedMhz,
      ddrType,
      formFactor,
      productUrl: url,
      imageUrl: imageUrl || null,
      priceCents,
      currency: "USD",
    });
  }
  return listings;
}
