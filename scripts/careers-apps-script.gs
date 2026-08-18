/**
 * Careers page GET API.
 *
 * Reads the RSA SOFT opportunities sheet and returns only the fields the
 * public careers page is allowed to show. Client/recruiter details (true
 * customer, relationship owner, margins, "My notes", etc.) never leave this
 * script, and the Stage column itself is never included in the response.
 * Rows whose Stage is blank, "Dead" or "Closed" are dropped entirely.
 *
 * The Hourly figure returned here is the raw sheet value — the frontend
 * subtracts the platform's cut itself, using the first row of the Offers
 * sheet (see scripts/offers-apps-script.gs).
 *
 * Deployment:
 *   1. Open your opportunities spreadsheet and copy its ID from the URL
 *      (the segment between /d/ and /edit).
 *   2. Extensions > Apps Script.
 *   3. Replace the default Code.gs content with this file's content.
 *   4. Set SPREADSHEET_ID below to that spreadsheet's ID (only in the copy
 *      deployed in the Apps Script editor — do not commit the real ID here).
 *   5. Deploy > New deployment > type "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 *   6. Copy the generated /exec URL into the CAREERS_API_URL env var (see
 *      render.yaml / src/environments/environment.example.ts) — do not
 *      hardcode it in source.
 */
var SPREADSHEET_ID = 'TODO_REPLACE_WITH_SPREADSHEET_ID';

// Column headers (as they appear in the sheet) that are safe to expose publicly.
var PUBLIC_FIELDS = {
  opportunity: 'Opportunity',
  level: 'Level',
  minYearsExperience: 'Min years of experience',
  urgency: 'Urgency',
  fillUntil: 'Fill until',
  hourly: 'Hourly',
  notes: 'Notes',
};

var EXCLUDED_STAGES = ['dead', 'closed'];

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
    columnIndex[String(header).trim()] = index;
  });

  var results = [];

  for (var r = headerRowIndex + 1; r < values.length; r++) {
    var row = values[r];

    var opportunity = readCell(row, columnIndex, PUBLIC_FIELDS.opportunity);
    if (!opportunity) continue; // skip blank rows

    var stage = readCell(row, columnIndex, 'Stage');

    // EXCLUDEM dacă Stage este GOL sau dacă este 'dead' / 'closed'
    if (!stage || EXCLUDED_STAGES.indexOf(stage.toLowerCase()) !== -1) {
      continue;
    }

    var item = {};
    Object.keys(PUBLIC_FIELDS).forEach(function (key) {
      item[key] = readCell(row, columnIndex, PUBLIC_FIELDS[key]);
    });

    results.push(item);
  }

  return jsonResponse({ data: results });
}

function findHeaderRow(values) {
  for (var i = 0; i < values.length; i++) {
    if (values[i].indexOf('Opportunity') !== -1) return i;
  }
  return -1;
}

function readCell(row, columnIndex, headerName) {
  var idx = columnIndex[headerName];
  if (idx === undefined) return '';
  var value = row[idx];

  if (value === null || value === undefined) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  var text = String(value);

  // The Notes column is a free-text job description (headings, paragraphs,
  // bullet lists) — its line breaks are kept so the frontend can render it
  // properly. Every other field is expected to be single-line, so stray
  // newlines there are still collapsed to a space.
  if (headerName === PUBLIC_FIELDS.notes) {
    return text.replace(/\r\n/g, '\n').trim();
  }

  return text.replace(/[\r\n]+/g, ' ').trim();
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
