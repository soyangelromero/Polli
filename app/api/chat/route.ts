import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
// @ts-ignore
import pdf from "pdf-parse-fork";

const CHATS_DIR = path.join(process.cwd(), "chats");
const SKILLS_DIR = path.join(process.cwd(), "skills");

// Ensure directories exist
[CHATS_DIR, SKILLS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function loadSkills(): string {
    try {
        const files = fs.readdirSync(SKILLS_DIR).filter(f => f.endsWith(".md"));
        let combinedSkills = "";
        files.forEach(file => {
            const content = fs.readFileSync(path.join(SKILLS_DIR, file), "utf-8");
            combinedSkills += `--- SKILL: ${file} ---\n${content}\n\n`;
        });
        return combinedSkills;
    } catch (error) {
        return "";
    }
}

async function transcribePdfWithClaude(fileData: string, fileName: string, apiKey: string, chatDirPath?: string): Promise<string> {
    if (chatDirPath) {
        const transcriptionPath = path.join(chatDirPath, `${fileName}.transcription.md`);
        if (fs.existsSync(transcriptionPath)) return fs.readFileSync(transcriptionPath, "utf-8");
    }

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
            const transcription = data.choices[0].message.content;
            if (chatDirPath) fs.writeFileSync(path.join(chatDirPath, `${fileName}.transcription.md`), transcription);
            return transcription;
        }
    } catch (error: any) { }

    try {
        const buffer = Buffer.from(fileData, 'base64');
        const result = await pdf(buffer);
        if (result.text?.trim()) return result.text;
    } catch (e) { }

    return "[SISTEMA]: No se pudo extraer el texto del PDF.";
}

export async function GET() {
    try {
        const folders = fs.readdirSync(CHATS_DIR).filter(f => fs.statSync(path.join(CHATS_DIR, f)).isDirectory());
        const chats = folders.map(folder => {
            const filePath = path.join(CHATS_DIR, folder, "chat.json");
            return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, "utf-8")) : null;
        }).filter(Boolean);
        chats.sort((a, b) => (new Date(b.last_updated || b.createdAt)).getTime() - (new Date(a.last_updated || a.createdAt)).getTime());
        return NextResponse.json(chats);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const apiKey = req.headers.get("x-api-key");
        if (!apiKey) return NextResponse.json({ error: "API Key missing" }, { status: 401 });

        const body = await req.json();
        const { messages, files, chatId, chatTitle, model = "claude-large" } = body;

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
        let chatDirPath: string | undefined = undefined;

        if (chatId) {
            const folders = fs.readdirSync(CHATS_DIR);
            let folderName = folders.find(f => f.includes(chatId));
            if (!folderName) {
                folderName = `${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 16).replace("T", "_")}_${(chatTitle || "Nueva_Chat").replace(/[^a-z0-9]/gi, "_")}_${chatId}`;
            }
            chatDirPath = path.join(CHATS_DIR, folderName);
            if (!fs.existsSync(chatDirPath)) fs.mkdirSync(chatDirPath, { recursive: true });
        }

        if (files && files.length > 0) {
            let contentParts: any[] = [{ type: "text", text: lastMessage.content }];
            for (const file of files) {
                if (file.type === "image") {
                    contentParts.push({ type: "image_url", image_url: { url: file.url } });
                } else if (file.type === "file") {
                    if (model === "claude-large") {
                        contentParts.push({ type: "file", file: { file_data: file.data, file_name: file.name, mime_type: "application/pdf" } });
                    } else {
                        const transcription = await transcribePdfWithClaude(file.data, file.name, apiKey, chatDirPath);
                        contentParts.push({ type: "text", text: `\n\n[DOCUMENTO: ${file.name}]\n${transcription}\n[FIN]\n` });
                    }
                }
            }
            lastMessage.content = contentParts;
        }

        const finalPayload = [systemMessage, ...prunedMessages];

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

        if (chatId && chatDirPath) {
            const aiMsgToSave = { role: "assistant", content: assistantMessage.content, reasoning, id: Date.now().toString() };
            const chatData = { id: chatId, title: chatTitle, model, last_updated: new Date().toISOString(), messages: [...messages, aiMsgToSave] };
            fs.writeFileSync(path.join(chatDirPath, "chat.json"), JSON.stringify(chatData, null, 2));
        }

        return NextResponse.json({ content: assistantMessage.content, reasoning });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { chatId } = await req.json();
        const folders = fs.readdirSync(CHATS_DIR);
        const folderName = folders.find(f => f.includes(chatId));
        if (folderName) fs.rmSync(path.join(CHATS_DIR, folderName), { recursive: true, force: true });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Error deleting chat" }, { status: 500 });
    }
}
