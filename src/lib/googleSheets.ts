// To use this, you need to install googleapis: `npm install googleapis`
// import { google } from "googleapis";

export async function appendToSheet(data: any) {
  /*
  // HOW TO SET THIS UP:
  // 1. Go to Google Cloud Console (https://console.cloud.google.com/)
  // 2. Create a new project, enable "Google Sheets API"
  // 3. Create Credentials -> Service Account
  // 4. Create a key (JSON) for the service account and download it.
  // 5. Open your Google Sheet, and share it with the email address of the service account (e.g., something@project.iam.gserviceaccount.com) as an "Editor".
  // 6. Copy the Spreadsheet ID from the URL of your Google Sheet.
  // 7. Place the credentials in a secure env variable or file and uncomment the code below.

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:G", // Adjust range
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            data.fullName, 
            data.phone, 
            data.wilaya, 
            data.baladiya, 
            new Date().toLocaleDateString("ar-DZ"),
            data.status,
            data.utmSource || ""
          ]
        ],
      },
    });
    console.log("Appended to Google Sheets");
  } catch (error) {
    console.error("Google Sheets Error:", error);
  }
  */
}
