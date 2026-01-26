"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
    language: string;
    value: string;
}

export const CodeBlock = ({ language, value }: CodeBlockProps) => {
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = async () => {
        if (!navigator.clipboard) return;
        try {
            await navigator.clipboard.writeText(value);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    return (
        <div className="relative group rounded-2xl overflow-hidden my-6 border border-black/10 dark:border-white/10 bg-[#0d0d0d] shadow-xl w-full">
            <div className="flex items-center justify-between px-5 py-2.5 bg-white/5 backdrop-blur-md border-b border-white/5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <span className="font-mono">{language || "code"}</span>
                <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 hover:text-white transition-all active:scale-90"
                >
                    {isCopied ? (
                        <>
                            <Check size={14} className="text-green-500" />
                            <span className="text-green-500">Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy size={14} />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <div className="text-sm font-mono overflow-auto custom-scrollbar leading-relaxed">
                <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    customStyle={{
                        margin: 0,
                        padding: "1.25rem",
                        background: "transparent",
                        fontSize: "14px",
                    }}
                    wrapLines={true}
                    wrapLongLines={true}
                >
                    {value}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};
