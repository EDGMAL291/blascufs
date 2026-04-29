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
      .requireTextMatchesPattern('^[A-Z0-9]{6}$')
      .setHelpText('Enter the 6-character reference code generated on the BLASC website.')
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
    var itemResponse = refCodeItem.asTextItem().createResponse('PLACEHOLDERCODE');
    var formResponse = form.createResponse();
    formResponse.withItemResponse(itemResponse);
    Logger.log('Prefilled URL template (Reference Code): ' + formResponse.toPrefilledUrl());
  } catch (err) {
    Logger.log('Could not generate prefilled URL template: ' + err);
  }
}

/**
 * Web app endpoint.
 * Request body JSON:
 * {"action":"reserveCode","code":"K7M4Q2","selectedDate":"Week 3 (19–23 May 2026)"}
 */
function doPost(e) {
  try {
    var payload = parseJsonBody_(e);
    if (!payload || payload.action !== 'reserveCode') {
      return jsonResponse_({ ok: false, error: 'Invalid action.' });
    }

    var code = normalizeCode_(payload.code);
    var selectedDate = String(payload.selectedDate || '').trim();

    if (!/^[A-Z0-9]{6}$/.test(code)) return jsonResponse_({ ok: false, error: 'Invalid code format.' });
    if (!selectedDate) return jsonResponse_({ ok: false, error: 'Selected Date is required.' });

    var sheet = getValidCodeSheet_();
    ensureValidCodeHeaders_(sheet);

    if (codeExists_(sheet, code)) {
      return jsonResponse_({ ok: false, error: 'Duplicate code.' });
    }

    sheet.appendRow([code, selectedDate, 'pending']);
    return jsonResponse_({ ok: true, code: code, status: 'pending' });
  } catch (err) {
    return jsonResponse_({ ok: false, error: 'Server error: ' + err.message });
  }
}

/**
 * Installable trigger: On form submit (bound to the spreadsheet).
 * Verifies responses["Reference Code"] against ValidCode.
 */
function onFormSubmit(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var validSheet = ss.getSheetByName('ValidCode');
  var responsesSheet = ss.getSheetByName('responses');
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

  var submittedCode = normalizeCode_(responsesSheet.getRange(row, codeCol).getValue());
  if (!submittedCode || !/^[A-Z0-9]{6}$/.test(submittedCode)) {
    responsesSheet.getRange(row, codeCheckCol).setValue('Invalid Code');
    responsesSheet.getRange(row, matchedDateCol).setValue('');
    responsesSheet.getRange(row, adminNotesCol).setValue('Missing or invalid Reference Code format.');
    return;
  }

  var validRows = validSheet.getDataRange().getValues();
  var validIndex = buildHeaderIndex_(validRows[0] || []);
  var codeIdx = (validIndex['code'] || 1) - 1;
  var selectedDateIdx = (validIndex['selected date'] || 2) - 1;
  var statusIdx = (validIndex['status'] || 3) - 1;

  var matches = [];
  for (var i = 1; i < validRows.length; i++) {
    if (normalizeCode_(validRows[i][codeIdx]) === submittedCode) matches.push(i + 1);
  }

  if (matches.length !== 1) {
    responsesSheet.getRange(row, codeCheckCol).setValue('Invalid Code');
    responsesSheet.getRange(row, matchedDateCol).setValue('');
    responsesSheet.getRange(row, adminNotesCol).setValue(matches.length === 0 ? 'Reference Code not found in ValidCode.' : 'Duplicate records found in ValidCode.');
    return;
  }

  var matchRow = matches[0];
  var statusValue = String(validSheet.getRange(matchRow, statusIdx + 1).getValue() || '').trim().toLowerCase();
  var matchedDate = String(validSheet.getRange(matchRow, selectedDateIdx + 1).getValue() || '').trim();
  if (statusValue === 'confirmed') {
    responsesSheet.getRange(row, codeCheckCol).setValue('Duplicate Code');
    responsesSheet.getRange(row, matchedDateCol).setValue(matchedDate);
    responsesSheet.getRange(row, adminNotesCol).setValue('Reference Code already confirmed.');
    return;
  }
  if (statusValue !== 'pending') {
    responsesSheet.getRange(row, codeCheckCol).setValue('Invalid Code');
    responsesSheet.getRange(row, matchedDateCol).setValue(matchedDate);
    responsesSheet.getRange(row, adminNotesCol).setValue('Reference Code status is not pending (' + statusValue + ').');
    return;
  }

  validSheet.getRange(matchRow, statusIdx + 1).setValue('confirmed');
  responsesSheet.getRange(row, codeCheckCol).setValue('confirmed');
  responsesSheet.getRange(row, matchedDateCol).setValue(matchedDate);
  responsesSheet.getRange(row, adminNotesCol).setValue('Reference Code matched and confirmed.');
}

function getValidCodeSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('ValidCode');
  if (!sheet) throw new Error('ValidCode sheet not found.');
  return sheet;
}

function ensureValidCodeHeaders_(sheet) {
  var headers = ['Code', 'Selected Date', 'Status'];
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
    if (normalizeCode_(values[i][0]) === code) return true;
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

function normalizeCode_(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function parseJsonBody_(e) {
  if (!e || !e.postData || !e.postData.contents) return null;
  try {
    return JSON.parse(e.postData.contents);
  } catch (_) {
    return null;
  }
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
