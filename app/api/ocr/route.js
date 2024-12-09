import { NextResponse } from 'next/server';
const { ocr } = require("llama-ocr");

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
            apiKey: 'fcae42d55127788101f662b300aec4f2a4287b9541bc65a61bb024edd3a2b405',
            model: "Llama-3.2-11B-Vision",
        });
        return NextResponse.json({ result }, { status: 200 });
    } catch (error) {
        console.error("Error during OCR processing:", error);
        return NextResponse.json({ error: "Failed to process OCR" }, { status: 500 });
    }
}
