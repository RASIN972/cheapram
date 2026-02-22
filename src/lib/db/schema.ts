import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";

export const retailers = sqliteTable("retailers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  domain: text("domain").notNull(),
  affiliateParam: text("affiliate_param"),
  active: integer("active", { mode: "boolean" }).default(true),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  retailerId: integer("retailer_id")
    .notNull()
    .references(() => retailers.id),
  externalId: text("external_id").notNull(),
  name: text("name").notNull(),
  capacityGb: integer("capacity_gb"),
  speedMhz: integer("speed_mhz"),
  ddrType: text("ddr_type"), // 'DDR4' | 'DDR5'
  formFactor: text("form_factor"), // 'DIMM' | 'SODIMM'
  productUrl: text("product_url").notNull(),
  imageUrl: text("image_url"),
  lastSeenAt: integer("last_seen_at", { mode: "timestamp" }),
});

export const prices = sqliteTable("prices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  priceCents: integer("price_cents").notNull(),
  currency: text("currency").default("USD"),
  recordedAt: integer("recorded_at", { mode: "timestamp" }).notNull(),
});

export const coupons = sqliteTable("coupons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  retailerId: integer("retailer_id").references(() => retailers.id),
  productId: integer("product_id").references(() => products.id),
  code: text("code").notNull(),
  description: text("description"),
  expiry: integer("expiry", { mode: "timestamp" }),
  sourceUrl: text("source_url"),
});

export type Retailer = typeof retailers.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Price = typeof prices.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
