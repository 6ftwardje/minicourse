// Configuration
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // Replace with your Google Sheet ID
const SHEET_NAME = 'Form Submissions';

// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://freeminicourse.netlify.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

// Handle OPTIONS request for CORS preflight
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders(CORS_HEADERS);
}

// Main function to handle POST requests
function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Validate required fields
    if (!data.name || !data.email || !data.consent) {
      throw new Error('Missing required fields');
    }

    // Validate email format
    if (!isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }

    // Get the spreadsheet and sheet
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    // If the sheet is new, add headers
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Email', 'Consent Given']);
    }

    // Add the submission to the spreadsheet
    sheet.appendRow([
      new Date(),
      data.name,
      data.email,
      data.consent ? 'Yes' : 'No'
    ]);

    // Send confirmation email
    sendConfirmationEmail(data.email, data.name);

    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Form submitted successfully'
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(CORS_HEADERS);

  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.message || 'An error occurred while processing the form'
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(CORS_HEADERS);
  }
}

// Helper function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to send confirmation email
function sendConfirmationEmail(email, name) {
  const subject = 'Bedankt voor je aanmelding!';
  const body = `
    Beste ${name},

    Bedankt voor je aanmelding! Je hebt nu toegang tot de video content.

    Met vriendelijke groet,
    Het Team
  `;

  try {
    MailApp.sendEmail({
      to: email,
      subject: subject,
      body: body
    });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
} 