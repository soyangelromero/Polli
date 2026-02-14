import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import { User, Brain, ChevronUp, ChevronDown, ImageIcon, FileText, Download, Play, Plus } from "lucide-react";
import dynamic from "next/dynamic";
import remarkGfm from "remark-gfm";

import { Chat, Message } from "../lib/types";
import { MODELS, type ModelDef } from "../lib/constants";

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });
const CodeBlock = dynamic(() => import("./CodeBlock").then(mod => mod.CodeBlock), {
    ssr: false,
    loading: () => <div className="h-20 w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg my-4" />
});

interface ChatWindowProps {
    messages: Message[];
    currentChat: Chat | undefined;
    selectedModel: ModelDef;
    t: any;
    isLoading: boolean;
    loadingStatus: string;
    showReasoning: Record<string, boolean>;
    toggleReasoning: (msgId: string) => void;
    language: "en" | "es";
}

function MediaContent({ message, t }: { message: Message; t: any }) {
    if (!message.mediaUrl) return null;

    if (message.mediaType === "image") {
        return (
            <div className="mt-2 relative group/media rounded-2xl overflow-hidden inline-block max-w-full">
                <img
                    src={message.mediaUrl}
                    alt={message.content?.toString() || "Generated image"}
                    className="max-w-full max-h-[512px] rounded-2xl shadow-lg border border-black/5 dark:border-white/10"
                />
                <a
                    href={message.mediaUrl}
                    download="generated-image.png"
                    className="absolute top-3 right-3 p-2 rounded-xl bg-black/50 text-white opacity-0 group-hover/media:opacity-100 transition-opacity duration-200 hover:bg-black/70"
                    title={t.downloadMedia}
                >
                    <Download size={16} />
                </a>
            </div>
        );
    }

    if (message.mediaType === "video") {
        return (
            <div className="mt-2 relative group/media rounded-2xl overflow-hidden inline-block max-w-full">
                <video
                    src={message.mediaUrl}
                    controls
                    className="max-w-full max-h-[512px] rounded-2xl shadow-lg border border-black/5 dark:border-white/10"
                />
                <a
                    href={message.mediaUrl}
                    download="generated-video.mp4"
                    className="absolute top-3 right-3 p-2 rounded-xl bg-black/50 text-white opacity-0 group-hover/media:opacity-100 transition-opacity duration-200 hover:bg-black/70"
                    title={t.downloadMedia}
                >
                    <Download size={16} />
                </a>
            </div>
        );
    }

    if (message.mediaType === "audio") {
        return (
            <div className="mt-3 flex flex-col gap-2">
                <audio
                    src={message.mediaUrl}
                    controls
                    className="w-full max-w-md rounded-xl"
                />
                <a
                    href={message.mediaUrl}
                    download="generated-audio.mp3"
                    className="inline-flex items-center gap-1.5 text-xs text-claude-accent hover:underline font-bold w-fit"
                >
                    <Download size={12} />
                    {t.downloadMedia}
                </a>
            </div>
        );
    }

    return null;
}

export const ChatWindow = React.memo(function ChatWindow({
    messages,
    currentChat,
    selectedModel,
    t,
    isLoading,
    loadingStatus,
    showReasoning,
    toggleReasoning,
    language
}: ChatWindowProps) {

    if (!currentChat || messages.length === 0) {
        const categoryLabel: Record<string, { en: string; es: string }> = {
            text: { en: "Querying", es: "Consultando" },
            image: { en: "Creating with", es: "Creando con" },
            video: { en: "Generating with", es: "Generando con" },
            audio: { en: "Using", es: "Usando" },
        };
        const label = categoryLabel[selectedModel.category] || categoryLabel.text;

        return (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-6 animate-in fade-in zoom-in-95 duration-500 py-10">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-6 md:mb-8 shadow-xl border border-gray-100 dark:border-gray-700">
                    <selectedModel.icon size={28} className={`${selectedModel.color} md:size-[34px]`} />
                </div>
                <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-3 text-gray-800 dark:text-gray-100">
                    {language === 'en' ? `${label.en} ${selectedModel.name}` : `${label.es} ${selectedModel.name}`}
                </h2>
                <p className="text-gray-500 text-sm md:text-lg max-w-md">{t.dropInstruction}</p>

                {/* Category hint */}
                {selectedModel.category !== "text" && (
                    <p className="mt-3 text-xs text-gray-400 italic">
                        {language === "en"
                            ? `This model generates ${selectedModel.category}. Enter a prompt to get started.`
                            : `Este modelo genera ${selectedModel.category === "image" ? "imágenes" : selectedModel.category === "video" ? "videos" : "audio"}. Ingresa un prompt para comenzar.`
                        }
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-8 px-4 md:px-8 py-10">
            {messages.map((m, index) => (
                <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    key={m.id || `msg-${index}`}
                    className={`flex w-full gap-3 md:gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                    {/* Avatar */}
                    <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm border dark:border-white/10 ${m.role === "user" ? "bg-claude-accent text-white" : "bg-white dark:bg-gray-800"}`}>
                        {m.role === "user" ? (
                            <User size={18} />
                        ) : (
                            (() => {
                                const msgModel = MODELS.find(mod => mod.id === m.modelId) || selectedModel;
                                return <msgModel.icon size={18} className={msgModel.color} />;
                            })()
                        )}
                    </div>

                    <div className={`flex-1 min-w-0 flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                        <div
                            id={`msg-${m.id}`}
                            className={`relative group/msg transition-all duration-300 w-full ${m.role === "user"
                                ? "bg-gray-100 dark:bg-white/10 p-3.5 md:p-4 rounded-[22px] rounded-tr-none text-gray-800 dark:text-gray-100 max-w-[85%]"
                                : "bg-transparent p-0 md:pt-1 text-gray-800 dark:text-gray-200 max-w-none"
                                }`}
                        >
                            {/* Reasoning */}
                            {m.role === "assistant" && m.reasoning && (
                                <div className="mb-3">
                                    <button
                                        onClick={() => toggleReasoning(m.id)}
                                        className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-claude-accent transition-colors mb-2 group"
                                    >
                                        <Brain size={14} className="group-hover:rotate-12 transition-transform" />
                                        <span>{showReasoning[m.id] ? t.hideReasoning : t.seeReasoning}</span>
                                        {showReasoning[m.id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                    </button>
                                    <AnimatePresence>
                                        {showReasoning[m.id] && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl text-sm text-gray-500 dark:text-gray-400 italic font-medium">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.reasoning}</ReactMarkdown>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Media content (images, video, audio) */}
                            <MediaContent message={m} t={t} />

                            {/* Text content */}
                            {(typeof m.content === "string" && m.content && !m.mediaUrl) || (typeof m.content === "string" && m.content && m.role === "user") ? (
                                <div className="markdown-content prose dark:prose-invert max-w-none break-words leading-relaxed text-[15px] md:text-[16px] text-left w-full">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            code({ inline, className, children, ...props }: any) {
                                                const match = /language-(\w+)/.exec(className || "");
                                                return !inline && match ? (
                                                    <CodeBlock
                                                        language={match[1]}
                                                        value={String(children).replace(/\n$/, "")}
                                                        {...props}
                                                    />
                                                ) : (
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            }
                                        }}
                                    >
                                        {typeof m.content === "string"
                                            ? m.content
                                            : (Array.isArray(m.content) as any)
                                                ? (m.content as any[]).find((part: any) => part.type === "text")?.text || ""
                                                : ""}
                                    </ReactMarkdown>
                                </div>
                            ) : null}

                            {/* Transcription text after media */}
                            {m.mediaType === "transcription" && m.content && (
                                <div className="markdown-content prose dark:prose-invert max-w-none break-words leading-relaxed text-[15px] md:text-[16px] text-left w-full">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {typeof m.content === "string" ? m.content : ""}
                                    </ReactMarkdown>
                                </div>
                            )}

                            {/* File attachments */}
                            {m.files && m.files.length > 0 && (
                                <div className={`flex flex-wrap gap-2 mt-4 pt-4 border-t border-black/5 dark:border-white/5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                    {m.files.map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[11px] font-bold text-gray-500 dark:text-gray-400 group/file shadow-sm max-w-[180px]">
                                            {f.type === "image" ? <ImageIcon size={14} className="text-claude-accent" /> : <FileText size={14} className="text-blue-500" />}
                                            <span className="truncate">{f.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}
            {isLoading && (
                <div className="flex w-full gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 shrink-0 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-claude-accent/30 border-t-claude-accent rounded-full animate-spin" />
                    </div>
                    <div className="flex-1 max-w-sm mt-3 space-y-3">
                        {loadingStatus && (
                            <p className="text-xs text-gray-400 font-medium animate-pulse">{loadingStatus}</p>
                        )}
                        <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full w-1/3 animate-pulse" />
                        <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full w-full animate-pulse delay-75" />
                        <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full w-4/5 animate-pulse delay-150" />
                    </div>
                </div>
            )}
        </div>
    );
});
