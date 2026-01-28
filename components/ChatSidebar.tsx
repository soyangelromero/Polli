import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { Chat } from "../lib/types"; // We need to define types somewhere or inline them

interface ChatSidebarProps {
    chats: any[];
    currentChatId: string | null;
    t: any;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    createNewChat: () => void;
    setCurrentChatId: (id: string) => void;
    deleteChat: (id: string, e: React.MouseEvent) => void;
    language: "en" | "es";
    setLanguage: (lang: "en" | "es") => void;
    onLogout: () => void;
}

export function ChatSidebar({
    chats,
    currentChatId,
    t,
    searchTerm,
    setSearchTerm,
    createNewChat,
    setCurrentChatId,
    deleteChat,
    language,
    setLanguage,
    onLogout
}: ChatSidebarProps) {
    return (
        <div className="w-72 bg-claude-sidebar/80 backdrop-blur-xl hidden md:flex flex-col border-r border-white/[0.04] transition-all z-30">
            <div className="p-4">
                <button
                    onClick={createNewChat}
                    className="w-full h-12 flex items-center justify-start gap-3 px-4 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-white/50 dark:hover:bg-white/5 transition-all font-medium text-gray-700 dark:text-gray-200"
                >
                    <Plus size={20} className="text-claude-accent" />
                    <span>{t.newChat}</span>
                </button>
                <div className="mt-4 relative">
                    <input
                        type="text"
                        placeholder={t.searchHistory}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 pl-9 pr-4 rounded-xl bg-gray-200/50 dark:bg-gray-800/50 border-none text-xs font-medium focus:ring-1 focus:ring-claude-accent/30 transition-all outline-none"
                    />
                    <MessageSquare size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-4">
                <div className="text-[11px] font-bold text-gray-400 px-3 py-2 uppercase tracking-[0.1em] flex justify-between items-center">
                    <span>{t.conversations}</span>
                </div>
                {chats.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase())).map((chat) => (
                    <div
                        key={chat.id}
                        onClick={() => setCurrentChatId(chat.id)}
                        className={`group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${currentChatId === chat.id ? "bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700" : "hover:bg-gray-200/50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400"}`}
                    >
                        <MessageSquare size={17} className={currentChatId === chat.id ? "text-claude-accent" : "text-gray-400"} />
                        <div className="flex-1 truncate text-sm font-medium pr-1">
                            {chat.title}
                        </div>
                        <button
                            onClick={(e) => deleteChat(chat.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md transition-all text-gray-400 hover:text-red-500"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
                {chats.length === 0 && (
                    <div className="text-sm text-gray-400 px-3 py-10 text-center italic">No hay chats aún</div>
                )}
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t dark:border-gray-800 bg-claude-sidebar/50 space-y-2">
                <div className="px-3 pb-2">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t.language}</div>
                    <div className="flex bg-gray-200/50 dark:bg-gray-800/50 rounded-lg p-1">
                        <button
                            onClick={() => setLanguage("en")}
                            className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${language === 'en' ? 'bg-white dark:bg-gray-700 shadow-sm text-claude-accent' : 'text-gray-400'}`}
                        >
                            EN
                        </button>
                        <button
                            onClick={() => setLanguage("es")}
                            className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${language === 'es' ? 'bg-white dark:bg-gray-700 shadow-sm text-claude-accent' : 'text-gray-400'}`}
                        >
                            ES
                        </button>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-all text-xs font-bold"
                >
                    <Trash2 size={16} />
                    <span>{t.logoutBtn}</span>
                </button>
                <div className="pt-4 flex justify-center opacity-40 hover:opacity-100 transition-opacity">
                    <img
                        src="https://raw.githubusercontent.com/pollinations/pollinations/main/assets/logo.svg"
                        alt="Pollinations Logo"
                        className="h-6 w-auto invert dark:invert-0 brightness-200"
                    />
                </div>
            </div>
        </div>
    );
}
