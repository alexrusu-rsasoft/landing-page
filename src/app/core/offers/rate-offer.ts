export interface RateOffer {
  id: number;
  special: boolean;
  price: number;
  currency: string;
  type: string;
}

// Sheet rates are usually numeric ("25") but the field is free text, so any
// non-numeric or missing value passes through unchanged instead of being dropped.
export function applyPlatformCut(hourlyText: string, cut: number): string {
  if (!hourlyText || !cut) return hourlyText;

  const value = parseFloat(hourlyText.replace(',', '.'));
  if (Number.isNaN(value)) return hourlyText;

  const net = Math.max(value - cut, 0);
  return String(Math.round(net * 100) / 100);
}
