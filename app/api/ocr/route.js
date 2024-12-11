import { NextResponse } from 'next/server';
const { ocr } = require("llama-ocr");

const API_KEY=process.env.NEXT_PUBLIC_TOGETHER_API_KEY;

export async function POST(request) {
    if (request.method !== "POST") {
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    const { imagePath } = await request.json();
    console.log(imagePath);

    if (!imagePath) {
        return NextResponse.json({ error: "Missing imagePath in request body" }, { status: 400 });
    }

    try {
        const result = await ocr({
            filePath: imagePath,
            apiKey: API_KEY,
            model: "Llama-3.2-11B-Vision",
        });
        return NextResponse.json({ result }, { status: 200 });
    } catch (error) {
        console.error("Error during OCR processing:", error);
        return NextResponse.json({ error: "Failed to process OCR" }, { status: 500 });
    }
}
