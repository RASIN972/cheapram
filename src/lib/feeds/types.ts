export interface NormalizedRamListing {
  retailerId: number;
  externalId: string;
  name: string;
  capacityGb: number | null;
  speedMhz: number | null;
  ddrType: string | null;
  formFactor: string | null;
  productUrl: string;
  imageUrl: string | null;
  priceCents: number;
  currency: string;
}
