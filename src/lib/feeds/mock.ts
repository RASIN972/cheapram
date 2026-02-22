import type { NormalizedRamListing } from "./types";

/**
 * Mock feed for development/demo when affiliate keys are not set.
 * Returns sample RAM listings so the site has data out of the box.
 */
export function getMockListings(retailerId: number): NormalizedRamListing[] {
  return [
    {
      retailerId,
      externalId: "mock-1",
      name: "Corsair Vengeance 32GB (2x16GB) DDR5 5600MHz",
      capacityGb: 32,
      speedMhz: 5600,
      ddrType: "DDR5",
      formFactor: "DIMM",
      productUrl: "https://example.com/ram/1",
      imageUrl: null,
      priceCents: 8999,
      currency: "USD",
    },
    {
      retailerId,
      externalId: "mock-2",
      name: "G.Skill Trident Z5 16GB DDR5 6000MHz",
      capacityGb: 16,
      speedMhz: 6000,
      ddrType: "DDR5",
      formFactor: "DIMM",
      productUrl: "https://example.com/ram/2",
      imageUrl: null,
      priceCents: 6499,
      currency: "USD",
    },
    {
      retailerId,
      externalId: "mock-3",
      name: "Crucial Pro 32GB DDR4 3200MHz",
      capacityGb: 32,
      speedMhz: 3200,
      ddrType: "DDR4",
      formFactor: "DIMM",
      productUrl: "https://example.com/ram/3",
      imageUrl: null,
      priceCents: 5499,
      currency: "USD",
    },
    {
      retailerId,
      externalId: "mock-4",
      name: "Kingston FURY Beast 64GB (2x32GB) DDR5 5200MHz",
      capacityGb: 64,
      speedMhz: 5200,
      ddrType: "DDR5",
      formFactor: "DIMM",
      productUrl: "https://example.com/ram/4",
      imageUrl: null,
      priceCents: 17999,
      currency: "USD",
    },
    {
      retailerId,
      externalId: "mock-5",
      name: "Teamgroup T-Force Vulcan 16GB DDR4 3200 SODIMM",
      capacityGb: 16,
      speedMhz: 3200,
      ddrType: "DDR4",
      formFactor: "SODIMM",
      productUrl: "https://example.com/ram/5",
      imageUrl: null,
      priceCents: 4299,
      currency: "USD",
    },
  ];
}
