import { motion, AnimatePresence } from "framer-motion";
import { Brain } from "lucide-react";

interface ApiKeyModalProps {
    show: boolean;
    t: any;
    tempKey: string;
    setTempKey: (key: string) => void;
    onSave: (key: string) => void;
    onClose: () => void;
}

export function ApiKeyModal({ show, t, tempKey, setTempKey, onSave, onClose }: ApiKeyModalProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-3xl flex items-center justify-center p-6"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="w-full max-w-sm bg-white/5 dark:bg-white/[0.02] backdrop-blur-2xl rounded-[40px] border border-white/10 p-[1px] shadow-2xl relative overflow-hidden"
                    >
                        <div className="bg-white dark:bg-black/40 rounded-[39px] p-8 md:p-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-claude-accent/20 to-orange-500/10 rounded-2xl flex items-center justify-center mb-8 mx-auto border border-claude-accent/20">
                                <Brain size={32} className="text-claude-accent" />
                            </div>
                            <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-gray-100 tracking-tight">{t.configTitle}</h2>
                            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-8 px-2 leading-relaxed">
                                {t.configDesc}
                            </p>

                            <div className="space-y-4">
                                <div className="relative group">
                                    <input
                                        type="password"
                                        placeholder={t.configPlaceholder}
                                        value={tempKey}
                                        onChange={(e) => setTempKey(e.target.value)}
                                        className="w-full h-14 px-6 rounded-2xl bg-black/20 dark:bg-white/[0.03] border border-white/5 focus:border-claude-accent/50 focus:ring-4 focus:ring-claude-accent/5 transition-all font-mono text-sm outline-none text-center tracking-widest placeholder:text-gray-600"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        if (tempKey.startsWith("sk_") || tempKey.startsWith("pk_")) {
                                            onSave(tempKey);
                                            onClose();
                                        } else {
                                            alert(t.errorApiKey);
                                        }
                                    }}
                                    className="w-full h-14 bg-claude-accent hover:bg-orange-600 text-white rounded-2xl font-bold text-base shadow-lg shadow-claude-accent/20 hover:shadow-claude-accent/30 hover:-translate-y-0.5 active:scale-95 transition-all tracking-wide"
                                >
                                    {t.configBtn}
                                </button>
                            </div>
                            <div className="mt-8 pt-6 border-t border-white/5 text-center">
                                <a
                                    href="https://pollinations.ai"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] font-bold text-gray-500 hover:text-claude-accent transition-colors uppercase tracking-[0.2em] opacity-60 hover:opacity-100"
                                >
                                    {t.getApiKey}
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
