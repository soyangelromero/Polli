import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { MODELS } from "../lib/constants";

interface ModelSelectorProps {
    selectedModel: typeof MODELS[0];
    selectedModelId: string;
    isModelMenuOpen: boolean;
    setIsModelMenuOpen: (open: boolean) => void;
    changeModel: (id: string) => void;
    t: any;
}

export function ModelSelector({
    selectedModel,
    selectedModelId,
    isModelMenuOpen,
    setIsModelMenuOpen,
    changeModel,
    t
}: ModelSelectorProps) {
    return (
        <div className="relative shrink-0">
            <button
                onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-xs font-bold"
            >
                <selectedModel.icon size={14} className={selectedModel.color} />
                <span className="max-w-[70px] md:max-w-none truncate">{selectedModel.name}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${isModelMenuOpen ? "rotate-180" : ""}`} />
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
                                        {m.desc}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
