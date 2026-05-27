"use client";

import { UIMessage } from "ai";
import { cn } from "@/lib/utils";
import SourceBadge from "./SourceBadge";

interface Source {
  page: number;
  article: string;
}

interface Message {
  role: string;
  content: string;
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  // estrai fonti dal testo se presenti

  const parts_split = message.content.split("###SOURCES###");
  let displayText = parts_split[0];
  displayText = displayText.replace(/ARTICOLI_USATI:[\d,]+/g, "").trim();
  const sources: Source[] = parts_split[1] ? JSON.parse(parts_split[1]) : [];

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[75%] space-y-2")}>
        {/* Bubble utente / testo libero assistente */}
        {isUser ? (
          <div className="bg-zinc-900 text-white text-sm px-4 py-2.5 rounded-2xl rounded-br-sm">
            {displayText}
          </div>
        ) : (
          <div className="text-sm text-zinc-800 leading-relaxed">
            {displayText}
          </div>
        )}

        {/* Fonti */}
        {sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {sources.map((s, i) => (
              <SourceBadge key={i} article={s.article} page={s.page} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
