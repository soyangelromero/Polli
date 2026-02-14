"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
    Terminal,
    ArrowLeft,
    Code2,
    Sparkles,
    Monitor,
    Save,
    Copy,
    Maximize2,
    RefreshCcw,
    Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Shared Types & Components (Reusing logic where possible)
import { Chat, Message } from "../../lib/types";
import { MODELS, TRANSLATIONS, TEXT_MODELS } from "../../lib/constants";
import { ChatInput } from "../../components/ChatInput";
import { ApiKeyModal } from "../../components/ApiKeyModal";

import { VibeEditor } from "../../components/VibeEditor";

export default function VibePage() {
    const [isMounted, setIsMounted] = useState(false);
    const [userApiKey, setUserApiKey] = useState<string | null>(null);
    const [chats, setChats] = useState<Chat[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeCode, setActiveCode] = useState("");
    const [activeLang, setActiveLang] = useState("");

    const [language, setLanguage] = useState<'en' | 'es'>('es');
    const [balanceData, setBalanceData] = useState<{ balance: number; tier: string; dailyPollen: number; credits?: number } | null>(null);
    const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial language load
    useEffect(() => {
        const savedLang = localStorage.getItem("preferred_language") as 'en' | 'es';
        if (savedLang) setLanguage(savedLang);
    }, []);

    const t = useMemo(() => TRANSLATIONS[language], [language]);

    // Model Selection logic
    const coderModels = useMemo(() => MODELS.filter(m =>
        m.id.includes("coder") ||
        m.id.includes("deepseek") ||
        m.id.includes("claude-large") ||
        m.id.includes("gemini-large") ||
        m.id === "gemini-thinking"
    ), []);

    const [selectedModelId, setSelectedModelId] = useState("qwen-coder");
    const selectedModel = useMemo(() => MODELS.find(m => m.id === selectedModelId) || MODELS[0], [selectedModelId]);
    const currentChat = useMemo(() => chats.find(c => c.id === currentChatId), [chats, currentChatId]);
    const messages = useMemo(() => currentChat?.messages || [], [currentChat]);

    const abortControllerRef = useRef<AbortController | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchBalance = useCallback(async () => {
        if (!userApiKey) return;
        setIsRefreshingBalance(true);
        try {
            const res = await fetch("/api/balance", {
                headers: { "x-api-key": userApiKey }
            });
            if (res.ok) {
                const data = await res.json();
                setBalanceData(data);
            }
        } catch (e) {
            console.error("Error fetching balance:", e);
        } finally {
            setIsRefreshingBalance(false);
        }
    }, [userApiKey]);

    // Save chats to localStorage on change
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem("polli_chats", JSON.stringify(chats));
        }
    }, [chats, isMounted]);

    // Handle session sync and initial load
    useEffect(() => {
        const savedKey = localStorage.getItem("pollinations_api_key");
        const savedChats = localStorage.getItem("polli_chats");

        if (savedKey) {
            setUserApiKey(savedKey);
        }
        if (savedChats) {
            try {
                const parsed = JSON.parse(savedChats);
                setChats(parsed);
                const vibeSession = parsed.find((c: any) => c.title === "Vibe Session");
                if (vibeSession) {
                    setCurrentChatId(vibeSession.id);
                } else if (parsed.length > 0) {
                    setCurrentChatId(parsed[0].id);
                }
            } catch (e) { console.error(e); }
        } else {
            const newId = Date.now().toString();
            setChats([{
                id: newId,
                title: "Vibe Session",
                model: "qwen-coder",
                messages: [],
                createdAt: Date.now()
            }]);
            setCurrentChatId(newId);
        }

        setIsMounted(true);
    }, []);

    // Fetch balance once API key is ready
    useEffect(() => {
        if (userApiKey && isMounted) {
            fetchBalance();
        }
    }, [userApiKey, isMounted, fetchBalance]);

    // Extract code from messages
    useEffect(() => {
        const lastAssistantMsg = [...messages].reverse().find(m => m.role === "assistant");
        if (lastAssistantMsg && typeof lastAssistantMsg.content === "string") {
            const codeBlocks = lastAssistantMsg.content.match(/```(\w+)?\n([\s\S]*?)```/g);
            if (codeBlocks) {
                const lastBlock = codeBlocks[codeBlocks.length - 1];
                const match = lastBlock.match(/```(\w+)?\n([\s\S]*?)```/);
                if (match) {
                    setActiveLang(match[1] || "code");
                    setActiveCode(match[2]);
                }
            }
        }
    }, [messages]);

    const handleSend = useCallback(async (text: string) => {
        if (!text.trim()) return;
        if (!userApiKey) return;

        let chatId = currentChatId;
        let updatedChats = [...chats];
        let chatModel = selectedModelId;

        if (!chatId) {
            const newChat: Chat = {
                id: Date.now().toString(),
                title: "Vibe Session",
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
        };

        const chatIndex = updatedChats.findIndex(c => c.id === chatId);
        if (chatIndex === -1) return;

        updatedChats[chatIndex].messages.push(userMsg);
        setChats([...updatedChats]);
        setIsLoading(true);

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const systemPrompt = "You are VibeHub-Coder, a world-class senior software engineer. " +
                "You provide extremely high-quality code. Always wrap code in triple backticks with the language identifier. " +
                "Focus on clean, secure, and performant solutions. Use modern standards.";

            const requestBody = {
                chatId: chatId,
                model: chatModel,
                messages: [
                    { role: "system", content: systemPrompt },
                    ...updatedChats[chatIndex].messages.map(m => ({ role: m.role, content: m.content }))
                ],
                files: []
            };

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": userApiKey || ""
                },
                signal: controller.signal,
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) throw new Error("API Error");

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let aiContent = "";

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "",
                modelId: chatModel
            };

            setChats(prev => {
                const newChats = [...prev];
                const idx = newChats.findIndex(c => c.id === chatId);
                if (idx !== -1) newChats[idx].messages.push(aiMsg);
                return newChats;
            });

            while (true) {
                const { done, value } = await reader!.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const data = line.slice(6);
                        if (data === "[DONE]") break;
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0]?.delta?.content || "";
                            aiContent += content;

                            setChats(prev => {
                                const newChats = [...prev];
                                const currentChatIdx = newChats.findIndex(c => c.id === chatId);
                                if (currentChatIdx !== -1) {
                                    const msgIdx = newChats[currentChatIdx].messages.findIndex(m => m.id === aiMsg.id);
                                    if (msgIdx !== -1) {
                                        newChats[currentChatIdx].messages[msgIdx].content = aiContent;
                                    }
                                }
                                return newChats;
                            });
                        } catch (e) { }
                    }
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    }, [chats, currentChatId, selectedModelId, userApiKey]);

    if (!isMounted) return null;

    return (
        <div className="flex h-screen bg-[#0a0a0b] text-white overflow-hidden selection:bg-claude-accent/30 font-sans">
            {/* Top Navigation */}
            <header className="fixed top-0 inset-x-0 h-16 bg-[#0a0a0b]/80 backdrop-blur-2xl border-b border-white/[0.04] z-50 px-6 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-6">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-all group px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 active:scale-95"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] pt-0.5">{language === 'en' ? 'Back' : 'Volver'}</span>
                    </Link>
                    <div className="h-6 w-[1px] bg-white/10" />
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-claude-accent to-purple-600 flex items-center justify-center shadow-lg shadow-claude-accent/20">
                            <Terminal size={20} className="text-white fill-white/20" />
                        </div>
                        <h1 className="text-xl font-black tracking-tight uppercase flex items-center gap-2">
                            {t.vibeHub} <span className="text-[9px] bg-claude-accent/20 text-claude-accent px-2 py-0.5 rounded-full border border-claude-accent/30 tracking-widest font-black uppercase">V1.1</span>
                        </h1>
                    </div>
                </div>

                {/* Center: Improved Model Selection */}
                <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
                    {coderModels.map(m => (
                        <button
                            key={m.id}
                            onClick={() => setSelectedModelId(m.id)}
                            className={`relative px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${selectedModelId === m.id ? 'bg-claude-accent text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <span>{m.name.split(' ')[0]}</span>
                            {m.paidOnly && (
                                <span className={`px-1 rounded-[4px] text-[7px] font-black border ${selectedModelId === m.id ? 'bg-white/20 border-white/20 text-white' : 'bg-orange-500/20 border-orange-500/30 text-orange-500'}`}>
                                    {t.paidTag}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-6">
                    {/* Balance Display */}
                    <div className="flex items-center gap-3">
                        {/* Pollens */}
                        <div className="flex flex-col items-end">
                            <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">{t.pollenBalance}</span>
                            <span className="text-xs font-black text-orange-500">
                                {balanceData ? balanceData.balance.toLocaleString() : "---"}
                            </span>
                        </div>
                        {/* Credits */}
                        {balanceData?.credits !== undefined && balanceData.credits > 0 && (
                            <div className="flex flex-col items-end border-l border-white/10 pl-3">
                                <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">{t.credits}</span>
                                <span className="text-xs font-black text-blue-400">
                                    {balanceData.credits.toLocaleString()}
                                </span>
                            </div>
                        )}
                        <button
                            onClick={() => fetchBalance()}
                            disabled={isRefreshingBalance}
                            className={`p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-all ${isRefreshingBalance ? 'animate-spin opacity-50' : ''}`}
                            title={t.updateBalance}
                        >
                            <RefreshCcw size={14} />
                        </button>
                    </div>

                    <div className="h-6 w-[1px] bg-white/10" />

                    {/* Language Switcher */}
                    <button
                        onClick={() => {
                            const newLang = language === 'en' ? 'es' : 'en';
                            setLanguage(newLang);
                            localStorage.setItem("preferred_language", newLang);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                    >
                        {language === 'en' ? 'ES' : 'EN'}
                    </button>

                    <div className="h-6 w-[1px] bg-white/10" />

                    <button
                        onClick={() => {
                            if (confirm(t.deleteConfirm)) {
                                const clearedChats = chats.filter(c => c.id !== currentChatId);
                                setChats(clearedChats);
                                setCurrentChatId(clearedChats.length > 0 ? clearedChats[0].id : null);
                                setActiveCode("");
                                setActiveLang("");
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all text-[10px] font-black uppercase tracking-widest border border-red-500/10 active:scale-95"
                    >
                        <Trash2 size={14} />
                        {language === 'en' ? 'Clear' : 'Limpiar'}
                    </button>
                </div>
            </header>

            {/* Main Split Layout */}
            <main className="flex-1 mt-16 flex p-6 gap-6 relative overflow-hidden">
                {/* Left Side: Vibe Chat History (Compact) */}
                <div className="w-[480px] flex flex-col bg-white/[0.02] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative">
                    <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#0a0a0b] to-transparent z-10 pointer-events-none" />

                    <div className="flex-1 overflow-y-auto px-8 py-10 custom-scrollbar space-y-8 scroll-smooth" ref={scrollRef}>
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-700">
                                <div className="w-20 h-20 rounded-full bg-claude-accent/10 flex items-center justify-center mb-8 relative">
                                    <Sparkles className="text-claude-accent absolute animate-ping opacity-20" size={60} />
                                    <Code2 className="text-claude-accent" size={40} />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter mb-3">{t.vibeHub}</h3>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-[280px]">
                                    {t.vibeHubDesc}
                                </p>
                                <div className="mt-10 flex flex-wrap justify-center gap-2">
                                    {(language === 'en' ? ["Fast Refactor", "New UI Component", "API Integration"] : ["Refactor Rápido", "Nuevo Componente UI", "Integración API"]).map(hint => (
                                        <button
                                            key={hint}
                                            onClick={() => handleSend(hint)}
                                            className="px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:border-white/10 transition-all"
                                        >
                                            {hint}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((m, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={i}
                                    className={`flex flex-col gap-3 ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    <div className={`flex items-center gap-2 px-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${m.role === 'user' ? 'bg-claude-accent text-white' : 'bg-white/10 text-gray-400'}`}>
                                            {m.role === 'user' ? 'U' : 'AI'}
                                        </div>
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                            {m.role === 'user' ? (language === 'en' ? 'You' : 'Tú') : selectedModel.name}
                                        </span>
                                    </div>
                                    <div className={`p-5 rounded-[2rem] text-[14px] font-medium leading-[1.6] max-w-[95%] shadow-sm ${m.role === 'user' ? 'bg-claude-accent text-white rounded-tr-none' : 'bg-white/5 text-gray-300 border border-white/5 rounded-tl-none'}`}>
                                        {typeof m.content === 'string' ? (
                                            m.content.includes("```")
                                                ? m.content.split("```")[0] + `... [${language === 'en' ? 'Code in Canvas' : 'Código en Canvas'}]`
                                                : m.content
                                        ) : '...'}
                                    </div>
                                </motion.div>
                            ))
                        )}
                        {isLoading && (
                            <div className="flex gap-3 items-center text-[10px] font-black text-claude-accent uppercase tracking-widest animate-pulse px-2">
                                <RefreshCcw size={12} className="animate-spin" />
                                {t.generating}
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-[#0a0a0b]/80 backdrop-blur-md border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
                        <ChatInput
                            onSend={handleSend}
                            handleStop={() => abortControllerRef.current?.abort()}
                            isLoading={isLoading}
                            attachedFiles={[]}
                            removeFile={() => { }}
                            fileInputRef={fileInputRef}
                            handleFileUpload={() => { }}
                            t={t}
                            selectedModel={selectedModel}
                            isDragging={false}
                        />
                    </div>
                </div>

                {/* Right Side: Visual Canvas (Editor) */}
                <div className="flex-1 flex flex-col h-full animate-in slide-in-from-right-10 duration-1000">
                    <VibeEditor content={activeCode} language={activeLang} />
                </div>
            </main>

            {/* API Key Check */}
            <ApiKeyModal
                show={!userApiKey}
                t={t}
                tempKey=""
                setTempKey={() => { }}
                onSave={(key) => {
                    localStorage.setItem("pollinations_api_key", key);
                    setUserApiKey(key);
                }}
                onClose={() => { }}
            />
        </div>
    );
}
