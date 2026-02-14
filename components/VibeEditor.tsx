"use client";

import { Code2, Copy, Maximize2, Check } from "lucide-react";
import { useState } from "react";

interface VibeEditorProps {
    content: string;
    language: string;
}

export function VibeEditor({ content, language }: VibeEditorProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex-1 flex flex-col bg-[#0d1117] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {/* Window Header */}
            <div className="h-14 flex items-center justify-between px-8 bg-white/5 border-b border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="flex gap-2 mr-2">
                        <div className="w-3.5 h-3.5 rounded-full bg-red-500/20 border border-red-500/40 shadow-sm shadow-red-500/20" />
                        <div className="w-3.5 h-3.5 rounded-full bg-amber-500/20 border border-amber-500/40 shadow-sm shadow-amber-500/20" />
                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 shadow-sm shadow-emerald-500/20" />
                    </div>
                    <div className="h-6 w-[1px] bg-white/10" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Code2 size={14} className="text-claude-accent" />
                        Visual Canvas — <span className="text-white/80">{language || "plaintext"}</span>
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCopy}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${copied ? 'bg-emerald-500 text-white' : 'bg-white/5 hover:bg-white/10 text-gray-400 font-black'}`}
                    >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? 'Copied' : 'Copy Code'}
                    </button>
                    <div className="h-4 w-[1px] bg-white/10" />
                    <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 transition-all hover:scale-110">
                        <Maximize2 size={16} />
                    </button>
                </div>
            </div>

            {/* Editor Content Area */}
            <div className="flex-1 overflow-auto p-10 font-mono text-sm leading-relaxed text-gray-300 custom-scrollbar relative">
                <div className="absolute left-0 top-0 w-12 h-full bg-white/[0.02] border-r border-white/5 flex flex-col items-center pt-10 text-[10px] text-gray-600 select-none font-bold">
                    {content.split('\n').map((_, i) => (
                        <div key={i} className="h-6 leading-relaxed">{i + 1}</div>
                    ))}
                </div>
                <div className="pl-6">
                    <pre className="whitespace-pre-wrap break-words">
                        <code>{content || "// Your AI-generated code will appear here..."}</code>
                    </pre>
                </div>
            </div>

            {/* Footer / Status Bar */}
            <div className="h-10 bg-black/40 border-t border-white/5 px-8 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                    <span className="flex items-center gap-1.5 ring-1 ring-emerald-500/20 px-2 py-0.5 rounded-md text-emerald-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                    </span>
                    <span>UTF-8</span>
                    <span>Line {content.split('\n').length}, Col {content.length}</span>
                </div>
                <div className="text-[9px] font-black text-claude-accent uppercase tracking-widest">
                    VibeHub Engine v1.0
                </div>
            </div>
        </div>
    );
}
