/**
 * BLASC UFS - UFS/NPA ITSOAP Programme Google Form + code verification script.
 */

var WEEK_CAPACITY = 15;
var WEEK_CONFIG = [
  { id: 'w1', label: 'Week 1 (Mon 11 May to Fri 15 May 2026)', closed: false },
  { id: 'w2', label: 'Week 2 (Mon 18 May to Fri 22 May 2026)', closed: false },
  { id: 'w3', label: 'Week 3 (Mon 25 May to Fri 29 May 2026)', closed: false },
  { id: 'w4', label: 'Week 4 (Mon 29 June to Fri 3 July 2026)', closed: false },
  { id: 'w5', label: 'Week 5 (Mon 6 July to Fri 10 July 2026)', closed: false },
  { id: 'w6', label: 'Week 6 (Mon 13 July to Fri 17 July 2026)', closed: false },
  { id: 'w7', label: 'Week 7 (Mon 20 July to Fri 24 July 2026)', closed: false },
  { id: 'w8', label: 'Week 8 (Mon 27 July to Fri 31 July 2026)', closed: false },
  { id: 'w9', label: 'Week 9 (Mon 3 August to Fri 7 August 2026)', closed: false },
  { id: 'w10', label: 'Week 10 (Mon 17 August to Fri 21 August 2026)', closed: false },
  { id: 'w11', label: 'Week 11 (Mon 24 August to Fri 28 August 2026)', closed: false },
  { id: 'w12', label: 'Week 12 (Mon 31 August to Fri 4 September 2026)', closed: false },
  { id: 'w13', label: 'Week 13 (Mon 7 September to Fri 11 September 2026)', closed: false },
  { id: 'w14', label: 'Week 14 (Mon 14 September to Fri 18 September 2026)', closed: false },
  { id: 'w15', label: 'Week 15 (Mon 21 September to Fri 25 September 2026)', closed: false },
  { id: 'w16', label: 'Week 16 (Mon 28 September to Fri 2 October 2026)', closed: false },
  { id: 'w17', label: 'Week 17 (Mon 5 October to Fri 9 October 2026)', closed: false },
  { id: 'w18', label: 'Week 18 (Mon 12 October to Fri 16 October 2026)', closed: false },
  { id: 'w19', label: 'Week 19 (Mon 19 October to Fri 23 October 2026)', closed: false }
];
var RESERVED_STATUSES = {
  pending_google_form: true,
  pending: true,
  confirmed: true
};

function createUfsNpaPrivateApplicationForm() {
  try {
    var form = FormApp.create('UFS/NPA ITSOAP Programme - Private Application Form');

    form.setDescription(
      'Please complete this form only after finishing the BLASC pre-application process.\n\n' +
      'This form collects private personal information separately from the BLASC website.\n\n' +
      'You must enter the same Reference Code generated during the pre-application process so your form response can be matched to your selected programme slot.\n\n' +
      'Submitting this form does not automatically guarantee placement in the programme.'
    );

    form.setConfirmationMessage(
      'Thank you. Your private application details have been submitted.\n\n' +
      'Please make sure that the Reference Code you entered matches the code generated during the BLASC pre-application process.\n\n' +
      'Submission of this form does not automatically guarantee placement in the programme.'
    );

    form.addPageBreakItem().setTitle('Matching Details');

    var refCodeValidation = FormApp.createTextValidation()
      .requireTextMatchesPattern('^BLASC-NPA-2026-[A-Z0-9]{6}$')
      .setHelpText('Enter the reference code generated on the BLASC website (for example: BLASC-NPA-2026-7F3K2Q).')
      .build();

    var refCodeItem = form.addTextItem()
      .setTitle('Reference Code')
      .setRequired(true)
      .setValidation(refCodeValidation);

    form.addTextItem().setTitle('Initials').setRequired(true);

    form.addPageBreakItem().setTitle('Student Details');
    form.addTextItem().setTitle('Full Name').setRequired(true);
    form.addTextItem().setTitle('Surname').setRequired(true);
    form.addTextItem().setTitle('Student Number').setRequired(true);
    form.addTextItem().setTitle('Identity Number / Passport Number').setRequired(true);
    form.addTextItem().setTitle('Degree Programme').setRequired(true);

    form.addMultipleChoiceItem()
      .setTitle('Year of Study')
      .setRequired(true)
      .setChoiceValues(['Final Year']);

    var emailValidation = FormApp.createTextValidation()
      .requireTextIsEmail()
      .setHelpText('Enter a valid email address.')
      .build();

    form.addTextItem().setTitle('Email Address').setRequired(true).setValidation(emailValidation);
    form.addTextItem().setTitle('Contact Number').setRequired(true);

    form.addPageBreakItem().setTitle('Declaration and Confirmation');
    form.addSectionHeaderItem().setTitle(
      'I confirm that I have read and understood the Student Declaration and Undertaking for the UFS/NPA ITSOAP Programme. ' +
      'I understand that participation is voluntary and subject to strict standards of confidentiality, professionalism, supervision, ethical conduct, and compliance with programme rules. ' +
      'I agree to conduct myself in a manner consistent with the dignity of the legal profession, the University of the Free State, BLASC UFS, and the National Prosecuting Authority.'
    );

    var declarationItem = form.addMultipleChoiceItem().setTitle('Declaration acknowledgement').setRequired(true);
    declarationItem.setChoices([
      declarationItem.createChoice('I agree', FormApp.PageNavigationType.CONTINUE),
      declarationItem.createChoice('I do not agree', FormApp.PageNavigationType.SUBMIT)
    ]);

    form.addCheckboxItem()
      .setTitle('Final confirmation')
      .setRequired(true)
      .setChoiceValues(['I confirm that the information I have provided is true and correct.']);

    var responseSheet = SpreadsheetApp.create('UFS-NPA-ITSOAP-Private-Application-Responses');
    form.setDestination(FormApp.DestinationType.SPREADSHEET, responseSheet.getId());

    Logger.log('Edit Form URL: ' + form.getEditUrl());
    Logger.log('Live Form URL: ' + form.getPublishedUrl());
    Logger.log('Response Sheet URL: ' + responseSheet.getUrl());
    logPrefilledReferenceCodeTemplate_(form, refCodeItem);
  } catch (err) {
    Logger.log('Error creating UFS/NPA ITSOAP form: ' + err);
    throw err;
  }
}

function logPrefilledReferenceCodeTemplate_(form, refCodeItem) {
  try {
    var itemResponse = refCodeItem.asTextItem().createResponse('BLASC-NPA-2026-PLACEHOLDER');
    var formResponse = form.createResponse();
    formResponse.withItemResponse(itemResponse);
    Logger.log('Prefilled URL template (Reference Code): ' + formResponse.toPrefilledUrl());
  } catch (err) {
    Logger.log('Could not generate prefilled URL template: ' + err);
  }
}

/**
 * Web app endpoint.
 * POST request body JSON, or GET query parameters:
 * {"action":"createPreApplication","referenceCode":"BLASC-NPA-2026-7F3K2Q","yearOfStudy":"final","selectedWeekId":"w6","selectedWeekLabel":"Week 6 (15-19 June 2026)"}
 * {"action":"getWeekStatus"}
 */
function doPost(e) {
  try {
    var payload = parseJsonBody_(e);
    var action = payload && payload.action ? String(payload.action) : '';
    if (!action) return jsonResponse_({ ok: false, error: 'Invalid action.' });

    if (action === 'createPreApplication') {
      return createPreApplication_(payload);
    }
    if (action === 'getWeekStatus') {
      return getWeekStatusResponse_();
    }
    return jsonResponse_({ ok: false, error: 'Unsupported action.' });
  } catch (err) {
    return jsonResponse_({ ok: false, error: 'Server error: ' + err.message });
  }
}

function doGet(e) {
  try {
    var action = e && e.parameter && e.parameter.action ? String(e.parameter.action) : '';
    if (action === 'createPreApplication') {
      return createPreApplication_(payloadFromRequestParameters_(e.parameter || {}));
    }
    if (action === 'getWeekStatus') {
      return getWeekStatusResponse_();
    }
    return jsonResponse_({ ok: true, message: 'BLASC NPA API is live.' });
  } catch (err) {
    return jsonResponse_({ ok: false, error: 'Server error: ' + err.message });
  }
}

function createPreApplication_(payload) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (err) {
    return jsonResponse_({ ok: false, error: 'The application system is busy. Please try again.' });
  }

  try {
    var referenceCode = normalizeReferenceCodeForStorage_(payload.referenceCode);
    var yearOfStudy = String(payload.yearOfStudy || '').trim().toLowerCase();
    var selectedWeekId = String(payload.selectedWeekId || '').trim().toLowerCase();
    var selectedWeekLabel = String(payload.selectedWeekLabel || '').trim();

    if (!isValidReferenceCode_(referenceCode)) return jsonResponse_({ ok: false, error: 'Invalid reference code format.' });
    if (!selectedWeekId) return jsonResponse_({ ok: false, error: 'Selected week is required.' });
    if (!selectedWeekLabel) return jsonResponse_({ ok: false, error: 'Selected week label is required.' });

    var sheet = getValidCodeSheet_();
    ensureValidCodeHeaders_(sheet);
    var rows = sheet.getDataRange().getValues();
    var index = buildHeaderIndex_(rows[0] || []);
    var referenceCodeIdx = (index['reference code'] || 1) - 1;

    if (isWeekManuallyClosed_(selectedWeekId)) {
      return jsonResponse_({ ok: false, error: 'This programme week is closed.', weekStatus: buildWeekStatusMap_(sheet) });
    }

    if (countReservedForWeek_(rows, index, selectedWeekId, 0) >= WEEK_CAPACITY) {
      return jsonResponse_({ ok: false, error: 'This programme week is full.', weekStatus: buildWeekStatusMap_(sheet) });
    }

    for (var i = 1; i < rows.length; i++) {
      if (normalizeReferenceCodeForCompare_(rows[i][referenceCodeIdx]) === normalizeReferenceCodeForCompare_(referenceCode)) {
        return jsonResponse_({ ok: false, error: 'Duplicate reference code.' });
      }
    }

    sheet.appendRow([
      referenceCode,
      yearOfStudy,
      '',
      '',
      selectedWeekId,
      selectedWeekLabel,
      new Date(),
      'pending_google_form',
      '',
      '',
      '',
      ''
    ]);
    SpreadsheetApp.flush();

    return jsonResponse_({
      ok: true,
      referenceCode: referenceCode,
      status: 'pending_google_form',
      weekStatus: buildWeekStatusMap_(sheet)
    });
  } finally {
    lock.releaseLock();
  }
}

function getWeekStatusResponse_() {
  var sheet = getValidCodeSheet_();
  ensureValidCodeHeaders_(sheet);
  return jsonResponse_({
    ok: true,
    weekStatus: buildWeekStatusMap_(sheet)
  });
}

/**
 * Installable trigger: On form submit (bound to the spreadsheet).
 * Verifies responses["Reference Code"] against ValidCode.
 */
function onFormSubmit(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var validSheet = ss.getSheetByName('ValidCode');
  var responsesSheet = e && e.range ? e.range.getSheet() : null;
  if (!validSheet || !responsesSheet || !e || !e.range) return;

  ensureValidCodeHeaders_(validSheet);

  var row = e.range.getRow();
  if (row < 2) return;

  var responseHeaders = responsesSheet.getRange(1, 1, 1, responsesSheet.getLastColumn()).getValues()[0];
  var responseIndex = buildHeaderIndex_(responseHeaders);
  var codeCol = responseIndex['reference code'];
  if (!codeCol) return;

  var codeCheckCol = ensureResponseColumn_(responsesSheet, responseHeaders, 'Code Check');
  var matchedDateCol = ensureResponseColumn_(responsesSheet, responseHeaders, 'Matched Date');
  var adminNotesCol = ensureResponseColumn_(responsesSheet, responseHeaders, 'Admin Notes');
  var matchedStatusCol = ensureResponseColumn_(responsesSheet, responseHeaders, 'Matched Status');
  var confirmedAtCol = ensureResponseColumn_(responsesSheet, responseHeaders, 'Confirmed At');

  var submittedCode = normalizeReferenceCodeForStorage_(responsesSheet.getRange(row, codeCol).getValue());
  if (!isValidReferenceCode_(submittedCode)) {
    responsesSheet.getRange(row, codeCheckCol).setValue('Invalid Code');
    responsesSheet.getRange(row, matchedDateCol).setValue('');
    responsesSheet.getRange(row, adminNotesCol).setValue('Missing or invalid Reference Code format.');
    responsesSheet.getRange(row, matchedStatusCol).setValue('');
    responsesSheet.getRange(row, confirmedAtCol).setValue('');
    return;
  }

  var validRows = validSheet.getDataRange().getValues();
  var validIndex = buildHeaderIndex_(validRows[0] || []);
  var codeIdx = (validIndex['reference code'] || 1) - 1;
  var selectedWeekIdIdx = (validIndex['selected week id'] || 5) - 1;
  var selectedWeekLabelIdx = (validIndex['selected week label'] || 6) - 1;
  var statusIdx = (validIndex['status'] || 8) - 1;
  var formSubmittedAtIdx = (validIndex['google_form_submitted_at'] || 9) - 1;
  var confirmedAtIdx = (validIndex['confirmed_at'] || 10) - 1;
  var waitlistReasonIdx = (validIndex['waitlist_reason'] || 11) - 1;
  var adminNotesIdx = (validIndex['admin_notes'] || 12) - 1;

  var matches = [];
  for (var i = 1; i < validRows.length; i++) {
    if (normalizeReferenceCodeForCompare_(validRows[i][codeIdx]) === normalizeReferenceCodeForCompare_(submittedCode)) matches.push(i + 1);
  }

  if (matches.length !== 1) {
    responsesSheet.getRange(row, codeCheckCol).setValue('Invalid Code');
    responsesSheet.getRange(row, matchedDateCol).setValue('');
    responsesSheet.getRange(row, adminNotesCol).setValue(matches.length === 0 ? 'Reference Code not found in ValidCode.' : 'Duplicate records found in ValidCode.');
    responsesSheet.getRange(row, matchedStatusCol).setValue('');
    responsesSheet.getRange(row, confirmedAtCol).setValue('');
    return;
  }

  var matchRow = matches[0];
  var statusValue = String(validSheet.getRange(matchRow, statusIdx + 1).getValue() || '').trim().toLowerCase();
  var selectedWeekId = String(validSheet.getRange(matchRow, selectedWeekIdIdx + 1).getValue() || '').trim().toLowerCase();
  var selectedWeekLabel = String(validSheet.getRange(matchRow, selectedWeekLabelIdx + 1).getValue() || '').trim();
  if (statusValue === 'confirmed') {
    responsesSheet.getRange(row, codeCheckCol).setValue('Duplicate Code');
    responsesSheet.getRange(row, matchedDateCol).setValue(selectedWeekLabel);
    responsesSheet.getRange(row, adminNotesCol).setValue('Reference Code already confirmed.');
    responsesSheet.getRange(row, matchedStatusCol).setValue('confirmed');
    responsesSheet.getRange(row, confirmedAtCol).setValue(validSheet.getRange(matchRow, confirmedAtIdx + 1).getValue());
    return;
  }
  if (statusValue !== 'pending_google_form' && statusValue !== 'pending') {
    responsesSheet.getRange(row, codeCheckCol).setValue('Invalid Code');
    responsesSheet.getRange(row, matchedDateCol).setValue(selectedWeekLabel);
    responsesSheet.getRange(row, adminNotesCol).setValue('Reference Code status is not pending_google_form (' + statusValue + ').');
    responsesSheet.getRange(row, matchedStatusCol).setValue(statusValue);
    responsesSheet.getRange(row, confirmedAtCol).setValue('');
    return;
  }

  if (!selectedWeekId) {
    responsesSheet.getRange(row, codeCheckCol).setValue('Invalid Code');
    responsesSheet.getRange(row, matchedDateCol).setValue(selectedWeekLabel);
    responsesSheet.getRange(row, adminNotesCol).setValue('Matched record has no selected week id.');
    responsesSheet.getRange(row, matchedStatusCol).setValue(statusValue);
    responsesSheet.getRange(row, confirmedAtCol).setValue('');
    return;
  }

  var weekConfirmedCount = countConfirmedForWeek_(validRows, validIndex, selectedWeekId, matchRow);
  var now = new Date();
  validSheet.getRange(matchRow, formSubmittedAtIdx + 1).setValue(now);

  if (isWeekManuallyClosed_(selectedWeekId)) {
    validSheet.getRange(matchRow, statusIdx + 1).setValue('needs_reassignment');
    validSheet.getRange(matchRow, waitlistReasonIdx + 1).setValue('Week closed before form submission.');
    validSheet.getRange(matchRow, adminNotesIdx + 1).setValue('Set by trigger: selected week is closed.');

    responsesSheet.getRange(row, codeCheckCol).setValue('Waitlist');
    responsesSheet.getRange(row, matchedDateCol).setValue(selectedWeekLabel);
    responsesSheet.getRange(row, adminNotesCol).setValue('Selected week is closed. Record marked needs_reassignment for admin review.');
    responsesSheet.getRange(row, matchedStatusCol).setValue('needs_reassignment');
    responsesSheet.getRange(row, confirmedAtCol).setValue('');
    return;
  }

  if (weekConfirmedCount >= WEEK_CAPACITY) {
    validSheet.getRange(matchRow, statusIdx + 1).setValue('needs_reassignment');
    validSheet.getRange(matchRow, waitlistReasonIdx + 1).setValue('Week full at form submission time.');
    validSheet.getRange(matchRow, adminNotesIdx + 1).setValue('Set by trigger: capacity reached before confirmation.');

    responsesSheet.getRange(row, codeCheckCol).setValue('Waitlist');
    responsesSheet.getRange(row, matchedDateCol).setValue(selectedWeekLabel);
    responsesSheet.getRange(row, adminNotesCol).setValue('Selected week is full. Record marked needs_reassignment for admin review.');
    responsesSheet.getRange(row, matchedStatusCol).setValue('needs_reassignment');
    responsesSheet.getRange(row, confirmedAtCol).setValue('');
    return;
  }

  validSheet.getRange(matchRow, statusIdx + 1).setValue('confirmed');
  validSheet.getRange(matchRow, confirmedAtIdx + 1).setValue(now);
  validSheet.getRange(matchRow, waitlistReasonIdx + 1).setValue('');
  validSheet.getRange(matchRow, adminNotesIdx + 1).setValue('Confirmed by form submission match.');

  responsesSheet.getRange(row, codeCheckCol).setValue('confirmed');
  responsesSheet.getRange(row, matchedDateCol).setValue(selectedWeekLabel);
  responsesSheet.getRange(row, adminNotesCol).setValue('Reference Code matched and confirmed.');
  responsesSheet.getRange(row, matchedStatusCol).setValue('confirmed');
  responsesSheet.getRange(row, confirmedAtCol).setValue(now);
}

function getValidCodeSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('ValidCode');
  if (!sheet) throw new Error('ValidCode sheet not found.');
  return sheet;
}

function ensureValidCodeHeaders_(sheet) {
  var headers = [
    'Reference Code',
    'Year of Study',
    'Criminal Procedure Status',
    'Transport Needed',
    'Selected Week ID',
    'Selected Week Label',
    'Created At',
    'Status',
    'Google_Form_Submitted_At',
    'Confirmed_At',
    'Waitlist_Reason',
    'Admin_Notes'
  ];
  var current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  for (var i = 0; i < headers.length; i++) {
    if (String(current[i] || '').trim() !== headers[i]) sheet.getRange(1, i + 1).setValue(headers[i]);
  }
}

function codeExists_(sheet, code) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  var values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (normalizeReferenceCodeForCompare_(values[i][0]) === normalizeReferenceCodeForCompare_(code)) return true;
  }
  return false;
}

function countConfirmedForWeek_(rows, headerIndex, selectedWeekId, skipRow) {
  var weekIdx = (headerIndex['selected week id'] || 5) - 1;
  var statusIdx = (headerIndex['status'] || 8) - 1;
  var total = 0;
  for (var i = 1; i < rows.length; i++) {
    if (skipRow && i + 1 === skipRow) continue;
    var weekValue = String(rows[i][weekIdx] || '').trim().toLowerCase();
    var statusValue = String(rows[i][statusIdx] || '').trim().toLowerCase();
    if (weekValue === selectedWeekId && statusValue === 'confirmed') total += 1;
  }
  return total;
}

function countReservedForWeek_(rows, headerIndex, selectedWeekId, skipRow) {
  var weekIdx = (headerIndex['selected week id'] || 5) - 1;
  var statusIdx = (headerIndex['status'] || 8) - 1;
  var total = 0;
  for (var i = 1; i < rows.length; i++) {
    if (skipRow && i + 1 === skipRow) continue;
    var weekValue = String(rows[i][weekIdx] || '').trim().toLowerCase();
    var statusValue = String(rows[i][statusIdx] || '').trim().toLowerCase();
    if (weekValue === selectedWeekId && RESERVED_STATUSES[statusValue]) total += 1;
  }
  return total;
}

function enforceWeeklyCapacity() {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = getValidCodeSheet_();
    ensureValidCodeHeaders_(sheet);
    var rows = sheet.getDataRange().getValues();
    if (rows.length < 2) return { ok: true, reassigned: 0, weeks: {} };

    var index = buildHeaderIndex_(rows[0] || []);
    var weekIdx = (index['selected week id'] || 5) - 1;
    var statusIdx = (index['status'] || 8) - 1;
    var createdAtIdx = (index['created at'] || 7) - 1;
    var waitlistReasonIdx = (index['waitlist_reason'] || 11) - 1;
    var adminNotesIdx = (index['admin_notes'] || 12) - 1;
    var byWeek = {};

    for (var i = 1; i < rows.length; i++) {
      var weekId = String(rows[i][weekIdx] || '').trim().toLowerCase();
      var status = String(rows[i][statusIdx] || '').trim().toLowerCase();
      if (!weekId || !RESERVED_STATUSES[status]) continue;
      if (!byWeek[weekId]) byWeek[weekId] = [];
      byWeek[weekId].push({
        rowNumber: i + 1,
        status: status,
        createdAt: rows[i][createdAtIdx]
      });
    }

    var summary = {};
    var reassigned = 0;
    var weekIds = Object.keys(byWeek);
    for (var w = 0; w < weekIds.length; w++) {
      var id = weekIds[w];
      var reservations = byWeek[id].sort(compareReservationPriority_);
      summary[id] = { kept: Math.min(reservations.length, WEEK_CAPACITY), reassigned: 0 };
      for (var r = WEEK_CAPACITY; r < reservations.length; r++) {
        var rowNumber = reservations[r].rowNumber;
        sheet.getRange(rowNumber, statusIdx + 1).setValue('needs_reassignment');
        sheet.getRange(rowNumber, waitlistReasonIdx + 1).setValue('Week capacity is limited to 15 students.');
        sheet.getRange(rowNumber, adminNotesIdx + 1).setValue('Set by enforceWeeklyCapacity: over weekly capacity.');
        summary[id].reassigned += 1;
        reassigned += 1;
      }
    }
    SpreadsheetApp.flush();
    return { ok: true, reassigned: reassigned, weeks: summary };
  } finally {
    lock.releaseLock();
  }
}

function compareReservationPriority_(a, b) {
  if (a.status === 'confirmed' && b.status !== 'confirmed') return -1;
  if (a.status !== 'confirmed' && b.status === 'confirmed') return 1;
  var aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
  var bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
  if (aTime !== bTime) return aTime - bTime;
  return a.rowNumber - b.rowNumber;
}

function buildWeekStatusMap_(sheet) {
  var rows = sheet.getDataRange().getValues();
  var result = buildDefaultWeekStatusMap_();
  if (rows.length < 2) return result;
  var headerIndex = buildHeaderIndex_(rows[0] || []);
  var weekIdx = (headerIndex['selected week id'] || 5) - 1;
  var statusIdx = (headerIndex['status'] || 8) - 1;

  for (var i = 1; i < rows.length; i++) {
    var weekId = String(rows[i][weekIdx] || '').trim().toLowerCase();
    var status = String(rows[i][statusIdx] || '').trim().toLowerCase();
    if (!weekId) continue;
    if (!result[weekId]) result[weekId] = { capacity: WEEK_CAPACITY, confirmed_count: 0, reserved_count: 0, closed: false };
    if (RESERVED_STATUSES[status]) result[weekId].reserved_count += 1;
    if (status === 'confirmed') result[weekId].confirmed_count += 1;
  }

  var keys = Object.keys(result);
  for (var j = 0; j < keys.length; j++) {
    var key = keys[j];
    result[key].closed = isWeekManuallyClosed_(key) || result[key].reserved_count >= WEEK_CAPACITY;
  }
  return result;
}

function buildDefaultWeekStatusMap_() {
  var result = {};
  for (var i = 0; i < WEEK_CONFIG.length; i++) {
    var week = WEEK_CONFIG[i];
    result[week.id] = {
      label: week.label,
      capacity: WEEK_CAPACITY,
      confirmed_count: 0,
      reserved_count: 0,
      closed: Boolean(week.closed)
    };
  }
  return result;
}

function isWeekManuallyClosed_(weekId) {
  for (var i = 0; i < WEEK_CONFIG.length; i++) {
    if (WEEK_CONFIG[i].id === weekId) return Boolean(WEEK_CONFIG[i].closed);
  }
  return false;
}

function ensureResponseColumn_(sheet, cachedHeaders, headerName) {
  var target = headerName.toLowerCase();
  for (var i = 0; i < cachedHeaders.length; i++) {
    if (String(cachedHeaders[i] || '').trim().toLowerCase() === target) return i + 1;
  }
  var newCol = sheet.getLastColumn() + 1;
  sheet.getRange(1, newCol).setValue(headerName);
  cachedHeaders.push(headerName);
  return newCol;
}

function buildHeaderIndex_(headers) {
  var index = {};
  for (var i = 0; i < headers.length; i++) {
    var key = String(headers[i] || '').trim().toLowerCase();
    if (key && !index[key]) index[key] = i + 1;
  }
  return index;
}

function normalizeReferenceCodeForCompare_(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function normalizeReferenceCodeForStorage_(value) {
  return String(value || '').trim().toUpperCase();
}

function isValidReferenceCode_(value) {
  return /^BLASC-NPA-2026-[A-Z0-9]{6}$/.test(String(value || '').trim().toUpperCase());
}

function parseJsonBody_(e) {
  if (!e || !e.postData || !e.postData.contents) return null;
  try {
    return JSON.parse(e.postData.contents);
  } catch (_) {
    return null;
  }
}

function payloadFromRequestParameters_(params) {
  return {
    action: String(params.action || ''),
    referenceCode: String(params.referenceCode || ''),
    yearOfStudy: String(params.yearOfStudy || ''),
    selectedWeekId: String(params.selectedWeekId || ''),
    selectedWeekLabel: String(params.selectedWeekLabel || '')
  };
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
