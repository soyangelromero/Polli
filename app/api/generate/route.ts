import { NextRequest, NextResponse } from "next/server";

// Model category lookup (server-side, no icon imports)
const IMAGE_MODEL_IDS = ["flux", "zimage", "imagen-4", "klein", "klein-large", "gptimage", "seedream", "kontext", "nanobanana", "seedream-pro", "gptimage-large", "nanobanana-pro"];
const VIDEO_MODEL_IDS = ["grok-video", "ltx-2", "seedance-pro", "seedance", "wan", "veo"];
const AUDIO_TTS_IDS = ["elevenlabs", "elevenmusic"];
const AUDIO_TRANSCRIPTION_IDS = ["scribe", "whisper"];

const BASE_URL = "https://gen.pollinations.ai";

function getModelCategory(modelId: string): "text" | "image" | "video" | "audio-tts" | "audio-transcription" {
    if (IMAGE_MODEL_IDS.includes(modelId)) return "image";
    if (VIDEO_MODEL_IDS.includes(modelId)) return "video";
    if (AUDIO_TTS_IDS.includes(modelId)) return "audio-tts";
    if (AUDIO_TRANSCRIPTION_IDS.includes(modelId)) return "audio-transcription";
    return "text";
}

// ─── Image/Video Generation ───
async function generateImage(prompt: string, model: string, apiKey: string) {
    const params = new URLSearchParams({
        model,
        width: "1024",
        height: "1024",
        nologo: "true",
        seed: Math.floor(Math.random() * 999999).toString(),
    });
    const encodedPrompt = encodeURIComponent(prompt);
    const url = `${BASE_URL}/image/${encodedPrompt}?${params.toString()}`;

    const response = await fetch(url, {
        headers: { "Authorization": `Bearer ${apiKey}` },
    });

    if (!response.ok) {
        // Try to get error details
        try {
            const errorData = await response.json();
            const msg = errorData.error?.message || errorData.error || JSON.stringify(errorData);
            return { error: msg, status: response.status };
        } catch {
            return { error: `Image generation failed (${response.status})`, status: response.status };
        }
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:${contentType};base64,${base64}`;

    return { mediaUrl: dataUrl, mediaType: contentType.startsWith("video") ? "video" : "image" };
}

// ─── Video Generation ───
async function generateVideo(prompt: string, model: string, apiKey: string) {
    const params = new URLSearchParams({
        model,
        nologo: "true",
        seed: Math.floor(Math.random() * 999999).toString(),
    });
    const encodedPrompt = encodeURIComponent(prompt);
    const url = `${BASE_URL}/image/${encodedPrompt}?${params.toString()}`;

    const response = await fetch(url, {
        headers: { "Authorization": `Bearer ${apiKey}` },
    });

    if (!response.ok) {
        try {
            const errorData = await response.json();
            const msg = errorData.error?.message || errorData.error || JSON.stringify(errorData);
            return { error: msg, status: response.status };
        } catch {
            return { error: `Video generation failed (${response.status})`, status: response.status };
        }
    }

    const contentType = response.headers.get("content-type") || "video/mp4";
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:${contentType};base64,${base64}`;

    return { mediaUrl: dataUrl, mediaType: "video" };
}

// ─── Audio TTS ───
async function generateAudio(text: string, model: string, apiKey: string, voice: string = "alloy") {
    const response = await fetch(`${BASE_URL}/v1/audio/speech`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            input: text,
            voice,
            response_format: "mp3",
        }),
    });

    if (!response.ok) {
        try {
            const errorData = await response.json();
            const msg = errorData.error?.message || errorData.error || JSON.stringify(errorData);
            return { error: msg, status: response.status };
        } catch {
            return { error: `Audio generation failed (${response.status})`, status: response.status };
        }
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:audio/mpeg;base64,${base64}`;

    return { mediaUrl: dataUrl, mediaType: "audio" };
}

// ─── Audio Transcription ───
async function transcribeAudio(audioData: string, model: string, apiKey: string, fileName: string) {
    // audioData is base64 encoded
    const buffer = Buffer.from(audioData, "base64");

    // Create a FormData-like body for transcription
    const formData = new FormData();
    const blob = new Blob([buffer], { type: "audio/mpeg" });
    formData.append("file", blob, fileName || "audio.mp3");
    formData.append("model", model);

    const response = await fetch(`${BASE_URL}/v1/audio/transcriptions`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
        },
        body: formData,
    });

    if (!response.ok) {
        try {
            const errorData = await response.json();
            const msg = errorData.error?.message || errorData.error || JSON.stringify(errorData);
            return { error: msg, status: response.status };
        } catch {
            return { error: `Transcription failed (${response.status})`, status: response.status };
        }
    }

    const data = await response.json();
    return { content: data.text || JSON.stringify(data), mediaType: "transcription" };
}

export async function POST(req: NextRequest) {
    try {
        const apiKey = req.headers.get("x-api-key");
        if (!apiKey) {
            return NextResponse.json(
                { error: "API Key missing", info: "Get your free API key at https://pollinations.ai/login" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { prompt, model, voice, audioData, audioFileName } = body;

        if (!prompt && !audioData) {
            return NextResponse.json({ error: "Prompt or audio data required" }, { status: 400 });
        }

        const category = getModelCategory(model);

        if (category === "image") {
            const result = await generateImage(prompt, model, apiKey);
            if ("error" in result) {
                return NextResponse.json({ error: result.error }, { status: result.status });
            }
            return NextResponse.json(result);
        }

        if (category === "video") {
            const result = await generateVideo(prompt, model, apiKey);
            if ("error" in result) {
                return NextResponse.json({ error: result.error }, { status: result.status });
            }
            return NextResponse.json(result);
        }

        if (category === "audio-tts") {
            const result = await generateAudio(prompt, model, apiKey, voice || "alloy");
            if ("error" in result) {
                return NextResponse.json({ error: result.error }, { status: result.status });
            }
            return NextResponse.json(result);
        }

        if (category === "audio-transcription") {
            if (!audioData) {
                return NextResponse.json({ error: "Audio data required for transcription" }, { status: 400 });
            }
            const result = await transcribeAudio(audioData, model, apiKey, audioFileName || "audio.mp3");
            if ("error" in result) {
                return NextResponse.json({ error: result.error }, { status: result.status });
            }
            return NextResponse.json(result);
        }

        return NextResponse.json({ error: "Unsupported model type" }, { status: 400 });
    } catch (error: any) {
        console.error("Generate error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
