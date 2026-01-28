export type Message = {
    id: string;
    role: "user" | "assistant";
    content: string | any[];
    reasoning?: string;
    modelId?: string;
    files?: { name: string; type: string; url?: string }[];
};

export type Chat = {
    id: string;
    title: string;
    model: string;
    messages: Message[];
    createdAt: number;
    last_updated?: string;
};
