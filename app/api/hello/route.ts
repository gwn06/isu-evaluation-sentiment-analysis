import { NextResponse } from "next/server";
const sheets = require('@googleapis/sheets')

export async function GET(request: Request) {
  const headers = request.headers;
  const { privateKey } = JSON.parse(process.env.GOOGLE_PRIVATE_KEY || '{ privateKey: null }')
  
  const auth = new sheets.auth.GoogleAuth({ projectId: process.env.GOOGLE_PROJECT_ID, credentials: {private_key: privateKey, client_email: process.env.GOOGLE_CLIENT_EMAIL}, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] })
  const authClient = await auth.getClient();
  const client = await sheets.sheets({
    version: 'v4',
    auth: authClient
  });
  const range = 'Sheet1!A1:F10000';

  try {
    const result = await client.spreadsheets.values.get({spreadsheetId: process.env.SHEETS_ID, range });
    const numRows = result.data.values ? result.data.values.length : 0;
    console.log(`${numRows} rows retrieved.`);
    return NextResponse.json( result.data.values, {status:200});
  } catch (err) {
    // TODO (developer) - Handle exception
    throw err;
  }

}
