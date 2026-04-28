/**
 * BLASC UFS - UFS/NPA ITSOAP Programme Google Form generator
 *
 * Setup:
 * 1) Open script.google.com and create a new Apps Script project.
 * 2) Paste this full file into Code.gs.
 * 3) Save, then run createUfsNpaPrivateApplicationForm().
 * 4) Authorize permissions when prompted.
 *
 * What this script does:
 * - Creates the private application Google Form with required sections/questions
 * - Applies validation where supported
 * - Sets form confirmation message
 * - Creates + links a response spreadsheet
 * - Logs edit URL, live URL, sheet URL
 * - Logs a prefilled-link template for BLASC Reference Code
 */

function createUfsNpaPrivateApplicationForm() {
  try {
    var form = FormApp.create('UFS/NPA ITSOAP Programme - Private Application Form');

    form.setDescription(
      'Please complete this form only after finishing the BLASC pre-application process.\n\n' +
      'This form collects the private personal information required for the UFS/NPA ITSOAP Programme. To protect student privacy, this information is collected separately from the BLASC date-allocation screening step.\n\n' +
      'You must enter the same BLASC Reference Code generated during the pre-application process so that your Google Form submission can be matched to your selected programme week.\n\n' +
      'Submitting this form does not automatically guarantee placement in the programme.'
    );

    form.setConfirmationMessage(
      'Thank you. Your private application details have been submitted.\n\n' +
      'Please make sure that the BLASC Reference Code you entered matches the code generated during the BLASC pre-application process. Your submission will be reviewed together with your date-allocation screening record.\n\n' +
      'Submission of this form does not automatically guarantee placement in the programme.'
    );

    // SECTION 1 - Matching Details
    form.addPageBreakItem().setTitle('Matching Details');

    var refCodeValidation = FormApp.createTextValidation()
      .requireTextMatchesPattern('^BLASC-NPA-2026-[A-Z0-9]{6}$')
      .setHelpText('Enter the reference code generated on the BLASC website.')
      .build();

    var blascRefCodeItem = form.addTextItem()
      .setTitle('BLASC Reference Code')
      .setRequired(true)
      .setValidation(refCodeValidation);

    form.addTextItem()
      .setTitle('Initials')
      .setRequired(true);

    // SECTION 2 - Student Details
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

    form.addTextItem()
      .setTitle('Email Address')
      .setRequired(true)
      .setValidation(emailValidation);

    form.addTextItem()
      .setTitle('Contact Number')
      .setRequired(true);

    // SECTION 3 - Logistics and Academic Status
    form.addPageBreakItem().setTitle('Logistics and Academic Status');

    form.addMultipleChoiceItem()
      .setTitle('Will you need transport?')
      .setRequired(true)
      .setChoiceValues([
        'No, I have my own transport',
        'Yes, I will need transport'
      ]);

    form.addMultipleChoiceItem()
      .setTitle('Have you completed or are you currently completing Criminal Procedure?')
      .setRequired(true)
      .setChoiceValues([
        'Yes, I have completed Criminal Procedure',
        'Yes, I am currently completing Criminal Procedure',
        'No, I have not yet done Criminal Procedure'
      ]);

    // SECTION 4 - Declaration and Confirmation
    form.addPageBreakItem().setTitle('Declaration and Confirmation');

    // Forms does not support "section description" directly on page breaks in a rich way,
    // so we add a Section Header item with the required declaration text.
    form.addSectionHeaderItem()
      .setTitle(
        'I confirm that I have read and understood the Student Declaration and Undertaking for the UFS/NPA ITSOAP Programme. ' +
        'I understand that participation is voluntary and subject to strict standards of confidentiality, professionalism, supervision, ethical conduct, and compliance with programme rules. ' +
        'I agree to conduct myself in a manner consistent with the dignity of the legal profession, the University of the Free State, BLASC UFS, and the National Prosecuting Authority.'
      );

    var declarationItem = form.addMultipleChoiceItem()
      .setTitle('Declaration acknowledgement')
      .setRequired(true);

    // Section logic:
    // - "I agree" continues to next question
    // - "I do not agree" submits immediately (ends form)
    declarationItem.setChoices([
      declarationItem.createChoice('I agree', FormApp.PageNavigationType.CONTINUE),
      declarationItem.createChoice('I do not agree', FormApp.PageNavigationType.SUBMIT)
    ]);

    form.addCheckboxItem()
      .setTitle('Final confirmation')
      .setRequired(true)
      .setChoiceValues([
        'I confirm that the information I have provided is true and correct.'
      ]);

    // Create + link response spreadsheet
    var responseSheet = SpreadsheetApp.create('UFS-NPA-ITSOAP-Private-Application-Responses');
    form.setDestination(FormApp.DestinationType.SPREADSHEET, responseSheet.getId());

    // Log URLs
    Logger.log('Edit Form URL: ' + form.getEditUrl());
    Logger.log('Live Form URL: ' + form.getPublishedUrl());
    Logger.log('Response Sheet URL: ' + responseSheet.getUrl());

    // Log prefilled link template for BLASC Reference Code
    logPrefilledReferenceCodeTemplate_(form, blascRefCodeItem);
  } catch (err) {
    Logger.log('Error creating UFS/NPA ITSOAP form: ' + err);
    throw err;
  }
}

/**
 * Helper: logs a prefilled link template for BLASC Reference Code.
 * Usage example after creation:
 * - Replace PLACEHOLDERCODE with real code, e.g. BLASC-NPA-2026-7F3K2Q
 * - Use the resulting URL from BLASC website handoff
 */
function logPrefilledReferenceCodeTemplate_(form, blascRefCodeItem) {
  try {
    var itemResponse = blascRefCodeItem.asTextItem().createResponse('BLASC-NPA-2026-PLACEHOLDERCODE');
    var formResponse = form.createResponse();
    formResponse.withItemResponse(itemResponse);
    var prefilledUrl = formResponse.toPrefilledUrl();

    Logger.log('Prefilled URL template (BLASC Reference Code): ' + prefilledUrl);
  } catch (err) {
    Logger.log('Could not generate prefilled URL template: ' + err);
  }
}
