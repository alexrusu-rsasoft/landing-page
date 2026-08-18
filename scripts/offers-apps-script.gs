/**
 * Rate offers GET API.
 *
 * Reads the platform's offers sheet (id, special, client, price, currency,
 * type) and returns the rows the frontend needs to compute the public
 * hourly rate. The careers page ([careers.ts]) takes the FIRST offer
 * returned here — the base offer, id 1, special = FALSE, no client — as the
 * platform's flat per-hour cut and subtracts it from every job's Hourly
 * figure before display (e.g. a 25 €/h opening becomes 15 €/h with a
 * 10 €/h base offer).
 *
 * HARD PRIVACY RULE: the "client" column may hold confidential per-client
 * pricing and must never leave this script — only OFFER_FIELDS below are
 * ever read into the response.
 *
 * Deployment:
 *   1. Open your offers spreadsheet and copy its ID from the URL (the
 *      segment between /d/ and /edit).
 *   2. Extensions > Apps Script.
 *   3. Replace the default Code.gs content with this file's content.
 *   4. Set SPREADSHEET_ID below to that spreadsheet's ID (only in the copy
 *      deployed in the Apps Script editor — do not commit the real ID here).
 *   5. Make sure the sheet's first data row (lowest id) is the base offer:
 *      special = FALSE, client blank, price = the platform's per-hour cut.
 *   6. Deploy > New deployment > type "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 *   7. Copy the generated /exec URL into the OFFERS_API_URL env var (see
 *      render.yaml / src/environments/environment.example.ts) — do not
 *      hardcode it in source.
 */
var SPREADSHEET_ID = 'TODO_REPLACE_WITH_SPREADSHEET_ID';

// Column headers (as they appear in the sheet) that are safe to expose
// publicly — "client" is deliberately left out.
var OFFER_FIELDS = ['id', 'special', 'price', 'currency', 'type'];

function doGet() {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
  var values = sheet.getDataRange().getValues();

  var headerRowIndex = findHeaderRow(values);
  if (headerRowIndex === -1) {
    return jsonResponse({ data: [] });
  }

  var headers = values[headerRowIndex];
  var columnIndex = {};
  headers.forEach(function (header, index) {
    columnIndex[String(header).trim().toLowerCase()] = index;
  });

  var results = [];

  for (var r = headerRowIndex + 1; r < values.length; r++) {
    var row = values[r];
    var idIndex = columnIndex['id'];
    if (idIndex === undefined || row[idIndex] === '' || row[idIndex] === null) continue;

    var item = {};
    OFFER_FIELDS.forEach(function (key) {
      var idx = columnIndex[key];
      item[key] = idx !== undefined ? row[idx] : '';
    });

    results.push(item);
  }

  return jsonResponse({ data: results });
}

function findHeaderRow(values) {
  for (var i = 0; i < values.length; i++) {
    if (values[i].indexOf('id') !== -1) return i;
  }
  return -1;
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
