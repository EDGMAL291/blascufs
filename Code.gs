/**
 * BLASC UFS - UFS/NPA ITSOAP Programme Google Form + code verification script.
 */

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
      .setChoiceValues(['Final Year', '3rd Year', '2nd Year', '1st Year']);

    var emailValidation = FormApp.createTextValidation()
      .requireTextIsEmail()
      .setHelpText('Enter a valid email address.')
      .build();

    form.addTextItem().setTitle('Email Address').setRequired(true).setValidation(emailValidation);
    form.addTextItem().setTitle('Contact Number').setRequired(true);

    form.addPageBreakItem().setTitle('Logistics and Academic Status');
    form.addMultipleChoiceItem()
      .setTitle('Will you need transport?')
      .setRequired(true)
      .setChoiceValues(['No, I have my own transport', 'Yes, I will need transport']);

    form.addMultipleChoiceItem()
      .setTitle('Have you completed or are you currently completing Criminal Procedure?')
      .setRequired(true)
      .setChoiceValues([
        'Yes, I have completed Criminal Procedure',
        'Yes, I am currently completing Criminal Procedure',
        'No, I have not yet done Criminal Procedure'
      ]);

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
 * {"action":"createPreApplication","referenceCode":"BLASC-NPA-2026-7F3K2Q","yearOfStudy":"third","criminalProcedureStatus":"yes","transportNeeded":"no","selectedWeekId":"w6","selectedWeekLabel":"Week 6 (9-13 Jun 2026)"}
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
  var referenceCode = normalizeReferenceCodeForStorage_(payload.referenceCode);
  var yearOfStudy = String(payload.yearOfStudy || '').trim().toLowerCase();
  var criminalProcedureStatus = String(payload.criminalProcedureStatus || '').trim().toLowerCase();
  var transportNeeded = String(payload.transportNeeded || '').trim().toLowerCase();
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
  var statusIdx = (index['status'] || 7) - 1;

  for (var i = 1; i < rows.length; i++) {
    if (normalizeReferenceCodeForCompare_(rows[i][referenceCodeIdx]) === normalizeReferenceCodeForCompare_(referenceCode)) {
      return jsonResponse_({ ok: false, error: 'Duplicate reference code.' });
    }
  }

  sheet.appendRow([
    referenceCode,
    yearOfStudy,
    criminalProcedureStatus,
    transportNeeded,
    selectedWeekId,
    selectedWeekLabel,
    new Date(),
    'pending_google_form',
    '',
    '',
    '',
    ''
  ]);

  return jsonResponse_({
    ok: true,
    referenceCode: referenceCode,
    status: 'pending_google_form',
    weekStatus: buildWeekStatusMap_(sheet)
  });
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

  if (weekConfirmedCount >= 15) {
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

function buildWeekStatusMap_(sheet) {
  var rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return {};
  var headerIndex = buildHeaderIndex_(rows[0] || []);
  var weekIdx = (headerIndex['selected week id'] || 5) - 1;
  var statusIdx = (headerIndex['status'] || 8) - 1;
  var result = {};

  for (var i = 1; i < rows.length; i++) {
    var weekId = String(rows[i][weekIdx] || '').trim().toLowerCase();
    var status = String(rows[i][statusIdx] || '').trim().toLowerCase();
    if (!weekId) continue;
    if (!result[weekId]) result[weekId] = { confirmed_count: 0, closed: false };
    if (status === 'confirmed') result[weekId].confirmed_count += 1;
  }

  var keys = Object.keys(result);
  for (var j = 0; j < keys.length; j++) {
    var key = keys[j];
    result[key].closed = result[key].confirmed_count >= 15;
  }
  return result;
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
    criminalProcedureStatus: String(params.criminalProcedureStatus || ''),
    transportNeeded: String(params.transportNeeded || ''),
    selectedWeekId: String(params.selectedWeekId || ''),
    selectedWeekLabel: String(params.selectedWeekLabel || '')
  };
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
