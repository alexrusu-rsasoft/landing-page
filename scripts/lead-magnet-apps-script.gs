/**
 * Quick Staffing Protocol lead magnet capture API.
 *
 * Appends one row per PDF request (timestamp, email, language, source) to a
 * spreadsheet so downloaded-but-not-yet-called leads can be followed up on.
 * The endpoint never returns lead data back to the browser, it only accepts
 * a POST and appends it.
 *
 * Deployment:
 *   1. Create a spreadsheet (or reuse one) and copy its ID from the URL.
 *   2. Extensions > Apps Script.
 *   3. Replace the default Code.gs content with this file's content.
 *   4. Set SPREADSHEET_ID below to that spreadsheet's ID.
 *   5. Deploy > New deployment > type "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 *   6. Copy the generated /exec URL into the LEAD_MAGNET_API_URL env var
 *      (see render.yaml / src/environments/environment.example.ts) — do
 *      not hardcode it in source.
 *
 * Note: the client sends the request with Content-Type: text/plain and mode
 * "no-cors" to avoid a CORS preflight, which Apps Script web apps don't
 * handle. That means the client never reads this response, so failures here
 * are silent client-side, check the sheet directly to confirm captures.
 *
 * Security: this URL is public (anyone can POST to it directly, bypassing
 * the site's client-side email regex and honeypot), so every field is
 * treated as untrusted here too. Invalid payloads are dropped silently
 * (still HTTP 200, since the client never reads the response) rather than
 * appended, and every string value is sanitized against spreadsheet
 * formula injection before being written.
 */
var SPREADSHEET_ID = 'TODO_REPLACE_WITH_SPREADSHEET_ID';
var SHEET_NAME = 'Lead Magnet Requests';
var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var MAX_FIELD_LENGTH = 200;

function doPost(e) {
  var payload = parseBody(e);
  var email = String(payload.email || '').trim();

  if (!EMAIL_PATTERN.test(email) || email.length > MAX_FIELD_LENGTH) {
    return jsonResponse({ ok: false, error: 'invalid_email' });
  }

  var sheet = getOrCreateSheet();
  sheet.appendRow([
    new Date(),
    sanitizeCell(email),
    sanitizeCell(String(payload.lang || '').slice(0, MAX_FIELD_LENGTH)),
    sanitizeCell(String(payload.source || '').slice(0, MAX_FIELD_LENGTH)),
  ]);

  return jsonResponse({ ok: true });
}

function parseBody(e) {
  try {
    return JSON.parse(e.postData.contents);
  } catch (err) {
    return {};
  }
}

// Google Sheets evaluates any cell value starting with =, +, -, @, tab or CR
// as a formula, even when the value is written via the Apps Script API, not
// just when typed/pasted in the UI. A malicious lead ("email") could smuggle
// a formula (e.g. IMPORTXML/HYPERLINK) that runs when staff opens the sheet.
// Prefixing with a leading apostrophe forces Sheets to treat it as literal
// text.
function sanitizeCell(value) {
  if (/^[=+\-@\t\r]/.test(value)) {
    return "'" + value;
  }
  return value;
}

function getOrCreateSheet() {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Email', 'Language', 'Source']);
  }
  return sheet;
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
