import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X, Trash2, ChevronUp, ChevronDown, Copy, Check } from 'lucide-react';

export type LogEntry = {
    id: string;
    timestamp: Date;
    type: 'info' | 'error' | 'request' | 'response';
    title: string;
    data?: any;
};

interface DebugConsoleProps {
    logs: LogEntry[];
    isOpen: boolean;
    onToggle: () => void;
    onClear: () => void;
}

export default function DebugConsole({ logs, isOpen, onToggle, onClear }: DebugConsoleProps) {
    const bottomRef = useRef<HTMLDivElement>(null);
    const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Auto-scroll to bottom when new logs arrive (if open)
    useEffect(() => {
        if (isOpen && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, isOpen]);

    const toggleLogExpansion = (id: string) => {
        const newSet = new Set(expandedLogs);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedLogs(newSet);
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (!isOpen) {
        return (
            <button
                onClick={onToggle}
                className="fixed bottom-4 right-4 z-50 bg-black/80 text-green-400 p-3 rounded-full shadow-lg hover:bg-black transition-all border border-green-500/30 backdrop-blur-sm"
                title="Open Debug Console"
            >
                <Terminal size={20} />
                {logs.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                        {logs.length > 99 ? '99+' : logs.length}
                    </span>
                )}
            </button>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 h-96 bg-gray-950 text-gray-200 border-t border-gray-800 shadow-2xl flex flex-col font-mono text-sm transition-transform duration-300 ease-in-out">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 select-none">
                <div className="flex items-center gap-2 text-green-400">
                    <Terminal size={16} />
                    <span className="font-bold">Debug Console</span>
                    <span className="text-gray-500 text-xs ml-2">{logs.length} entries</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onClear}
                        className="p-1.5 hover:bg-red-900/30 text-gray-400 hover:text-red-400 rounded transition-colors"
                        title="Clear logs"
                    >
                        <Trash2 size={16} />
                    </button>
                    <button
                        onClick={onToggle}
                        className="p-1.5 hover:bg-gray-800 text-gray-400 hover:text-white rounded transition-colors"
                        title="Close console"
                    >
                        <ChevronDown size={16} />
                    </button>
                </div>
            </div>

            {/* Logs Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/95 backdrop-blur">
                {logs.length === 0 ? (
                    <div className="text-gray-600 text-center py-10 italic">
                        No logs yet. Waiting for activity...
                    </div>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="border border-gray-800 rounded bg-gray-900/50 overflow-hidden">
                            {/* Log Header */}
                            <div
                                className={`flex items-start gap-3 p-2 cursor-pointer hover:bg-gray-800/50 transition-colors ${log.type === 'error' ? 'text-red-400' :
                                        log.type === 'request' ? 'text-blue-400' :
                                            log.type === 'response' ? 'text-green-400' : 'text-gray-300'
                                    }`}
                                onClick={() => toggleLogExpansion(log.id)}
                            >
                                <span className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">
                                    {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })}
                                </span>
                                <span className={`uppercase text-[10px] font-bold px-1.5 py-0.5 rounded border ${log.type === 'error' ? 'border-red-900 bg-red-900/20' :
                                        log.type === 'request' ? 'border-blue-900 bg-blue-900/20' :
                                            log.type === 'response' ? 'border-green-900 bg-green-900/20' : 'border-gray-700 bg-gray-800'
                                    }`}>
                                    {log.type}
                                </span>
                                <span className="flex-1 truncate font-semibold">{log.title}</span>
                                {expandedLogs.has(log.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>

                            {/* Log Details */}
                            {expandedLogs.has(log.id) && log.data && (
                                <div className="border-t border-gray-800 p-2 bg-black overflow-x-auto relative group">
                                    <button
                                        className="absolute top-2 right-2 p-1 bg-gray-800/80 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            copyToClipboard(JSON.stringify(log.data, null, 2), log.id);
                                        }}
                                        title="Copy JSON"
                                    >
                                        {copiedId === log.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-gray-400" />}
                                    </button>
                                    <pre className="text-xs text-gray-400">
                                        {JSON.stringify(log.data, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
