import { motion, AnimatePresence } from "framer-motion";
import { Paperclip, Send, Square, FileText, Trash2 } from "lucide-react";
import React from "react";

interface ChatInputProps {
    attachedFiles: { file: File; type: string; preview?: string }[];
    removeFile: (index: number) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSend: (text: string) => void;
    handleStop: () => void;
    isLoading: boolean;
    t: any;
    selectedModel: { name: string };
    isDragging?: boolean;
}

export const ChatInput = React.memo(function ChatInput({
    attachedFiles,
    removeFile,
    fileInputRef,
    handleFileUpload,
    onSend,
    handleStop,
    isLoading,
    t,
    selectedModel,
    isDragging
}: ChatInputProps) {
    const [input, setInput] = React.useState("");

    const handleInternalSend = () => {
        if (!input.trim() && attachedFiles.length === 0) return;
        onSend(input);
        setInput("");
    };
    return (
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-6 pb-8 md:pb-12 pt-10 bg-gradient-to-t from-claude-bg via-claude-bg/80 to-transparent z-10 pointer-events-none">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-4xl mx-auto relative pointer-events-auto"
            >
                {/* Minimalist Glass Container - Floating */}
                <div
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    className={`relative bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl rounded-2xl border transition-all duration-300 ${isDragging ? "border-claude-accent ring-4 ring-claude-accent/10 shadow-2xl scale-[1.02]" : "border-black/[0.06] dark:border-white/[0.06] shadow-lg dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)]"}`}>

                    {/* Attached Files Preview */}
                    <AnimatePresence>
                        {attachedFiles.length > 0 && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="flex gap-4 p-4 pb-0 overflow-x-auto scrollbar-hide"
                            >
                                {attachedFiles.map((file, i) => (
                                    <div key={i} className="relative group/file shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 shadow-sm transition-all hover:scale-105">
                                        {file.type === "image" ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={file.preview} alt="preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center">
                                                <FileText size={20} className="text-claude-accent mb-0.5" />
                                                <span className="text-[9px] font-bold truncate w-full px-1 text-gray-400">{file.file.name}</span>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => removeFile(i)}
                                            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] text-white opacity-0 group-hover/file:opacity-100 transition-all duration-300"
                                        >
                                            <Trash2 size={16} className="text-red-400" />
                                        </button>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-end p-2.5 md:p-3 gap-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all shrink-0 text-gray-400 hover:text-claude-accent group/btn active:scale-95"
                            title="Adjuntar"
                        >
                            <Paperclip size={20} className="group-hover/btn:rotate-12 transition-transform duration-300" />
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
                                    handleInternalSend();
                                }
                            }}
                            placeholder={t.placeholder.replace("{model}", selectedModel.name)}
                            className="flex-1 bg-transparent border-none outline-none focus:ring-0 focus:outline-none resize-none py-3 px-1 text-[15px] md:text-base leading-relaxed min-h-[48px] max-h-[250px] placeholder-gray-400 dark:placeholder-gray-500 font-normal scrollbar-hide text-gray-800 dark:text-gray-100 selection:bg-claude-accent/30"
                            rows={1}
                            style={{ height: 'auto' }}
                        />

                        {isLoading ? (
                            <button
                                onClick={handleStop}
                                className="p-3 rounded-full transition-all shrink-0 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white group active:scale-95"
                                title={t.stopGeneration}
                            >
                                <Square size={20} className="fill-current group-hover:fill-white" />
                            </button>
                        ) : (
                            <button
                                onClick={handleInternalSend}
                                disabled={isLoading || (!input.trim() && attachedFiles.length === 0)}
                                className={`p-3 rounded-full transition-all shrink-0 transform ${input.trim() || attachedFiles.length > 0
                                    ? "bg-claude-accent text-white shadow-lg shadow-claude-accent/20 hover:-translate-y-0.5 active:scale-95"
                                    : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                                    }`}
                            >
                                <Send size={20} className="ml-0.5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="text-center mt-6 flex items-center justify-center gap-4 opacity-40 hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                        Powered by <a href="https://pollinations.ai" target="_blank" rel="noopener noreferrer" className="hover:text-claude-accent transition-colors">Pollinations API</a>
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="https://raw.githubusercontent.com/pollinations/pollinations/main/assets/logo.svg"
                        alt="Pollinations Logo"
                        className="h-5 w-auto invert dark:invert-0 brightness-200"
                    />
                </div>
            </motion.div>

        </div>
    );
});
