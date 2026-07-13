/** One token unlocks PDF, PNG, and print for a single layout. */
export const TOKENS_PER_EXPORT = 1;

export interface TokenPackage {
  id: string;
  tokens: number;
  /** Price in INR (paise = priceInr * 100 for Razorpay). */
  priceInr: number;
  label: string;
  popular?: boolean;
}

export const TOKEN_PACKAGES: TokenPackage[] = [
  { id: 'pack_5', tokens: 5, priceInr: 49, label: '5 printouts' },
  { id: 'pack_10', tokens: 10, priceInr: 89, label: '10 printouts', popular: true },
  { id: 'pack_25', tokens: 25, priceInr: 199, label: '25 printouts' },
];

export function getTokenPackage(id: string): TokenPackage | undefined {
  return TOKEN_PACKAGES.find((p) => p.id === id);
}
