import { NextResponse } from "next/server";
import axios from "axios";

const TOKEN = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;

export async function POST(request) {
    if (request.method !== "POST") {
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
        const formData = await request.formData();
        const audioFile = formData.get("file");

        if (!audioFile) {
            return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
        }

        const buffer = Buffer.from(await audioFile.arrayBuffer()); // Convert file to Buffer

        const API_URL = "https://api-inference.huggingface.co/models/openai/whisper-large-v3-turbo";
        const headers = {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "audio/wav",
        };

        const response = await axios.post(API_URL, buffer, { headers });

        if (response.status !== 200 || !response.data) {
            return NextResponse.json({ error: "Failed to transcribe audio" }, { status: 500 });
        }

        return NextResponse.json({ transcription: response.data.text }, { status: 200 });
    } catch (error) {
        console.error("Error during audio transcription:", error);
        return NextResponse.json({ error: "Failed to process audio transcription" }, { status: 500 });
    }
}
