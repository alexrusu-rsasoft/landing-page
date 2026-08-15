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
 *   6. Copy the generated /exec URL into src/environments/environment.ts
 *      and src/environments/environment.development.ts as leadMagnetApiUrl.
 *
 * Note: the client sends the request with Content-Type: text/plain and mode
 * "no-cors" to avoid a CORS preflight, which Apps Script web apps don't
 * handle. That means the client never reads this response, so failures here
 * are silent client-side, check the sheet directly to confirm captures.
 */
var SPREADSHEET_ID = 'TODO_REPLACE_WITH_SPREADSHEET_ID';
var SHEET_NAME = 'Lead Magnet Requests';

function doPost(e) {
  var sheet = getOrCreateSheet();
  var payload = parseBody(e);

  sheet.appendRow([
    new Date(),
    payload.email || '',
    payload.lang || '',
    payload.source || '',
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
