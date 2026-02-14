import {
    Bot, Cpu, Sparkles, Image, Video, Music, Mic,
    Zap, Brain, Eye, Search, Code, MessageSquare,
    Wand2, Film, Volume2, AudioLines, Globe, GraduationCap
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Model Type Definition ───
export type ModelCategory = "text" | "image" | "video" | "audio";

export type ModelDef = {
    id: string;
    name: string;
    category: ModelCategory;
    paidOnly: boolean;
    icon: LucideIcon;
    color: string;
    desc: string;
    descEs: string;
    capabilities?: string[];
    alpha?: boolean;
};

// ─── TEXT MODELS ───
export const TEXT_MODELS: ModelDef[] = [
    // ── Pollen (Free Tier) ──
    { id: "qwen-character", name: "Qwen Character", category: "text", paidOnly: false, icon: MessageSquare, color: "text-purple-400", desc: "Character AI roleplay", descEs: "Roleplay de personajes IA", capabilities: [], alpha: true },
    { id: "nova-fast", name: "Amazon Nova Micro", category: "text", paidOnly: false, icon: Zap, color: "text-yellow-500", desc: "Ultra-fast responses", descEs: "Respuestas ultra rápidas" },
    { id: "mistral", name: "Mistral Small 3.2 24B", category: "text", paidOnly: false, icon: Cpu, color: "text-orange-400", desc: "Efficient multilingual model", descEs: "Modelo multilingüe eficiente" },
    { id: "gemini-fast", name: "Gemini 2.5 Flash Lite", category: "text", paidOnly: false, icon: Zap, color: "text-blue-400", desc: "Fast with vision & search", descEs: "Rápido con visión y búsqueda", capabilities: ["vision", "search", "code"] },
    { id: "qwen-coder", name: "Qwen3 Coder 30B", category: "text", paidOnly: false, icon: Code, color: "text-cyan-500", desc: "Specialized for coding", descEs: "Especializado en código" },
    { id: "openai-fast", name: "GPT-5 Nano", category: "text", paidOnly: false, icon: Sparkles, color: "text-green-400", desc: "Lightweight & fast GPT", descEs: "GPT ligero y rápido", capabilities: ["vision"] },
    { id: "openai", name: "GPT-5 Mini", category: "text", paidOnly: false, icon: Sparkles, color: "text-green-500", desc: "Balanced GPT model", descEs: "Modelo GPT equilibrado", capabilities: ["vision"] },
    { id: "gemini-search", name: "Gemini 2.5 Flash (Search)", category: "text", paidOnly: false, icon: Search, color: "text-blue-400", desc: "Gemini with web search", descEs: "Gemini con búsqueda web", capabilities: ["vision", "search", "code"] },
    { id: "perplexity-fast", name: "Perplexity Sonar", category: "text", paidOnly: false, icon: Search, color: "text-teal-500", desc: "Fast web search AI", descEs: "IA rápida con búsqueda web", capabilities: ["search"] },
    { id: "deepseek", name: "DeepSeek V3.2", category: "text", paidOnly: false, icon: Brain, color: "text-blue-600", desc: "Deep reasoning & code", descEs: "Razonamiento profundo y código", capabilities: ["reasoning"] },
    { id: "minimax", name: "MiniMax M2.1", category: "text", paidOnly: false, icon: Cpu, color: "text-indigo-400", desc: "Versatile reasoning model", descEs: "Modelo versátil de razonamiento", capabilities: ["reasoning"] },
    { id: "perplexity-reasoning", name: "Perplexity Sonar Reasoning", category: "text", paidOnly: false, icon: Brain, color: "text-teal-600", desc: "Reasoning with search", descEs: "Razonamiento con búsqueda", capabilities: ["reasoning", "search"] },
    { id: "openai-audio", name: "GPT-4o Mini Audio", category: "text", paidOnly: false, icon: Volume2, color: "text-green-500", desc: "Text + audio I/O", descEs: "Texto + audio E/S", capabilities: ["vision", "audio-in", "audio-out"] },
    { id: "chickytutor", name: "ChickyTutor AI Tutor", category: "text", paidOnly: false, icon: GraduationCap, color: "text-yellow-500", desc: "Language learning tutor", descEs: "Tutor de idiomas" },
    { id: "claude-fast", name: "Claude Haiku 4.5", category: "text", paidOnly: false, icon: Bot, color: "text-amber-600", desc: "Fast Claude model", descEs: "Claude rápido", capabilities: ["vision"] },
    { id: "openai-large", name: "GPT-5.2", category: "text", paidOnly: false, icon: Sparkles, color: "text-green-600", desc: "Most capable GPT", descEs: "GPT más capaz", capabilities: ["vision", "reasoning"] },
    { id: "kimi", name: "Moonshot Kimi K2.5", category: "text", paidOnly: false, icon: Brain, color: "text-violet-500", desc: "Vision & reasoning", descEs: "Visión y razonamiento", capabilities: ["vision", "reasoning"] },
    { id: "midijourney", name: "MIDIjourney", category: "text", paidOnly: false, icon: Music, color: "text-pink-500", desc: "Music composition AI", descEs: "IA de composición musical" },
    { id: "glm", name: "Z.ai GLM-5", category: "text", paidOnly: false, icon: Brain, color: "text-emerald-500", desc: "Reasoning model", descEs: "Modelo de razonamiento", capabilities: ["reasoning"] },

    // ── 💎 Paid Only ──
    { id: "grok", name: "xAI Grok 4 Fast", category: "text", paidOnly: true, icon: Zap, color: "text-red-400", desc: "Fast Grok model", descEs: "Modelo Grok rápido" },
    { id: "gemini", name: "Gemini 3 Flash", category: "text", paidOnly: true, icon: Sparkles, color: "text-blue-500", desc: "Latest Gemini with all capabilities", descEs: "Último Gemini con todas las capacidades", capabilities: ["vision", "audio-in", "search", "code"] },
    { id: "gemini-large", name: "Gemini 3 Pro", category: "text", paidOnly: true, icon: Brain, color: "text-blue-600", desc: "Most powerful Gemini", descEs: "Gemini más poderoso", capabilities: ["vision", "audio-in", "reasoning", "search"] },
    { id: "gemini-legacy", name: "Gemini 2.5 Pro", category: "text", paidOnly: true, icon: Cpu, color: "text-blue-500", desc: "Previous gen Gemini Pro", descEs: "Gemini Pro generación anterior", capabilities: ["vision", "audio-in", "reasoning", "search", "code"] },
    { id: "claude", name: "Claude Sonnet 4.5", category: "text", paidOnly: true, icon: Bot, color: "text-amber-600", desc: "Balanced Claude model", descEs: "Claude equilibrado", capabilities: ["vision"] },
    { id: "claude-legacy", name: "Claude Opus 4.5", category: "text", paidOnly: true, icon: Bot, color: "text-amber-700", desc: "Previous Opus model", descEs: "Modelo Opus anterior", capabilities: ["vision"] },
    { id: "claude-large", name: "Claude Opus 4.6", category: "text", paidOnly: true, icon: Bot, color: "text-amber-700", desc: "Most powerful Claude", descEs: "Claude más poderoso", capabilities: ["vision"] },
];

// ─── IMAGE MODELS ───
export const IMAGE_MODELS: ModelDef[] = [
    // ── Pollen ──
    { id: "flux", name: "Flux Schnell", category: "image", paidOnly: false, icon: Image, color: "text-violet-500", desc: "Fast image generation", descEs: "Generación rápida de imágenes" },
    { id: "zimage", name: "Z-Image Turbo", category: "image", paidOnly: false, icon: Zap, color: "text-sky-500", desc: "Turbo speed images", descEs: "Imágenes a velocidad turbo" },
    { id: "imagen-4", name: "Imagen 4", category: "image", paidOnly: false, icon: Image, color: "text-blue-400", desc: "Google's image model", descEs: "Modelo de imagen de Google", alpha: true },
    { id: "klein", name: "FLUX.2 Klein 4B", category: "image", paidOnly: false, icon: Image, color: "text-purple-400", desc: "Compact Flux model", descEs: "Modelo Flux compacto", capabilities: ["vision"] },
    { id: "klein-large", name: "FLUX.2 Klein 9B", category: "image", paidOnly: false, icon: Image, color: "text-purple-500", desc: "Larger Flux model", descEs: "Modelo Flux más grande", capabilities: ["vision"] },
    { id: "gptimage", name: "GPT Image 1 Mini", category: "image", paidOnly: false, icon: Image, color: "text-green-500", desc: "OpenAI image generation", descEs: "Generación de imagen OpenAI", capabilities: ["vision"] },

    // ── 💎 Paid Only ──
    { id: "seedream", name: "Seedream 4.0", category: "image", paidOnly: true, icon: Wand2, color: "text-pink-500", desc: "High quality images", descEs: "Imágenes de alta calidad", capabilities: ["vision"] },
    { id: "kontext", name: "FLUX.1 Kontext", category: "image", paidOnly: true, icon: Image, color: "text-violet-600", desc: "Context-aware editing", descEs: "Edición contextual", capabilities: ["vision"] },
    { id: "nanobanana", name: "NanoBanana", category: "image", paidOnly: true, icon: Image, color: "text-yellow-500", desc: "Multimodal image model", descEs: "Modelo de imagen multimodal", capabilities: ["vision"] },
    { id: "seedream-pro", name: "Seedream 4.5 Pro", category: "image", paidOnly: true, icon: Wand2, color: "text-pink-600", desc: "Professional Seedream", descEs: "Seedream profesional", capabilities: ["vision"] },
    { id: "gptimage-large", name: "GPT Image 1.5", category: "image", paidOnly: true, icon: Image, color: "text-green-600", desc: "Advanced GPT image gen", descEs: "Generación avanzada GPT", capabilities: ["vision"] },
    { id: "nanobanana-pro", name: "NanoBanana Pro", category: "image", paidOnly: true, icon: Image, color: "text-yellow-600", desc: "Pro multimodal images", descEs: "Imágenes multimodal pro", capabilities: ["vision"] },
];

// ─── VIDEO MODELS ───
export const VIDEO_MODELS: ModelDef[] = [
    // ── Pollen ──
    { id: "grok-video", name: "Grok Video", category: "video", paidOnly: false, icon: Film, color: "text-red-400", desc: "AI video generation", descEs: "Generación de video IA", alpha: true },
    { id: "seedance", name: "Seedance Lite", category: "video", paidOnly: false, icon: Video, color: "text-pink-400", desc: "Lightweight video gen", descEs: "Generación ligera de video", capabilities: ["vision"] },
    { id: "wan", name: "Wan 2.6", category: "video", paidOnly: false, icon: Video, color: "text-cyan-400", desc: "Video + audio generation", descEs: "Generación de video + audio", capabilities: ["vision"], alpha: true },

    // ── 💎 Paid Only ──
    { id: "ltx-2", name: "LTX-2", category: "video", paidOnly: true, icon: Film, color: "text-indigo-500", desc: "Text-to-video model", descEs: "Modelo texto a video" },
    { id: "seedance-pro", name: "Seedance Pro-Fast", category: "video", paidOnly: true, icon: Video, color: "text-pink-600", desc: "Pro video generation", descEs: "Generación de video pro", capabilities: ["vision"] },
    { id: "veo", name: "Veo 3.1 Fast", category: "video", paidOnly: true, icon: Film, color: "text-blue-500", desc: "Google's video model", descEs: "Modelo de video de Google", capabilities: ["vision"] },
];

// ─── AUDIO MODELS ───
export const AUDIO_MODELS: ModelDef[] = [
    // ── Pollen ──
    { id: "scribe", name: "ElevenLabs Scribe v2", category: "audio", paidOnly: false, icon: Mic, color: "text-emerald-500", desc: "Audio transcription", descEs: "Transcripción de audio" },
    { id: "whisper", name: "Whisper Large V3", category: "audio", paidOnly: false, icon: Mic, color: "text-gray-500", desc: "Speech-to-text", descEs: "Voz a texto", alpha: true },
    { id: "elevenlabs", name: "ElevenLabs v3 TTS", category: "audio", paidOnly: false, icon: Volume2, color: "text-emerald-500", desc: "Text-to-speech", descEs: "Texto a voz" },
    { id: "elevenmusic", name: "ElevenLabs Music", category: "audio", paidOnly: false, icon: Music, color: "text-emerald-400", desc: "AI music generation", descEs: "Generación de música IA" },
];

// ─── ALL MODELS (combined) ───
export const MODELS: ModelDef[] = [
    ...TEXT_MODELS,
    ...IMAGE_MODELS,
    ...VIDEO_MODELS,
    ...AUDIO_MODELS,
];

// ─── Category Helpers ───
export const MODEL_CATEGORIES: { key: ModelCategory; labelEn: string; labelEs: string; icon: LucideIcon }[] = [
    { key: "text", labelEn: "Text", labelEs: "Texto", icon: MessageSquare },
    { key: "image", labelEn: "Image", labelEs: "Imagen", icon: Image },
    { key: "video", labelEn: "Video", labelEs: "Video", icon: Video },
    { key: "audio", labelEn: "Audio", labelEs: "Audio", icon: AudioLines },
];

export function getModelsByCategory(category: ModelCategory): { pollen: ModelDef[]; paid: ModelDef[] } {
    const all = MODELS.filter(m => m.category === category);
    return {
        pollen: all.filter(m => !m.paidOnly),
        paid: all.filter(m => m.paidOnly),
    };
}

// ─── TRANSLATIONS ───
export const TRANSLATIONS = {
    en: {
        newChat: "New Session",
        searchHistory: "Search index...",
        conversations: "Stored Sessions",
        noChats: "No active sessions",
        changeModel: "Select Model",
        pollenBalance: "Pollen Balance",
        updateBalance: "Sync balance",
        dropFiles: "Upload source for analysis",
        helloMessage: "Querying",
        dropInstruction: "Upload documents or enter queries below.",
        placeholder: "Enter instruction for {model}...",
        stopGeneration: "Abort generation",
        loadingPdf: "Extracting structural data from PDF... Please wait.",
        deleteConfirm: "Confirm session deletion?",
        logoutConfirm: "Close session and reset API credentials?",
        logoutBtn: "Reset Session",
        configTitle: "System Authentication",
        configDesc: "Provide a Pollinations API Key to start. Supports all text, image, video and audio models.",
        configPlaceholder: "API Key (sk_...)",
        configBtn: "Initialize",
        getApiKey: "Credential Management",
        errorApiKey: "Invalid API Key format.",
        language: "Locale",
        spanish: "ES",
        english: "EN",
        initialGreeting: "System ready. Select a model and start creating.",
        seeReasoning: "Show reasoning",
        hideReasoning: "Hide reasoning",
        pollenModels: "Pollen",
        paidModels: "Paid Only",
        alphaTag: "ALPHA",
        paidTag: "PAID",
        generating: "Generating...",
        enterPrompt: "Describe what you want to generate...",
        imageGenerated: "Image generated",
        videoGenerated: "Video generated",
        audioGenerated: "Audio generated",
        transcription: "Transcription",
        voiceLabel: "Voice",
        downloadMedia: "Download",
    },
    es: {
        newChat: "Nueva Sesión",
        searchHistory: "Buscar en el índice...",
        conversations: "Sesiones Guardadas",
        noChats: "Sin sesiones activas",
        changeModel: "Seleccionar Modelo",
        pollenBalance: "Saldo Pollen",
        updateBalance: "Sincronizar saldo",
        dropFiles: "Subir archivo para análisis",
        helloMessage: "Consultando",
        dropInstruction: "Sube documentos o ingresa consultas abajo.",
        placeholder: "Instrucción para {model}...",
        stopGeneration: "Abortar generación",
        loadingPdf: "Extrayendo datos del PDF... Por favor espere.",
        deleteConfirm: "¿Confirmar eliminación de sesión?",
        logoutConfirm: "¿Cerrar sesión y reiniciar credenciales?",
        logoutBtn: "Reiniciar Sesión",
        configTitle: "Autenticación del Sistema",
        configDesc: "Ingrese su API Key de Pollinations para iniciar. Soporta todos los modelos de texto, imagen, video y audio.",
        configPlaceholder: "API Key (sk_...)",
        configBtn: "Inicializar",
        getApiKey: "Gestión de Credenciales",
        errorApiKey: "Formato de clave inválido.",
        language: "Localización",
        spanish: "ES",
        english: "EN",
        initialGreeting: "Sistema listo. Selecciona un modelo y empieza a crear.",
        seeReasoning: "Ver razonamiento",
        hideReasoning: "Ocultar razonamiento",
        pollenModels: "Pollen",
        paidModels: "Solo Pago",
        alphaTag: "ALPHA",
        paidTag: "PAGO",
        generating: "Generando...",
        enterPrompt: "Describe lo que quieres generar...",
        imageGenerated: "Imagen generada",
        videoGenerated: "Video generado",
        audioGenerated: "Audio generado",
        transcription: "Transcripción",
        voiceLabel: "Voz",
        downloadMedia: "Descargar",
    }
};
