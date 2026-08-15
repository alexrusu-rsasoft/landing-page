/**
 * Developer profiles GET API.
 *
 * Reads the developer pool sheet and returns only anonymized, non-identifying
 * fields for the 2-3 sample profiles shown on the public site (to make the
 * "you'll get a matching developer in 24-48h" promise tangible).
 *
 * HARD PRIVACY RULE: contact details, rates and documents must never leave
 * this script. The response never includes: Lead Name, Lead Email, Lead
 * phone number, any Expected/Negotiated Rate (Hourly/Daily/Monthly), Upload
 * Latest Resume/CV, Notice Period end date, Date of Last Contact, Lead
 * Status in Recruitment Pipeline, GDPR Confirmed/Extras, or Additional
 * Notes/Internal Comments. Only PUBLIC_FIELDS below are ever read into the
 * response — new columns added to the sheet are excluded by default.
 *
 * Every row with a Target Role/Position filled in is eligible (no separate
 * "approved for sharing" gate) — the anonymization itself (only the fields
 * in PUBLIC_FIELDS, never name/contact/rate/CV) is what makes this safe to
 * expose, not a manual per-row flag.
 *
 * Deployment:
 *   1. Open the spreadsheet: https://docs.google.com/spreadsheets/d/1qCkbmt0tNrU_j77RyM8oDqo_KMQ3jpxWjcVS4viwURA/edit
 *   2. Extensions > Apps Script.
 *   3. Replace the default Code.gs content with this file's content.
 *   4. Deploy > New deployment > type "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 *   5. Copy the generated /exec URL into src/environments/environment.ts
 *      and src/environments/environment.development.ts as developerProfilesApiUrl.
 *
 * Note: "Generated Profile" is sent to the browser as-is, so make sure that
 * text is written anonymized from the start (no name, no company names, no
 * exact rate) for every row — there's no per-row approval flag filtering it.
 */
var SPREADSHEET_ID = '1qCkbmt0tNrU_j77RyM8oDqo_KMQ3jpxWjcVS4viwURA';

// Column headers (as they appear in the sheet) that are safe to expose publicly.
var PUBLIC_FIELDS = {
  role: 'Target Role/Position',
  stack: 'Main Technology Stack/Expertise',
  yearsExperience: 'Years of Relevant Professional Experience',
  languages: 'Languages Spoken (e.g., English - Native, French - B2)',
  collaborationType: 'Preferred Collaboration Type',
  availability: 'Current Availability Status',
  generatedProfile: 'Generated Profile',
};

var MAX_RESULTS = 9;

function doGet() {
  var found = findDataSheet(SpreadsheetApp.openById(SPREADSHEET_ID));
  if (!found) {
    return jsonResponse({ data: [] });
  }
  var values = found.values;
  var headerRowIndex = found.headerRowIndex;

  var headers = values[headerRowIndex];
  var columnIndex = {};
  headers.forEach(function (header, index) {
    columnIndex[String(header).trim()] = index;
  });

  var results = [];

  for (var r = headerRowIndex + 1; r < values.length; r++) {
    var row = values[r];

    var role = readCell(row, columnIndex, PUBLIC_FIELDS.role);
    if (!role) continue; // skip blank rows

    var item = {};
    Object.keys(PUBLIC_FIELDS).forEach(function (key) {
      item[key] = readCell(row, columnIndex, PUBLIC_FIELDS[key]);
    });

    results.push(item);
  }

  shuffle(results);

  return jsonResponse({ data: results.slice(0, MAX_RESULTS) });
}

// Scans every tab in the spreadsheet (not just the first) for the one whose
// header row contains "Lead Name" — avoids silently reading the wrong tab
// if the dev pool isn't on tab 0.
function findDataSheet(spreadsheet) {
  var sheets = spreadsheet.getSheets();
  for (var s = 0; s < sheets.length; s++) {
    var values = sheets[s].getDataRange().getValues();
    var headerRowIndex = findHeaderRow(values);
    if (headerRowIndex !== -1) {
      return { values: values, headerRowIndex: headerRowIndex };
    }
  }
  return null;
}

function findHeaderRow(values) {
  for (var i = 0; i < values.length; i++) {
    for (var c = 0; c < values[i].length; c++) {
      if (String(values[i][c]).indexOf('Lead Name') !== -1) return i;
    }
  }
  return -1;
}

function shuffle(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
}

function readCell(row, columnIndex, headerName) {
  var idx = columnIndex[headerName];
  if (idx === undefined) return '';
  var value = row[idx];

  if (value === null || value === undefined) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  return String(value)
    .replace(/[\r\n]+/g, ' ')
    .trim();
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
