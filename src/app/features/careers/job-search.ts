import { CareerOpening } from './career-opening';

/**
 * Technologies offered as quick-pick chips above the role list. Only the ones
 * that actually appear in at least one live opening are shown, so the list
 * can stay generous without showing dead filters.
 */
const KNOWN_TECH = [
  'Java', 'Kotlin', 'Spring', 'Python', 'Django', 'JavaScript', 'TypeScript', 'Angular', 'React', 'Vue',
  'Node.js', '.NET', 'C#', 'C++', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Flutter',
  'SAP', 'ABAP', 'Fiori', 'Salesforce', 'ServiceNow',
  'Azure', 'AWS', 'GCP', 'Kubernetes', 'Docker', 'Terraform', 'DevOps', 'Linux', 'Windows Server', 'Intune',
  'Microsoft 365', 'SQL', 'PostgreSQL', 'Oracle', 'MongoDB', 'Kafka', 'Spark', 'Databricks', 'Power BI',
  'Machine Learning', 'AI', 'Cybersecurity', 'Compliance', 'QA', 'Selenium', 'Cypress', 'Scrum', 'Agile',
];

const MAX_SUGGESTIONS = 10;

/** Lowercases and strips diacritics so "Știință" matches "stiinta". */
function normalize(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * A term matches at the start of a word, so "java" finds "Java" and
 * "JavaScript" but "sap" doesn't hit "isapi". Very short terms ("go", "ai",
 * "qa", "c#") must also end at a word boundary, so "go" skips "good".
 */
function termPattern(term: string): RegExp {
  const escaped = escapeRegExp(term);
  const end = term.length <= 2 ? '(?![a-z0-9])' : '';
  return new RegExp(`(^|[^a-z0-9])${escaped}${end}`);
}

function searchableText(opening: CareerOpening): string {
  return normalize([opening.opportunity, opening.level, opening.notes].join(' '));
}

/** Splits the query on commas, falling back to spaces when there are none. */
export function parseSearchTerms(query: string): string[] {
  const normalized = normalize(query).trim();
  if (!normalized) return [];
  const parts = normalized.includes(',') ? normalized.split(',') : normalized.split(/\s+/);
  return parts.map((p) => p.trim()).filter(Boolean);
}

/** Keeps the openings that contain every search term. */
export function filterOpenings(openings: CareerOpening[], query: string): CareerOpening[] {
  const patterns = parseSearchTerms(query).map(termPattern);
  if (patterns.length === 0) return openings;
  return openings.filter((opening) => {
    const text = searchableText(opening);
    return patterns.every((p) => p.test(text));
  });
}

/** The known technologies found in the live openings, most frequent first. */
export function suggestTech(openings: CareerOpening[]): string[] {
  const texts = openings.map(searchableText);
  return KNOWN_TECH.map((tech) => {
    const pattern = termPattern(normalize(tech));
    return { tech, count: texts.filter((t) => pattern.test(t)).length };
  })
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_SUGGESTIONS)
    .map((t) => t.tech);
}
