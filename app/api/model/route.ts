import { NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";

const inference = new HfInference(process.env.HF_ACCESS_TOKEN);

export async function GET(request: Request) {
    request.headers;
    console.log(request.body)
    try {
        const res = await inference.textClassification({ inputs: "I'm happy.", model: "distilbert-base-uncased-finetuned-sst-2-english" })
        return NextResponse.json({ res });
    } catch (error) {
        console.log(error);

        return NextResponse.json({});
    }

}