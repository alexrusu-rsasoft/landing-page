export type JobNotesBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] };

const BULLET_RE = /^[-*•–]\s+/;

function isBullet(line: string): boolean {
  return BULLET_RE.test(line);
}

// Short, punctuation-free standalone lines ("Your Responsibilities") read as
// section headings in free-text job descriptions pasted from the sheet.
function looksLikeHeading(line: string): boolean {
  return !isBullet(line) && !/[.!?]$/.test(line) && line.split(/\s+/).length <= 8;
}

export function parseJobNotes(notes: string, opportunity = ''): JobNotesBlock[] {
  const blocks: JobNotesBlock[] = [];
  const rawBlocks = notes.replace(/\r\n/g, '\n').split(/\n\s*\n/);

  for (const raw of rawBlocks) {
    const lines = raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;

    let bodyLines = lines;
    if (lines.length > 1 && looksLikeHeading(lines[0])) {
      blocks.push({ type: 'heading', text: lines[0] });
      bodyLines = lines.slice(1);
    } else if (lines.length === 1 && looksLikeHeading(lines[0])) {
      if (lines[0].toLowerCase() !== opportunity.trim().toLowerCase()) {
        blocks.push({ type: 'heading', text: lines[0] });
      }
      continue;
    }

    if (bodyLines.every(isBullet)) {
      blocks.push({ type: 'list', items: bodyLines.map((line) => line.replace(BULLET_RE, '')) });
    } else {
      for (const line of bodyLines) {
        blocks.push({ type: 'paragraph', text: line.replace(BULLET_RE, '') });
      }
    }
  }

  return blocks;
}

export function summarizeJobNotes(notes: string): string {
  return notes
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim().replace(BULLET_RE, ''))
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
