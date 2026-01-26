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
        <div className="relative group rounded-lg overflow-hidden my-4 border border-gray-700 bg-[#1e1e1e] w-full">
            <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-700 text-xs text-gray-400">
                <span className="font-mono lowercase">{language || "text"}</span>
                <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                    {isCopied ? (
                        <>
                            <Check size={14} className="text-green-500" />
                            <span>Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy size={14} />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <div className="text-sm font-mono overflow-auto custom-scrollbar">
                <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    customStyle={{
                        margin: 0,
                        padding: "1rem",
                        background: "transparent",
                    }}
                    wrapLines={true}
                    wrapLongLines={true} // Avoid horizontal scroll if possible, or false if you prefer scroll
                >
                    {value}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};
