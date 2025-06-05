// Configuration
const SPREADSHEET_ID = '1SKVaGBZQ6cGqB3c7DGXYMCIrMIUjy5jrM4zepL9Fvig'; // Google Sheet ID
const SHEET_NAME = 'Form Submissions';

// Handle OPTIONS request for CORS preflight
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Handle GET request (for testing)
function doGet(e) {
  const response = {
    status: 'success',
    message: 'API is working'
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// Main function to handle POST requests
function doPost(e) {
  try {
    // Log the incoming request
    console.log('Received POST request');
    console.log('Request parameters:', e.parameters);
    console.log('Post data:', e.postData);
    
    if (!e.postData || !e.postData.contents) {
      throw new Error('No data received in request');
    }

    // Parse the incoming JSON data
    let data;
    try {
      data = JSON.parse(e.postData.contents);
      console.log('Parsed data:', data);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      throw new Error('Invalid JSON data received');
    }
    
    // Validate required fields
    if (!data.name || !data.email || !data.consent) {
      console.error('Missing required fields:', data);
      throw new Error('Missing required fields');
    }

    // Validate email format
    if (!isValidEmail(data.email)) {
      console.error('Invalid email format:', data.email);
      throw new Error('Invalid email format');
    }

    // Get the spreadsheet and sheet
    let ss;
    try {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      console.log('Successfully opened spreadsheet');
    } catch (spreadsheetError) {
      console.error('Error opening spreadsheet:', spreadsheetError);
      throw new Error('Could not access spreadsheet. Please check the SPREADSHEET_ID.');
    }

    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      console.log('Creating new sheet:', SHEET_NAME);
      sheet = ss.insertSheet(SHEET_NAME);
    }

    // If the sheet is new, add headers
    if (sheet.getLastRow() === 0) {
      console.log('Adding headers to new sheet');
      sheet.appendRow(['Timestamp', 'Name', 'Email', 'Consent Given']);
    }

    // Add the submission to the spreadsheet
    try {
      sheet.appendRow([
        new Date(),
        data.name,
        data.email,
        data.consent ? 'Yes' : 'No'
      ]);
      console.log('Successfully added row to spreadsheet');
    } catch (appendError) {
      console.error('Error appending row:', appendError);
      throw new Error('Failed to save data to spreadsheet');
    }

    // Send confirmation email
    try {
      sendConfirmationEmail(data.email, data.name);
      console.log('Successfully sent confirmation email');
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't throw error here, as the form submission was successful
    }

    // Return success response
    const response = {
      status: 'success',
      message: 'Form submitted successfully'
    };
    
    console.log('Sending success response');
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Log the error
    console.error('Error in doPost:', error);
    
    // Return error response
    const errorResponse = {
      status: 'error',
      message: error.message || 'An error occurred while processing the form'
    };
    
    console.log('Sending error response:', errorResponse);
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
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
    throw error; // Re-throw to handle in doPost
  }
} 