/**
 * Chandan & Anagha — Wedding RSVP Google Apps Script
 *
 * HOW TO DEPLOY:
 *  1. Open Google Sheets → Extensions → Apps Script.
 *  2. Paste this entire file, replacing any existing code.
 *  3. Click "Deploy" → "New deployment" → Type: Web app.
 *  4. Set "Execute as" = Me, "Who has access" = Anyone.
 *  5. Copy the Web app URL and paste it into index.html.html
 *     where indicated (APPS_SCRIPT_URL).
 *
 * SHEET SETUP (automatic on first submission):
 *  The script creates a sheet called "RSVPs" and adds a header row
 *  automatically — no manual setup needed.
 */

// ── Configuration ──────────────────────────────────────────────────────────
const SPREADSHEET_ID    = "1JoEnFHiJbxCKLNbXJzhViyeINxOtaSgPzuT9o3BZtOk";
const SHEET_NAME        = "RSVPs";
const NOTIFY_EMAIL      = "anandchandan@rocketmail.com";   // alert recipient
const SEND_EMAIL_ALERTS = true;  // set false to disable email notifications
// ───────────────────────────────────────────────────────────────────────────

/**
 * Handles HTTP GET — simple health-check so you can verify the deployment.
 * Visit the web-app URL in a browser; you should see {"status":"ok"}.
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "RSVP endpoint is live." }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handles HTTP POST — called by the wedding website RSVP form.
 * Accepts JSON body: { guestName, phone, guestCount, attending, message }
 */
function doPost(e) {
  // ── CORS pre-flight ────────────────────────────────────────────────────
  // Apps Script automatically handles OPTIONS; nothing extra needed here.

  try {
    // Parse the incoming JSON payload
    const payload = JSON.parse(e.postData.contents);

    const guestName  = sanitise(payload.guestName  || "");
    const phone      = sanitise(payload.phone       || "");
    const guestCount = sanitise(String(payload.guestCount || "1"));
    const attending  = sanitise(payload.attending   || "");
    const message    = sanitise(payload.message     || "");
    const timestamp  = new Date();

    // Validate required fields
    if (!guestName || !phone || !attending) {
      return jsonResponse({ success: false, error: "Missing required fields." }, 400);
    }

    // Write to the Google Sheet
    appendToSheet({ timestamp, guestName, phone, guestCount, attending, message });

    // Optionally send an email alert
    if (SEND_EMAIL_ALERTS) {
      sendEmailAlert({ timestamp, guestName, phone, guestCount, attending, message });
    }

    return jsonResponse({ success: true, message: "RSVP received. Thank you!" });

  } catch (err) {
    Logger.log("RSVP error: " + err.message);
    return jsonResponse({ success: false, error: "Server error. Please try again." }, 500);
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Appends one RSVP row to the sheet.
 * Creates the sheet and header row on first use.
 */
function appendToSheet(data) {
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  let   sheet = ss.getSheetByName(SHEET_NAME);

  // Create sheet + header if it doesn't exist yet
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "Timestamp",
      "Guest Name",
      "Phone",
      "No. of Guests",
      "Attending",
      "Message / Wishes"
    ]);

    // Style the header row
    const header = sheet.getRange(1, 1, 1, 6);
    header.setFontWeight("bold");
    header.setBackground("#4a1020");
    header.setFontColor("#ffffff");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 160);  // Timestamp
    sheet.setColumnWidth(2, 180);  // Guest Name
    sheet.setColumnWidth(3, 130);  // Phone
    sheet.setColumnWidth(4, 110);  // No. of Guests
    sheet.setColumnWidth(5, 110);  // Attending
    sheet.setColumnWidth(6, 280);  // Message
  }

  sheet.appendRow([
    data.timestamp,
    data.guestName,
    data.phone,
    data.guestCount,
    data.attending === "yes" ? "✅ Yes" : "❌ No",
    data.message
  ]);
}

/**
 * Sends a quick email alert when a new RSVP arrives.
 */
function sendEmailAlert(data) {
  try {
    const attending = data.attending === "yes" ? "✅ Will Attend" : "❌ Cannot Attend";
    const subject   = `New RSVP — ${data.guestName} (${attending})`;
    const body      =
      `A new RSVP has been submitted for Chandan & Anagha's Wedding Reception.\n\n` +
      `Name        : ${data.guestName}\n` +
      `Phone       : ${data.phone}\n` +
      `Guests      : ${data.guestCount}\n` +
      `Attending   : ${attending}\n` +
      `Message     : ${data.message || "(none)"}\n` +
      `Submitted at: ${data.timestamp.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}\n\n` +
      `View all RSVPs: ${SpreadsheetApp.openById(SPREADSHEET_ID).getUrl()}`;

    MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
  } catch (err) {
    // Email failure should not block the RSVP save
    Logger.log("Email alert failed: " + err.message);
  }
}

/**
 * Strips characters that could cause formula injection in Sheets.
 * (Defence-in-depth — the form already validates on the client side.)
 */
function sanitise(value) {
  if (typeof value !== "string") return String(value);
  // Remove leading =, +, -, @ which Excel/Sheets treat as formula starters
  return value.replace(/^[=+\-@\t\r]+/, "").trim();
}

/**
 * Returns a JSON ContentService response.
 * Apps Script doesn't support real HTTP status codes from doPost,
 * so the status field in the JSON body is what the client reads.
 */
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
