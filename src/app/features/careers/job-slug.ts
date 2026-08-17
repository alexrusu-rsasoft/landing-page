/** Deterministic, URL-safe slug built from a job's Opportunity title. */
export function slugifyOpportunity(opportunity: string): string {
  const DIACRITIC_RANGE_START = 0x0300;
  const DIACRITIC_RANGE_END = 0x036f;

  const withoutDiacritics = Array.from(opportunity.normalize('NFKD'))
    .filter((char) => {
      const code = char.codePointAt(0) ?? 0;
      return code < DIACRITIC_RANGE_START || code > DIACRITIC_RANGE_END;
    })
    .join('');

  return withoutDiacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
