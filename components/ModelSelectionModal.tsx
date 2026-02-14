import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useMemo } from "react";
import { Diamond, AlertTriangle, X, Search, Zap, Cpu, MessageSquare, Image, Video, AudioLines, Brain, Sparkles } from "lucide-react";
import { MODELS, MODEL_CATEGORIES, getModelsByCategory, type ModelDef, type ModelCategory } from "../lib/constants";

interface ModelSelectionModalProps {
    show: boolean;
    onSelect: (modelId: string) => void;
    t: any;
    language: "en" | "es";
}

function CapabilityBadge({ cap }: { cap: string }) {
    const badgeMap: Record<string, { emoji: string; label: string }> = {
        "vision": { emoji: "👁️", label: "Vision" },
        "reasoning": { emoji: "🧠", label: "Reasoning" },
        "search": { emoji: "🔍", label: "Search" },
        "code": { emoji: "💻", label: "Code" },
        "audio-in": { emoji: "🎙️", label: "Audio In" },
        "audio-out": { emoji: "🔊", label: "Audio Out" },
    };
    const badge = badgeMap[cap];
    if (!badge) return null;
    return (
        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[9px] font-medium text-gray-600 dark:text-gray-400">
            {badge.emoji} {badge.label}
        </span>
    );
}

export function ModelSelectionModal({ show, onSelect, t, language }: ModelSelectionModalProps) {
    const [activeCategory, setActiveCategory] = useState<ModelCategory>("text");
    const [searchQuery, setSearchQuery] = useState("");

    const { pollen, paid } = useMemo(() => {
        const result = getModelsByCategory(activeCategory);
        if (!searchQuery) return result;

        const filter = (list: ModelDef[]) => list.filter(m =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.descEs.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return {
            pollen: filter(result.pollen),
            paid: filter(result.paid)
        };
    }, [activeCategory, searchQuery]);

    if (!show) return null;

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 lg:p-10">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-5xl h-[85vh] bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 pb-4 flex flex-col gap-6 shrink-0 bg-gradient-to-b from-gray-50/50 dark:from-gray-800/20 to-transparent">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                                        <Sparkles className="text-claude-accent animate-pulse" />
                                        {language === "es" ? "Selecciona tu Modelo" : "Select your Model"}
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                                        {language === "es" ? "Elige el motor que potenciará tu próxima sesión" : "Choose the engine for your next session"}
                                    </p>
                                </div>
                            </div>

                            {/* Controls: Category Tabs & Search */}
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <div className="flex p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-2xl w-full md:w-auto">
                                    {MODEL_CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.key}
                                            onClick={() => setActiveCategory(cat.key)}
                                            className={`flex items-center justify-center gap-2 py-2.5 px-6 text-xs font-black uppercase tracking-widest transition-all rounded-xl relative ${activeCategory === cat.key
                                                ? "bg-white dark:bg-gray-700 text-claude-accent shadow-sm"
                                                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                                }`}
                                        >
                                            <cat.icon size={16} />
                                            <span>{language === "es" ? cat.labelEs : cat.labelEn}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder={language === "es" ? "Buscar modelos..." : "Search models..."}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-100 dark:bg-gray-800/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-claude-accent transition-all dark:text-white outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Model Grid */}
                        <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
                            {/* Pollen Section */}
                            {pollen.length > 0 && (
                                <div className="mb-10">
                                    <h3 className="flex items-center gap-2 px-2 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                                        <span className="text-sm">🌸</span>
                                        {t.pollenModels}
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {pollen.map(model => (
                                            <ModelCard key={model.id} model={model} onSelect={() => onSelect(model.id)} language={language} t={t} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Paid Section */}
                            {paid.length > 0 && (
                                <div>
                                    <h3 className="flex items-center gap-2 px-2 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
                                        <Diamond size={14} />
                                        {t.paidModels}
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {paid.map(model => (
                                            <ModelCard key={model.id} model={model} onSelect={() => onSelect(model.id)} language={language} t={t} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {pollen.length === 0 && paid.length === 0 && (
                                <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-4">
                                    <Search size={48} className="opacity-20" />
                                    <p className="text-sm font-medium">{language === "es" ? "No se encontraron modelos" : "No models found"}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function ModelCard({ model, onSelect, language, t }: { model: ModelDef; onSelect: () => void; language: string; t: any }) {
    return (
        <motion.button
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSelect}
            className="flex flex-col text-left p-6 bg-gray-50 dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800 rounded-3xl transition-all border border-transparent hover:border-claude-accent/30 hover:shadow-xl hover:shadow-claude-accent/5 group relative overflow-hidden"
        >
            <div className={`p-3 rounded-2xl bg-white dark:bg-gray-700 shadow-sm w-fit mb-4 group-hover:scale-110 transition-transform`}>
                <model.icon size={24} className={model.color} />
            </div>

            <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-black text-gray-900 dark:text-white tracking-tight">{model.name}</span>
                {model.paidOnly && (
                    <span className="p-1 rounded-md bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 italic">
                        <Diamond size={10} />
                    </span>
                )}
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 line-clamp-2 leading-relaxed font-medium">
                {language === "es" ? model.descEs : model.desc}
            </p>

            <div className="mt-auto flex flex-wrap gap-1.5">
                {model.capabilities?.slice(0, 3).map(cap => (
                    <CapabilityBadge key={cap} cap={cap} />
                ))}
                {model.alpha && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-500/20 text-[9px] font-black text-red-600 dark:text-red-400 uppercase tracking-tighter">
                        <AlertTriangle size={8} /> {t.alphaTag}
                    </span>
                )}
            </div>

            {/* Hover Indicator */}
            <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-claude-accent flex items-center justify-center text-white">
                    <Zap size={16} fill="white" />
                </div>
            </div>
        </motion.button>
    );
}
