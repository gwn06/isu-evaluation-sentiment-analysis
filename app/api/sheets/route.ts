import { NextResponse } from 'next/server';
import { HfInference } from "@huggingface/inference";
const sheets = require('@googleapis/sheets')

const inference = new HfInference(process.env.HF_ACCESS_TOKEN);

export async function POST(request: Request) {
  request.headers;
  const data = await request.json();

  const { privateKey } = JSON.parse(process.env.GOOGLE_PRIVATE_KEY || '{ privateKey: null }')

  const auth = new sheets.auth.GoogleAuth({ projectId: process.env.GOOGLE_PROJECT_ID, credentials: { private_key: privateKey, client_email: process.env.GOOGLE_CLIENT_EMAIL }, scopes: ['https://www.googleapis.com/auth/spreadsheets'] })
  const authClient = await auth.getClient();
  const client = await sheets.sheets({
    version: 'v4',
    auth: authClient
  });

  let output = null;
  try {
    // nlptown/bert-base-multilingual-uncased-sentiment
    // output = await inference.textClassification({ inputs: data.comment, model: "distilbert-base-uncased-finetuned-sst-2-english" });
    output = await inference.textClassification({ inputs: data.comment, model: "cardiffnlp/twitter-roberta-base-sentiment-latest" });
    // output = await fetch('api/model',
    // {
    //   method: 'POST', headers: {
    //     'Accept': 'application/json, text/plain, */*',
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(data.comment)
    // }
    // )
    // console.log(output, 'output');

  } catch (error) {
    console.log(error, "error");

    // return NextResponse.json('', { status: 500 });
  }


  const range = 'Sheet1!A1:F1';
  const ans = Object.values(Object.values(data.answers).map((value: any) => value.pos));
  const today = new Date().toLocaleString();
  const values = [
    [today, data.username, data.course, ans.toString(), data.comment, JSON.stringify(output)]
  ];
  const resource = { values };

  try {
    const result = await client.spreadsheets.values.append({
      spreadsheetId: process.env.SHEETS_ID,
      range,
      valueInputOption: 'RAW',
      resource,
    });
    // console.log(`${result.data.updates.updatedCells} cells appended.`);
    return NextResponse.json('', { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json('', { status: 500 });
  }


}
