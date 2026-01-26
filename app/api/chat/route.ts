import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
// @ts-ignore
import pdf from "pdf-parse-fork";

const SKILLS_DIR = path.join(process.cwd(), "skills");

function loadSkills(): string {
    try {
        if (!fs.existsSync(SKILLS_DIR)) return "";
        const files = fs.readdirSync(SKILLS_DIR).filter(f => f.endsWith(".md"));
        let combinedSkills = "";
        files.forEach(file => {
            const content = fs.readFileSync(path.join(SKILLS_DIR, file), "utf-8");
            combinedSkills += `--- SKILL: ${file} ---\n${content}\n\n`;
        });
        return combinedSkills;
    } catch (error) {
        console.warn("Failed to load skills:", error);
        return "";
    }
}

async function transcribePdfWithClaude(fileData: string, fileName: string, apiKey: string): Promise<string> {
    try {
        const response = await fetch("https://gen.pollinations.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "claude-large",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: `Extrae el texto completo de este PDF de forma estructurada en Markdown. Solo devuelve el contenido.` },
                            { type: "file", file: { file_data: fileData, file_name: fileName, mime_type: "application/pdf" } }
                        ]
                    }
                ],
                stream: false
            })
        });

        if (response.ok) {
            const data = await response.json();
            return data.choices[0].message.content;
        }
    } catch (error: any) { }

    try {
        const buffer = Buffer.from(fileData, 'base64');
        const result = await pdf(buffer);
        if (result.text?.trim()) return result.text;
    } catch (e) { }

    return "[SISTEMA]: No se pudo extraer el texto del PDF.";
}

export async function POST(req: NextRequest) {
    try {
        const apiKey = req.headers.get("x-api-key");
        if (!apiKey) return NextResponse.json({ error: "API Key missing" }, { status: 401 });

        const body = await req.json();
        const { messages, files, model = "claude-large" } = body;

        const skillsPrompt = loadSkills();
        const systemMessage = {
            role: "system",
            content: "REGLA CRÍTICA DE PERSONALIDAD: Responde de forma natural, breve y humana a los saludos. NO te presentes como abogado ni menciones tus habilidades especializadas hasta que el usuario suba un documento o haga una pregunta técnica.\n\n" + skillsPrompt
        };

        let prunedMessages = messages;
        if (messages.length > 20) {
            prunedMessages = [
                ...messages.slice(0, 2),
                { role: "system", content: "...[Historia antigua omitida para ahorrar tokens]..." },
                ...messages.slice(-15)
            ];
        }

        const lastMessage = prunedMessages[prunedMessages.length - 1];

        if (files && files.length > 0) {
            let contentParts: any[] = [{ type: "text", text: lastMessage.content }];
            for (const file of files) {
                if (file.type === "image") {
                    contentParts.push({ type: "image_url", image_url: { url: file.url } });
                } else if (file.type === "file") {
                    if (model === "claude-large") {
                        contentParts.push({ type: "file", file: { file_data: file.data, file_name: file.name, mime_type: "application/pdf" } });
                    } else {
                        // Transcribe but don't save to disk
                        const transcription = await transcribePdfWithClaude(file.data, file.name, apiKey);
                        contentParts.push({ type: "text", text: `\n\n[DOCUMENTO: ${file.name}]\n${transcription}\n[FIN]\n` });
                    }
                }
            }
            lastMessage.content = contentParts;
        }

        // Avoid duplicating system prompt if already present in history
        const hasSystemMessage = prunedMessages.some((m: any) => m.role === "system");
        const finalPayload = hasSystemMessage ? prunedMessages : [systemMessage, ...prunedMessages];

        const response = await fetch("https://gen.pollinations.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: finalPayload,
                stream: false
            })
        });

        if (!response.ok) return NextResponse.json({ error: await response.json() }, { status: response.status });

        const data = await response.json();
        const assistantMessage = data.choices[0].message;
        const reasoning = assistantMessage.reasoning_content || assistantMessage.thinking?.text || null;

        // Do NOT save to disk. Just return response.
        return NextResponse.json({ content: assistantMessage.content, reasoning });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
