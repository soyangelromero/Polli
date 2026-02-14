"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Sparkles, RotateCw, Upload, CreditCard, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

// Types & Constants
import { Message, Chat } from "../lib/types";
import { MODELS, TRANSLATIONS, TEXT_MODELS, IMAGE_MODELS, VIDEO_MODELS, AUDIO_MODELS } from "../lib/constants";

// Components
import { ChatSidebar } from "../components/ChatSidebar";
import { ChatWindow } from "../components/ChatWindow";
import { ChatInput } from "../components/ChatInput";
import { ModelSelector } from "../components/ModelSelector";
import { ApiKeyModal } from "../components/ApiKeyModal";

// Model category helpers (client-side)
const IMAGE_MODEL_IDS = IMAGE_MODELS.map(m => m.id);
const VIDEO_MODEL_IDS = VIDEO_MODELS.map(m => m.id);
const AUDIO_TTS_IDS = ["elevenlabs", "elevenmusic"];
const AUDIO_TRANSCRIPTION_IDS = ["scribe", "whisper"];

function getModelCategory(modelId: string): "text" | "image" | "video" | "audio-tts" | "audio-transcription" {
    if (IMAGE_MODEL_IDS.includes(modelId)) return "image";
    if (VIDEO_MODEL_IDS.includes(modelId)) return "video";
    if (AUDIO_TTS_IDS.includes(modelId)) return "audio-tts";
    if (AUDIO_TRANSCRIPTION_IDS.includes(modelId)) return "audio-transcription";
    return "text";
}

export default function ChatPage() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState("");
    const [balanceData, setBalanceData] = useState<{ balance: number; tier: string; dailyPollen: number } | null>(null);
    const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<{ file: File; type: string; preview?: string }[]>([]);
    const [showReasoning, setShowReasoning] = useState<Record<string, boolean>>({});
    const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const dragCounter = useRef(0);
    const [language, setLanguage] = useState<"en" | "es">("en");
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [userApiKey, setUserApiKey] = useState<string | null>(null);
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [tempKey, setTempKey] = useState("");
    const abortControllerRef = useRef<AbortController | null>(null);

    // Initial Config Load & Balance Check
    useEffect(() => {
        const savedKey = localStorage.getItem("pollinations_api_key");
        const savedLang = localStorage.getItem("app_language") as "en" | "es";

        if (savedKey) {
            setUserApiKey(savedKey);
        } else {
            setShowApiKeyModal(true);
        }

        if (savedLang) setLanguage(savedLang);

        const fetchBalance = async () => {
            if (!savedKey) return;
            try {
                const res = await fetch("/api/balance", {
                    headers: { "x-api-key": savedKey }
                });
                if (res.ok) {
                    const data = await res.json();
                    setBalanceData(data);
                } else {
                    console.error("Failed to load balance");
                }
            } catch (e) {
                console.error("Error fetching balance:", e);
            }
        };

        fetchBalance();

        // Load chats from LocalStorage
        const savedChats = localStorage.getItem("polli_chats");
        if (savedChats) {
            try {
                const parsed: Chat[] = JSON.parse(savedChats);
                const migrated = parsed.map(chat => ({
                    ...chat,
                    messages: chat.messages.map(m =>
                        (m.role === "assistant" && !m.modelId)
                            ? { ...m, modelId: chat.model }
                            : m
                    )
                }));
                setChats(migrated);
                if (migrated.length > 0) {
                    setCurrentChatId(migrated[0].id);
                }
            } catch (e) { console.error("Failed to parse chats", e); }
        }
    }, []);

    // Save chats to LocalStorage listener
    useEffect(() => {
        if (chats.length >= 0) {
            localStorage.setItem("polli_chats", JSON.stringify(chats));
        }
    }, [chats]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [currentChatId, chats, showReasoning]);

    const currentChat = useMemo(() => chats.find(c => c.id === currentChatId), [chats, currentChatId]);
    const messages = useMemo(() => currentChat?.messages || [], [currentChat]);
    const selectedModelId = currentChat?.model || "openai";
    const selectedModel = useMemo(() => MODELS.find(m => m.id === selectedModelId) || MODELS[0], [selectedModelId]);
    const t = useMemo(() => TRANSLATIONS[language], [language]);

    const createNewChat = useCallback(() => {
        const newChat: Chat = {
            id: Date.now().toString(),
            title: t.newChat,
            model: "openai",
            messages: [],
            createdAt: Date.now(),
        };
        setChats(prev => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
    }, [t.newChat]);

    const changeModel = useCallback((modelId: string) => {
        if (!currentChatId) {
            const newChat: Chat = {
                id: Date.now().toString(),
                title: "Nuevo Chat",
                model: modelId,
                messages: [],
                createdAt: Date.now(),
            };
            setChats(prev => [newChat, ...prev]);
            setCurrentChatId(newChat.id);
        } else {
            setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, model: modelId } : c));
        }
        setIsModelMenuOpen(false);
    }, [currentChatId]);

    const deleteChat = useCallback(async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(t.deleteConfirm)) return;

        setChats(prev => {
            const updated = prev.filter(c => c.id !== id);
            if (currentChatId === id) {
                setCurrentChatId(updated.length > 0 ? updated[0].id : null);
            }
            return updated;
        });
    }, [currentChatId, t.deleteConfirm]);

    const processFiles = useCallback((files: FileList | File[]) => {
        Array.from(files).forEach((file) => {
            if (file.size > 5 * 1024 * 1024) {
                alert(`File ${file.name} is too large. Max 5MB.`);
                return;
            }

            const type = file.type.startsWith("image/") ? "image" : file.type.startsWith("audio/") ? "audio" : "file";
            const reader = new FileReader();
            reader.onload = (prev) => {
                setAttachedFiles((prevFiles) => [
                    ...prevFiles,
                    { file, type, preview: type === "image" ? (prev.target?.result as string) : undefined },
                ]);
            };
            reader.readAsDataURL(file);
        });
    }, []);

    // Global drag handlers
    useEffect(() => {
        const handleGlobalDragOver = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const handleGlobalDragEnter = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter.current++;
            if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
                setIsDragging(true);
            }
        };

        const handleGlobalDragLeave = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter.current--;
            if (dragCounter.current <= 0) {
                dragCounter.current = 0;
                setIsDragging(false);
            }
        };

        const handleGlobalDrop = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            dragCounter.current = 0;
            if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                processFiles(e.dataTransfer.files);
            }
        };

        window.addEventListener("dragover", handleGlobalDragOver);
        window.addEventListener("dragenter", handleGlobalDragEnter);
        window.addEventListener("dragleave", handleGlobalDragLeave);
        window.addEventListener("drop", handleGlobalDrop);

        return () => {
            window.removeEventListener("dragover", handleGlobalDragOver);
            window.removeEventListener("dragenter", handleGlobalDragEnter);
            window.removeEventListener("dragleave", handleGlobalDragLeave);
            window.removeEventListener("drop", handleGlobalDrop);
        };
    }, [processFiles]);

    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) processFiles(e.target.files);
    }, [processFiles]);

    const removeFile = useCallback((index: number) => {
        setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const toggleReasoning = useCallback((msgId: string) => {
        setShowReasoning(prev => ({ ...prev, [msgId]: !prev[msgId] }));
    }, []);

    const handleStop = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    }, []);

    // ─── UNIFIED SEND HANDLER ───
    const handleSend = async (text: string) => {
        if (!text.trim() && attachedFiles.length === 0) return;

        let chatId = currentChatId;
        let updatedChats = [...chats];
        let chatModel = selectedModelId;

        if (!chatId) {
            const newChat: Chat = {
                id: Date.now().toString(),
                title: text.slice(0, 30) || "Nuevo Chat",
                model: chatModel,
                messages: [],
                createdAt: Date.now(),
            };
            updatedChats = [newChat, ...updatedChats];
            chatId = newChat.id;
            setChats(updatedChats);
            setCurrentChatId(chatId);
        }

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text,
            files: attachedFiles.map((f) => ({ name: f.file.name, type: f.type })),
        };

        const chatIndex = updatedChats.findIndex(c => c.id === chatId);
        if (chatIndex === -1) { console.error("Chat not found"); return; }

        if (updatedChats[chatIndex].messages.length === 0) {
            updatedChats[chatIndex].title = text.slice(0, 40) || "Nuevo Chat";
        }
        updatedChats[chatIndex].messages.push(userMsg);
        setChats([...updatedChats]);

        const userMsgTitle = updatedChats[chatIndex].title;
        const currentFiles = [...attachedFiles];
        setAttachedFiles([]);
        setIsLoading(true);

        const category = getModelCategory(chatModel);

        // Set loading status based on category
        if (category === "image") {
            setLoadingStatus(language === "es" ? "Generando imagen..." : "Generating image...");
        } else if (category === "video") {
            setLoadingStatus(language === "es" ? "Generando video... esto puede tardar" : "Generating video... this may take a moment");
        } else if (category === "audio-tts") {
            setLoadingStatus(language === "es" ? "Generando audio..." : "Generating audio...");
        } else if (category === "audio-transcription") {
            setLoadingStatus(language === "es" ? "Transcribiendo audio..." : "Transcribing audio...");
        } else if (chatModel !== "claude-large" && currentFiles.some(f => f.type === "file")) {
            setLoadingStatus(t.loadingPdf);
        } else {
            setLoadingStatus("");
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            // ─── NON-TEXT MODELS: Image, Video, Audio ───
            if (category !== "text") {
                let apiBody: any = { prompt: text, model: chatModel };

                // For audio transcription, include audio data from attached files
                if (category === "audio-transcription" && currentFiles.length > 0) {
                    const audioFile = currentFiles.find(f => f.file.type.startsWith("audio/"));
                    if (audioFile) {
                        const reader = new FileReader();
                        const audioData = await new Promise<string>((resolve) => {
                            reader.onload = () => resolve((reader.result as string).split(",")[1]);
                            reader.readAsDataURL(audioFile.file);
                        });
                        apiBody.audioData = audioData;
                        apiBody.audioFileName = audioFile.file.name;
                    }
                }

                const response = await fetch("/api/generate", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": userApiKey || ""
                    },
                    signal: controller.signal,
                    body: JSON.stringify(apiBody),
                });

                const data = await response.json();

                if (!response.ok) {
                    const rawError = data.error || "Error generating content";
                    const errorMsg = typeof rawError === "string" ? rawError : JSON.stringify(rawError);
                    const errorSystemMsg: Message = {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: `Error: ${errorMsg}`,
                        modelId: chatModel
                    };
                    const finalChats = [...updatedChats];
                    const finalChatIndex = finalChats.findIndex(c => c.id === chatId);
                    if (finalChatIndex !== -1) {
                        finalChats[finalChatIndex].messages.push(errorSystemMsg);
                        setChats(finalChats);
                    }
                } else {
                    const aiMsg: Message = {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: data.content || text,
                        modelId: chatModel,
                        mediaUrl: data.mediaUrl,
                        mediaType: data.mediaType,
                    };
                    const finalChats = [...updatedChats];
                    const finalChatIndex = finalChats.findIndex(c => c.id === chatId);
                    if (finalChatIndex !== -1) {
                        finalChats[finalChatIndex].messages.push(aiMsg);
                        setChats(finalChats);
                    }
                }
            }
            // ─── TEXT MODELS ───
            else {
                const preparedFiles = await Promise.all(
                    currentFiles.map(async (f) => {
                        if (f.type === "image" && f.preview) {
                            return { type: "image", name: f.file.name, url: f.preview };
                        } else {
                            return new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onload = () => resolve({
                                    type: "file",
                                    name: f.file.name,
                                    data: (reader.result as string).split(",")[1]
                                });
                                reader.readAsDataURL(f.file);
                            });
                        }
                    })
                );

                const response = await fetch("/api/chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": userApiKey || ""
                    },
                    signal: controller.signal,
                    body: JSON.stringify({
                        chatId: chatId,
                        chatTitle: userMsgTitle,
                        model: chatModel,
                        messages: updatedChats[chatIndex].messages.map(m => ({ role: m.role, content: m.content })),
                        files: preparedFiles
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    const rawError = data.error || data.info || "Error de conexión";
                    const errorMsg = typeof rawError === "string" ? rawError : JSON.stringify(rawError);
                    const errorSystemMsg: Message = {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: `Error: ${errorMsg}`,
                        modelId: chatModel
                    };
                    const finalChats = [...updatedChats];
                    const finalChatIndex = finalChats.findIndex(c => c.id === chatId);
                    if (finalChatIndex !== -1) {
                        finalChats[finalChatIndex].messages.push(errorSystemMsg);
                        setChats(finalChats);
                    }
                } else {
                    const aiMsg: Message = {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: data.content || "Lo siento, hubo un error.",
                        reasoning: data.reasoning || undefined,
                        modelId: chatModel
                    };

                    const finalChats = [...updatedChats];
                    const finalChatIndex = finalChats.findIndex(c => c.id === chatId);
                    if (finalChatIndex !== -1) {
                        finalChats[finalChatIndex].messages.push(aiMsg);
                        setChats(finalChats);
                    }
                }
            }

            // Refresh balance
            try {
                const balRes = await fetch("/api/balance", {
                    headers: { "x-api-key": userApiKey || "" }
                });
                if (balRes.ok) {
                    const balData = await balRes.json();
                    setBalanceData(balData);
                }
            } catch (e) {
                console.error("Error updating balance:", e);
            }
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request aborted");
            } else {
                console.error(error);
            }
        } finally {
            setIsLoading(false);
            setLoadingStatus("");
            if (abortControllerRef.current === controller) {
                abortControllerRef.current = null;
            }
        }
    };

    return (
        <div className="flex h-screen bg-claude-bg text-gray-900 dark:text-gray-100 font-sans p-0 m-0">
            {/* Drag Overlay */}
            <AnimatePresence>
                {isDragging && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-claude-accent/20 backdrop-blur-sm flex flex-col items-center justify-center border-4 border-dashed border-claude-accent pointer-events-none"
                    >
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-full shadow-2xl animate-bounce">
                            <Upload size={64} className="text-claude-accent" />
                        </div>
                        <h2 className="mt-8 text-3xl font-bold text-claude-accent dark:text-white drop-shadow-md">
                            {t.dropFiles}
                        </h2>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <ChatSidebar
                chats={chats}
                currentChatId={currentChatId}
                t={t}
                createNewChat={createNewChat}
                setCurrentChatId={setCurrentChatId}
                deleteChat={deleteChat}
                language={language}
                setLanguage={useCallback((lang) => {
                    setLanguage(lang);
                    localStorage.setItem("app_language", lang);
                }, [])}
                onLogout={useCallback(() => {
                    if (confirm(t.logoutConfirm)) {
                        localStorage.removeItem("pollinations_api_key");
                        window.location.reload();
                    }
                }, [t.logoutConfirm])}
            />

            {/* Main Chat */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-claude-bg">
                {/* Header */}
                <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-white/[0.04] bg-claude-bg/80 backdrop-blur-xl z-20 shrink-0">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        <span className="font-semibold text-claude-accent tracking-tight text-base cursor-default hidden xs:block">POLLI</span>
                        <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-700 hidden xs:block"></div>
                        <h1 className="font-semibold text-xs md:text-sm truncate max-w-[100px] md:max-w-md text-gray-600 dark:text-gray-300 mr-2">
                            {currentChat?.title || (language === 'en' ? "New Session" : "Nueva Sesión")}
                        </h1>

                        <ModelSelector
                            selectedModel={selectedModel}
                            selectedModelId={selectedModelId}
                            isModelMenuOpen={isModelMenuOpen}
                            setIsModelMenuOpen={setIsModelMenuOpen}
                            changeModel={changeModel}
                            t={t}
                            language={language}
                        />
                    </div>

                    {/* Pollen Balance Display */}
                    <div className="flex items-center gap-2 md:gap-3 pr-1 md:pr-2">
                        {/* Daily Limit (Pollen) */}
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">{t.dailyLimit}</span>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                                <Calendar size={10} className="text-emerald-500" />
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                    {balanceData?.dailyPollen !== undefined ? balanceData.dailyPollen : "---"}
                                </span>
                            </div>
                        </div>

                        {/* Credits Balance (Total) */}
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">{t.credits}</span>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 shadow-sm group/balance transition-all hover:bg-orange-100 dark:hover:bg-orange-500/20">
                                <span className="text-[11px] md:text-xs font-black text-orange-600 dark:text-orange-400">
                                    {balanceData ? (balanceData.credits || balanceData.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "---"}
                                </span>
                                <Sparkles size={11} className="text-orange-500 animate-pulse hidden xs:block" />
                            </div>
                        </div>

                        <button
                            onClick={async () => {
                                setIsRefreshingBalance(true);
                                try {
                                    const res = await fetch("/api/balance", {
                                        headers: { "x-api-key": userApiKey || "" }
                                    });
                                    if (res.ok) {
                                        const data = await res.json();
                                        setBalanceData(data);
                                    }
                                } finally {
                                    setIsRefreshingBalance(false);
                                }
                            }}
                            className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-orange-500 transition-all active:scale-95 duration-200"
                            title={t.updateBalance}
                        >
                            <RotateCw size={14} className={isRefreshingBalance ? "animate-spin text-orange-500" : ""} />
                        </button>
                    </div>
                </header>

                <div ref={scrollRef} className="flex-1 overflow-y-auto pt-8 pb-40 scroll-smooth">
                    <ChatWindow
                        messages={messages}
                        currentChat={currentChat}
                        selectedModel={selectedModel}
                        t={t}
                        isLoading={isLoading}
                        loadingStatus={loadingStatus}
                        showReasoning={showReasoning}
                        toggleReasoning={toggleReasoning}
                        language={language}
                    />
                </div>

                <ChatInput
                    onSend={handleSend}
                    handleStop={handleStop}
                    isLoading={isLoading}
                    attachedFiles={attachedFiles}
                    removeFile={removeFile}
                    fileInputRef={fileInputRef}
                    handleFileUpload={handleFileUpload}
                    t={t}
                    selectedModel={selectedModel}
                    isDragging={isDragging}
                />
            </main>

            <ApiKeyModal
                show={showApiKeyModal}
                t={t}
                tempKey={tempKey}
                setTempKey={setTempKey}
                onSave={(key) => {
                    localStorage.setItem("pollinations_api_key", key);
                    setUserApiKey(key);
                    setShowApiKeyModal(false);
                }}
                onClose={() => setShowApiKeyModal(false)}
            />
        </div>
    );
}
