"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Plus, Image as ImageIcon, FileText, User, Bot, Trash2, Paperclip, MessageSquare, ChevronDown, ChevronUp, Brain, Sparkles, Cpu, Upload, Square, RotateCw, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { CodeBlock } from "../components/CodeBlock";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string | any[];
    reasoning?: string;
    files?: { name: string; type: string; url?: string }[];
};

type Chat = {
    id: string;
    title: string;
    model: string;
    messages: Message[];
    createdAt: number;
    last_updated?: string;
};

const MODELS = [
    { id: "claude-large", name: "Claude Opus 4.5", icon: Bot, color: "text-claude-accent", desc: "Advanced reasoning & vision" },
    { id: "deepseek", name: "DeepSeek V3.2", icon: Cpu, color: "text-blue-500", desc: "Powerful code and logic" },
    { id: "openai-large", name: "GPT-5.2", icon: Sparkles, color: "text-green-500", desc: "Versatile and creative" },
];

const TRANSLATIONS = {
    en: {
        newChat: "New Session",
        searchHistory: "Search index...",
        conversations: "Stored Sessions",
        noChats: "No active sessions",
        changeModel: "Select Model",
        pollenBalance: "API Credits",
        updateBalance: "Sync balance",
        dropFiles: "Upload source for analysis",
        helloMessage: "Querying",
        dropInstruction: "Upload documents or enter technical queries below.",
        placeholder: "Enter instruction for {model}...",
        stopGeneration: "Abort generation",
        loadingPdf: "Extracting structural data from PDF... Please wait.",
        deleteConfirm: "Confirm session deletion?",
        logoutConfirm: "Close session and reset API credentials?",
        logoutBtn: "Reset Session",
        configTitle: "System Authentication",
        configDesc: "Provide a Pollinations API Key to initialize a secure analytical session. Required: `claude-large` (Opus), `deepseek` (V3), and `openai-large` (ChatGPT).",
        configPlaceholder: "API Key (sk_...)",
        configBtn: "Initialize",
        getApiKey: "Credential Management",
        errorApiKey: "Invalid API Key format.",
        language: "Locale",
        spanish: "ES",
        english: "EN",
        initialGreeting: "System ready. Awaiting document input for structural analysis.",
        seeReasoning: "Show logic",
        hideReasoning: "Hide logic"
    },
    es: {
        newChat: "Nueva Sesión",
        searchHistory: "Buscar en el índice...",
        conversations: "Sesiones Guardadas",
        noChats: "Sin sesiones activas",
        changeModel: "Seleccionar Modelo",
        pollenBalance: "Créditos API",
        updateBalance: "Sincronizar saldo",
        dropFiles: "Subir archivo para análisis",
        helloMessage: "Consultando",
        dropInstruction: "Sube documentos o ingresa consultas técnicas abajo.",
        placeholder: "Instrucción para {model}...",
        stopGeneration: "Abortar generación",
        loadingPdf: "Extrayendo datos estructurales del PDF... Por favor espere.",
        deleteConfirm: "¿Confirmar eliminación de sesión?",
        logoutConfirm: "¿Cerrar sesión y reiniciar credenciales?",
        logoutBtn: "Reiniciar Sesión",
        configTitle: "Autenticación del Sistema",
        configDesc: "Ingrese su API Key de Pollinations para iniciar la sesión segura. Requerido: `claude-large` (Opus), `deepseek` (V3) e `openai-large` (ChatGPT).",
        configPlaceholder: "API Key (sk_...)",
        configBtn: "Inicializar",
        getApiKey: "Gestión de Credenciales",
        errorApiKey: "Formato de clave inválido.",
        language: "Localización",
        spanish: "ES",
        english: "EN",
        initialGreeting: "Sistema listo. Esperando documentos para análisis estructural.",
        seeReasoning: "Ver lógica",
        hideReasoning: "Ocultar lógica"
    }
};

export default function ChatPage() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [pollenBalance, setPollenBalance] = useState<number | null>(null);
    const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<{ file: File; type: string; preview?: string }[]>([]);
    const [showReasoning, setShowReasoning] = useState<Record<string, boolean>>({});
    const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
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
                    setPollenBalance(data.balance);
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
                const parsed = JSON.parse(savedChats);
                setChats(parsed);
                if (parsed.length > 0) {
                    setCurrentChatId(parsed[0].id);
                }
            } catch (e) { console.error("Failed to parse chats", e); }
        }
    }, []);

    // Save chats to LocalStorage listener
    useEffect(() => {
        if (chats.length >= 0) { // Always save, even if empty
            localStorage.setItem("polli_chats", JSON.stringify(chats));
        }
    }, [chats]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [currentChatId, chats]);

    const currentChat = chats.find(c => c.id === currentChatId);
    const messages = currentChat?.messages || [];
    const selectedModelId = currentChat?.model || "claude-large";
    const selectedModel = MODELS.find(m => m.id === selectedModelId) || MODELS[0];
    const t = TRANSLATIONS[language];

    const createNewChat = () => {
        const newChat: Chat = {
            id: Date.now().toString(),
            title: t.newChat,
            model: "claude-large",
            messages: [],
            createdAt: Date.now(),
        };
        setChats(prev => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
    };

    const changeModel = (modelId: string) => {
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
    };

    const deleteChat = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(t.deleteConfirm)) return;

        const updated = chats.filter(c => c.id !== id);
        setChats(updated);
        if (currentChatId === id) {
            setCurrentChatId(updated.length > 0 ? updated[0].id : null);
        }
        // LocalStorage update handled by useEffect
    };

    const processFiles = (files: FileList | File[]) => {
        Array.from(files).forEach((file) => {
            const type = file.type.startsWith("image/") ? "image" : "file";
            const reader = new FileReader();
            reader.onload = (prev) => {
                setAttachedFiles((prevFiles) => [
                    ...prevFiles,
                    { file, type, preview: type === "image" ? (prev.target?.result as string) : undefined },
                ]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) processFiles(e.target.files);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const removeFile = (index: number) => {
        setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const toggleReasoning = (msgId: string) => {
        setShowReasoning(prev => ({ ...prev, [msgId]: !prev[msgId] }));
    };

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    const handleSend = async () => {
        if (!input.trim() && attachedFiles.length === 0) return;

        let chatId = currentChatId;
        let updatedChats = [...chats];
        let chatModel = selectedModelId;

        if (!chatId) {
            const newChat: Chat = {
                id: Date.now().toString(),
                title: input.slice(0, 30) || "Nuevo Chat",
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
            content: input,
            files: attachedFiles.map((f) => ({ name: f.file.name, type: f.type })),
        };

        const chatIndex = updatedChats.findIndex(c => c.id === chatId);
        if (chatIndex === -1) {
            console.error("Chat not found");
            return;
        }

        if (updatedChats[chatIndex].messages.length === 0) {
            updatedChats[chatIndex].title = input.slice(0, 40) || "Nuevo Chat";
        }
        updatedChats[chatIndex].messages.push(userMsg);
        setChats([...updatedChats]);

        const userMsgTitle = updatedChats[chatIndex].title;
        setInput("");
        const currentFiles = [...attachedFiles];
        setAttachedFiles([]);
        setIsLoading(true);

        // Set specific loading status if transcribing PDF for non-Claude models
        if (selectedModelId !== "claude-large" && currentFiles.some(f => f.type === "file")) {
            setLoadingStatus(t.loadingPdf);
        } else {
            setLoadingStatus("");
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
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

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.content || "Lo siento, hubo un error.",
                reasoning: data.reasoning || undefined
            };

            const finalChats = [...updatedChats];
            const finalChatIndex = finalChats.findIndex(c => c.id === chatId);
            if (finalChatIndex !== -1) {
                finalChats[finalChatIndex].messages.push(aiMsg);
                setChats(finalChats);
            }

            setIsLoading(false);

            // Update balance after a message (optional non-blocking)
            try {
                const balRes = await fetch("/api/balance", {
                    headers: { "x-api-key": userApiKey || "" }
                });
                if (balRes.ok) {
                    const balData = await balRes.json();
                    setPollenBalance(balData.balance);
                }
            } catch (e) {
                console.error("Error updated balance:", e);
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
        <div
            className="flex h-screen bg-claude-bg text-gray-900 dark:text-gray-100 font-sans p-0 m-0"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
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
            <div className="w-72 bg-claude-sidebar hidden md:flex flex-col border-r dark:border-gray-800 transition-all z-30">
                <div className="p-4">
                    <button
                        onClick={createNewChat}
                        className="w-full h-12 flex items-center justify-start gap-3 px-4 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-white/50 dark:hover:bg-white/5 transition-all font-medium text-gray-700 dark:text-gray-200"
                    >
                        <Plus size={20} className="text-claude-accent" />
                        <span>{t.newChat}</span>
                    </button>
                    <div className="mt-4 relative">
                        <input
                            type="text"
                            placeholder={t.searchHistory}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-10 pl-9 pr-4 rounded-xl bg-gray-200/50 dark:bg-gray-800/50 border-none text-xs font-medium focus:ring-1 focus:ring-claude-accent/30 transition-all outline-none"
                        />
                        <MessageSquare size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                    <div className="text-[11px] font-bold text-gray-400 px-3 py-2 uppercase tracking-[0.1em] flex justify-between items-center">
                        <span>{t.conversations}</span>
                    </div>
                    {chats.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase())).map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => setCurrentChatId(chat.id)}
                            className={`group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${currentChatId === chat.id ? "bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" : "hover:bg-gray-200/50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400"}`}
                        >
                            <MessageSquare size={17} className={currentChatId === chat.id ? "text-claude-accent" : "text-gray-400"} />
                            <div className="flex-1 truncate text-sm font-medium pr-1">
                                {chat.title}
                            </div>
                            <button
                                onClick={(e) => deleteChat(chat.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md transition-all text-gray-400 hover:text-red-500"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    {chats.length === 0 && (
                        <div className="text-sm text-gray-400 px-3 py-10 text-center italic">No hay chats aún</div>
                    )}
                </div>

                {/* Sidebar Footer / Settings */}
                <div className="p-4 border-t dark:border-gray-800 bg-claude-sidebar/50 space-y-2">
                    <div className="px-3 pb-2">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t.language}</div>
                        <div className="flex bg-gray-200/50 dark:bg-gray-800/50 rounded-lg p-1">
                            <button
                                onClick={() => { setLanguage("en"); localStorage.setItem("app_language", "en"); }}
                                className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${language === 'en' ? 'bg-white dark:bg-gray-700 shadow-sm text-claude-accent' : 'text-gray-400'}`}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => { setLanguage("es"); localStorage.setItem("app_language", "es"); }}
                                className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${language === 'es' ? 'bg-white dark:bg-gray-700 shadow-sm text-claude-accent' : 'text-gray-400'}`}
                            >
                                ES
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (confirm(t.logoutConfirm)) {
                                localStorage.removeItem("pollinations_api_key");
                                window.location.reload();
                            }
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-all text-xs font-bold"
                    >
                        <Trash2 size={16} />
                        <span>{t.logoutBtn}</span>
                    </button>

                    <div className="pt-3 mt-1 border-t dark:border-gray-800 flex flex-col items-center gap-1">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest opacity-60">POWERED BY</span>
                        <a href="https://pollinations.ai" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                            <img src="https://raw.githubusercontent.com/pollinations/pollinations/main/assets/logo.svg" alt="Pollinations" className="h-8 invert dark:invert-0" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Chat */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-claude-bg">
                {/* Header */}
                <header className="h-14 flex items-center justify-between px-6 border-b dark:border-gray-800 bg-claude-bg/80 backdrop-blur-md z-20 shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="font-black text-claude-accent tracking-tighter text-lg cursor-default">POLLI</span>
                        <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-700"></div>
                        <h1 className="font-semibold text-sm truncate max-w-[200px] md:max-w-md text-gray-600 dark:text-gray-300 mr-2">
                            {currentChat?.title || (language === 'en' ? "New Conversation" : "Nueva Conversación")}
                        </h1>

                        {/* Model Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-xs font-bold"
                            >
                                <selectedModel.icon size={14} className={selectedModel.color} />
                                <span>{selectedModel.name}</span>
                                <ChevronDown size={14} className={`transition-transform ${isModelMenuOpen ? "rotate-180" : ""}`} />
                            </button>

                            <AnimatePresence>
                                {isModelMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-2 z-50 overflow-hidden"
                                    >
                                        <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b dark:border-gray-800 mb-1">{t.changeModel}</div>
                                        {MODELS.map((m) => (
                                            <button
                                                key={m.id}
                                                onClick={() => changeModel(m.id)}
                                                className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all ${selectedModelId === m.id ? "bg-claude-accent/5 ring-1 ring-claude-accent/20" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                                            >
                                                <m.icon size={20} className={`${m.color} shrink-0 mt-0.5`} />
                                                <div className="text-left">
                                                    <div className="text-sm font-bold text-gray-800 dark:text-gray-100">{m.name}</div>
                                                    <div className="text-[11px] text-gray-500 font-medium">
                                                        {language === 'en' ? (m.id === 'claude-large' ? 'Advanced reasoning & vision' : m.id === 'deepseek' ? 'Powerful code and logic' : 'Versatile and creative') : (m.id === 'claude-large' ? 'Razonamiento avanzado y visión' : m.id === 'deepseek' ? 'Potente en código y lógica' : 'El más versátil y creativo')}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Pollen Balance Display */}
                    <div className="flex items-center gap-2 pr-2">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{t.pollenBalance}</span>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 shadow-sm group/balance transition-all hover:bg-orange-100 dark:hover:bg-orange-500/20">
                                <span className="text-sm font-black text-orange-600 dark:text-orange-400">
                                    {pollenBalance !== null ? pollenBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "---"}
                                </span>
                                <Sparkles size={12} className="text-orange-500 animate-pulse" />
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
                                        setPollenBalance(data.balance);
                                    }
                                } finally {
                                    setIsRefreshingBalance(false);
                                }
                            }}
                            className="p-2 mr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-orange-500 transition-all active:scale-95 duration-200"
                            title={t.updateBalance}
                        >
                            <RotateCw size={14} className={isRefreshingBalance ? "animate-spin text-orange-500" : ""} />
                        </button>
                    </div>
                </header>

                {/* Messages Container */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto pt-8 pb-40 scroll-smooth">
                    {!currentChat || messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-6 animate-in fade-in zoom-in-95 duration-500">
                            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-8 shadow-xl border border-gray-100 dark:border-gray-700">
                                <selectedModel.icon size={34} className={selectedModel.color} />
                            </div>
                            <h2 className="text-4xl font-bold tracking-tight mb-3 text-gray-800 dark:text-gray-100">{t.helloMessage} {selectedModel.name}</h2>
                            <p className="text-gray-500 text-lg max-w-md">{t.dropInstruction}</p>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto flex flex-col gap-8 px-4 md:px-6">
                            {messages.map((m, index) => (
                                <div
                                    key={m.id || `msg-${index}`}
                                    className={`flex w-full gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-3 duration-400 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                                >
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all ${m.role === "user" ? "bg-claude-accent text-white" : "bg-white dark:bg-gray-800 border dark:border-gray-700"}`}>
                                        {m.role === "user" ? <User size={18} /> : <selectedModel.icon size={18} className={selectedModel.color} />}
                                    </div>

                                    {/* Content Wrapper */}
                                    <div className={`flex-1 min-w-0 flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                                        {m.role === "assistant" && m.reasoning && (
                                            <div className="mb-2 max-w-full">
                                                <button
                                                    onClick={() => toggleReasoning(m.id)}
                                                    className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-claude-accent transition-colors mb-1 group"
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
                                                            <div className="p-4 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 text-sm text-gray-500 dark:text-gray-400 italic font-medium">
                                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.reasoning}</ReactMarkdown>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}

                                        <div
                                            id={`msg-${m.id}`}
                                            className={`relative group/msg transition-all duration-300 w-fit max-w-full ${m.role === "user"
                                                ? "bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl rounded-tr-none border border-gray-100 dark:border-gray-700 shadow-sm text-gray-800 dark:text-gray-100"
                                                : "text-gray-800 dark:text-gray-200 py-1"
                                                }`}
                                        >
                                            {/* Floating Copy Actions */}
                                            <div className={`absolute -top-3 ${m.role === "user" ? "left-0" : "right-0"} opacity-0 translate-y-1 group-hover/msg:opacity-100 group-hover/msg:translate-y-0 transition-all duration-200 z-10 hidden md:block`}>
                                                <div className="flex items-center gap-0.5 p-1 rounded-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-800 shadow-xl">
                                                    <button
                                                        onClick={() => navigator.clipboard.writeText(typeof m.content === "string" ? m.content : "")}
                                                        className="h-7 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-claude-accent transition-all flex items-center gap-1.5 text-[10px] font-bold"
                                                        title="Copy Markdown"
                                                    >
                                                        <Copy size={12} />
                                                        <span>MD</span>
                                                    </button>
                                                    <div className="w-[1px] h-3 bg-gray-200 dark:bg-gray-800 mx-0.5"></div>
                                                    <button
                                                        onClick={() => {
                                                            const el = document.getElementById(`msg-${m.id}`);
                                                            if (el) navigator.clipboard.writeText(el.innerText);
                                                        }}
                                                        className="h-7 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-claude-accent transition-all flex items-center gap-1.5 text-[10px] font-bold"
                                                        title="Copy Text"
                                                    >
                                                        <FileText size={12} />
                                                        <span>TXT</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="markdown-content prose dark:prose-invert max-w-none break-words leading-relaxed text-[15px] md:text-[16px] text-left">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        code({ node, inline, className, children, ...props }: any) {
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

                                            {m.files && m.files.length > 0 && (
                                                <div className={`flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/50 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                                    {m.files.map((f, i) => (
                                                        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-[11px] font-bold text-gray-600 dark:text-gray-400 group/file cursor-default shadow-sm sm:max-w-[200px]">
                                                            {f.type === "image" ? <ImageIcon size={14} className="text-claude-accent" /> : <FileText size={14} className="text-blue-500" />}
                                                            <span className="truncate">{f.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                            }
                            {isLoading && (
                                <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="flex gap-4 md:gap-6">
                                        <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0 flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-claude-accent/30 border-t-claude-accent rounded-full animate-spin" />
                                        </div>
                                        <div className="flex-1 space-y-3 pt-3">
                                            <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-1/4 animate-pulse" />
                                            <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-full animate-pulse delay-75" />
                                            <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-4/5 animate-pulse delay-150" />
                                        </div>
                                    </div>
                                    {loadingStatus && (
                                        <div className="ml-13 md:ml-15 px-4 py-2 rounded-2xl bg-claude-accent/5 border border-claude-accent/10 text-xs font-bold text-claude-accent flex items-center gap-2 w-fit">
                                            <Brain size={12} className="animate-bounce" />
                                            <span className="opacity-80">{loadingStatus}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Fixed Input area at bottom */}
                <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-claude-bg via-claude-bg to-transparent z-10">
                    <div className="max-w-3xl mx-auto relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-claude-accent/20 to-orange-500/10 rounded-[28px] blur-lg opacity-0 group-focus-within:opacity-100 transition duration-700"></div>
                        <div className="relative bg-white dark:bg-[#141414] rounded-[24px] border-2 border-gray-100 dark:border-gray-800 shadow-2xl transition-all duration-300 group-focus-within:border-claude-accent/40 dark:group-focus-within:border-claude-accent/20">

                            {/* Attached Files Preview */}
                            <AnimatePresence>
                                {attachedFiles.length > 0 && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="flex gap-3 p-4 border-b border-gray-50 dark:border-gray-800 overflow-x-auto"
                                    >
                                        {attachedFiles.map((file, i) => (
                                            <div key={i} className="relative group/file shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 shadow-sm transition-transform hover:scale-105">
                                                {file.type === "image" ? (
                                                    <img src={file.preview} alt="preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                                                        <FileText size={24} className="text-blue-500 mb-1.5" />
                                                        <span className="text-[10px] font-bold truncate w-full px-1 text-gray-500">{file.file.name}</span>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => removeFile(i)}
                                                    className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full opacity-0 group-hover/file:opacity-100 transition-all hover:bg-red-500"
                                                >
                                                    <Plus size={12} className="rotate-45" />
                                                </button>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex items-end p-2.5 gap-2">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-all shrink-0 text-gray-400 hover:text-claude-accent group/btn"
                                    title="Adjuntar archivos"
                                >
                                    <Paperclip size={22} className="group-hover/btn:rotate-12 transition-transform" />
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        multiple
                                        accept="image/*,application/pdf"
                                    />
                                </button>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder={t.placeholder.replace("{model}", selectedModel.name)}
                                    className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3.5 px-1 text-[16px] leading-relaxed min-h-[60px] max-h-[220px] placeholder-gray-400 font-medium"
                                    rows={1}
                                    style={{ height: 'auto' }}
                                />
                                {isLoading ? (
                                    <button
                                        onClick={handleStop}
                                        className="p-3.5 rounded-2xl transition-all shrink-0 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-red-500 hover:text-white group"
                                        title={t.stopGeneration}
                                    >
                                        <Square size={22} className="fill-current group-hover:fill-white" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSend}
                                        disabled={isLoading || (!input.trim() && attachedFiles.length === 0)}
                                        className={`p-3.5 rounded-2xl transition-all shrink-0 shadow-sm ${input.trim() || attachedFiles.length > 0 ? "bg-claude-accent text-white hover:bg-claude-accent/90 hover:shadow-lg hover:shadow-claude-accent/20 active:scale-95" : "bg-gray-50 dark:bg-gray-800 text-gray-300 cursor-not-allowed"}`}
                                    >
                                        <Send size={22} className={input.trim() || attachedFiles.length > 0 ? "fill-white/20" : ""} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="text-center mt-4">
                            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest opacity-60">
                                AI Client with Polli • <a href="https://pollinations.ai" target="_blank" rel="noopener noreferrer" className="hover:text-claude-accent transition-colors">Powered by Pollinations.ai</a>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            {/* API Key Modal Overlay */}
            <AnimatePresence>
                {showApiKeyModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-gray-900/80 backdrop-blur-xl flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
                        >
                            <div className="p-8">
                                <div className="w-16 h-16 bg-claude-accent/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                    <Brain size={32} className="text-claude-accent" />
                                </div>
                                <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-gray-100">{t.configTitle}</h2>
                                <p className="text-sm text-center text-gray-500 mb-8 px-4 leading-relaxed">
                                    {t.configDesc}
                                </p>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <input
                                            type="password"
                                            placeholder={t.configPlaceholder}
                                            value={tempKey}
                                            onChange={(e) => setTempKey(e.target.value)}
                                            className="w-full h-14 px-5 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-claude-accent focus:ring-0 transition-all font-mono text-sm outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (tempKey.startsWith("sk_") || tempKey.startsWith("pk_")) {
                                                localStorage.setItem("pollinations_api_key", tempKey);
                                                setUserApiKey(tempKey);
                                                setShowApiKeyModal(false);
                                            } else {
                                                alert(t.errorApiKey);
                                            }
                                        }}
                                        className="w-full h-14 bg-claude-accent text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-claude-accent/30 active:scale-95 transition-all"
                                    >
                                        {t.configBtn}
                                    </button>
                                </div>
                                <div className="mt-8 pt-6 border-t dark:border-gray-800 text-center">
                                    <a
                                        href="https://pollinations.ai"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-bold text-gray-400 hover:text-claude-accent transition-colors"
                                    >
                                        {t.getApiKey}
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
