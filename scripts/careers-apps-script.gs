/**
 * Careers page GET API.
 *
 * Reads the RSA SOFT opportunities sheet and returns only the fields the
 * public careers page is allowed to show. Client/recruiter details (true
 * customer, relationship owner, margins, "My notes", etc.) never leave this
 * script. Rows whose Stage is "Dead" or "Closed" are dropped entirely.
 *
 * Deployment:
 *   1. Open the spreadsheet: https://docs.google.com/spreadsheets/d/1BH0vui0--Mt8CX5at5gK1QJLcEIyRE4ubFR3vc0v0PY/edit
 *   2. Extensions > Apps Script.
 *   3. Replace the default Code.gs content with this file's content.
 *   4. Deploy > New deployment > type "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 *   5. Copy the generated /exec URL into src/environments/environment.ts
 *      and src/environments/environment.development.ts as careersApiUrl.
 */
var SPREADSHEET_ID = '1BH0vui0--Mt8CX5at5gK1QJLcEIyRE4ubFR3vc0v0PY';

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

  // Înlocuim rândurile noi cu spațiu și eliminăm spațiile goale de la capete
  return String(value)
    .replace(/[\r\n]+/g, ' ')
    .trim();
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
