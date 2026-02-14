import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useMemo } from "react";
import { ChevronDown, Diamond, AlertTriangle } from "lucide-react";
import { MODELS, MODEL_CATEGORIES, getModelsByCategory, type ModelDef, type ModelCategory } from "../lib/constants";

interface ModelSelectorProps {
    selectedModel: ModelDef;
    selectedModelId: string;
    isModelMenuOpen: boolean;
    setIsModelMenuOpen: (open: boolean) => void;
    changeModel: (id: string) => void;
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
        <span className="text-[9px] leading-none" title={badge.label}>
            {badge.emoji}
        </span>
    );
}

function ModelItem({ model, isSelected, onClick, t }: {
    model: ModelDef;
    isSelected: boolean;
    onClick: () => void;
    t: any;
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl transition-all duration-150 ${isSelected
                ? "bg-claude-accent/10 ring-1 ring-claude-accent/30"
                : "hover:bg-gray-50 dark:hover:bg-gray-800/60"
                }`}
        >
            <model.icon size={16} className={`${model.color} shrink-0 mt-0.5`} />
            <div className="text-left flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate">{model.name}</span>
                    {model.paidOnly && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-[8px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                            <Diamond size={7} />
                            {t.paidTag}
                        </span>
                    )}
                    {model.alpha && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-500/15 text-[8px] font-black text-red-600 dark:text-red-400 uppercase tracking-wider">
                            <AlertTriangle size={7} />
                            {t.alphaTag}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate">
                        {model.desc}
                    </span>
                    {model.capabilities && model.capabilities.length > 0 && (
                        <span className="flex items-center gap-0.5 ml-auto shrink-0">
                            {model.capabilities.map(cap => (
                                <CapabilityBadge key={cap} cap={cap} />
                            ))}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}

export function ModelSelector({
    selectedModel,
    selectedModelId,
    isModelMenuOpen,
    setIsModelMenuOpen,
    changeModel,
    t,
    language
}: ModelSelectorProps) {
    const [activeCategory, setActiveCategory] = useState<ModelCategory>(selectedModel?.category || "text");

    const { pollen, paid } = useMemo(() => getModelsByCategory(activeCategory), [activeCategory]);

    return (
        <div className="relative shrink-0">
            <button
                onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-xs font-bold"
            >
                <selectedModel.icon size={14} className={selectedModel.color} />
                <span className="max-w-[70px] md:max-w-none truncate">{selectedModel.name}</span>
                {selectedModel.paidOnly && <Diamond size={9} className="text-amber-500" />}
                <ChevronDown size={12} className={`transition-transform duration-200 ${isModelMenuOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isModelMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setIsModelMenuOpen(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="absolute top-full left-0 mt-2 w-[340px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden"
                        >
                            {/* Category Tabs */}
                            <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                                {MODEL_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.key}
                                        onClick={() => setActiveCategory(cat.key)}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 text-[10px] font-bold uppercase tracking-wider transition-all relative ${activeCategory === cat.key
                                            ? "text-claude-accent"
                                            : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            }`}
                                    >
                                        <cat.icon size={13} />
                                        <span className="hidden sm:inline">{language === "es" ? cat.labelEs : cat.labelEn}</span>
                                        {activeCategory === cat.key && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-1 right-1 h-[2px] rounded-full bg-claude-accent"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Model List */}
                            <div className="max-h-[400px] overflow-y-auto scrollbar-hide p-1.5">
                                {/* Pollen Models */}
                                {pollen.length > 0 && (
                                    <div>
                                        <div className="px-3 py-1.5 text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.15em] flex items-center gap-1.5">
                                            <span className="text-[10px]">🌸</span>
                                            {t.pollenModels}
                                            <span className="text-gray-400 font-medium normal-case tracking-normal">({pollen.length})</span>
                                        </div>
                                        {pollen.map(m => (
                                            <ModelItem
                                                key={m.id}
                                                model={m}
                                                isSelected={selectedModelId === m.id}
                                                onClick={() => changeModel(m.id)}
                                                t={t}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Divider */}
                                {pollen.length > 0 && paid.length > 0 && (
                                    <div className="my-1.5 mx-3 border-t border-gray-100 dark:border-gray-800" />
                                )}

                                {/* Paid Models */}
                                {paid.length > 0 && (
                                    <div>
                                        <div className="px-3 py-1.5 text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.15em] flex items-center gap-1.5">
                                            <Diamond size={9} />
                                            {t.paidModels}
                                            <span className="text-gray-400 font-medium normal-case tracking-normal">({paid.length})</span>
                                        </div>
                                        {paid.map(m => (
                                            <ModelItem
                                                key={m.id}
                                                model={m}
                                                isSelected={selectedModelId === m.id}
                                                onClick={() => changeModel(m.id)}
                                                t={t}
                                            />
                                        ))}
                                    </div>
                                )}

                                {pollen.length === 0 && paid.length === 0 && (
                                    <div className="p-6 text-center text-xs text-gray-400">
                                        No models available
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
