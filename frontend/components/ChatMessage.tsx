"use client";

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

  const parts_split = message.content.split("###SOURCES###");
  let displayText = parts_split[0];
  displayText = displayText.replace(/ARTICOLI_USATI:[\d,\s]+/g, "").trim();
  const sources: Source[] = parts_split[1] ? JSON.parse(parts_split[1]) : [];

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className="max-w-[75%] space-y-2">
        {isUser ? (
          <div
            style={{ backgroundColor: "var(--color-accent)" }}
            className="text-white text-base px-5 py-3 rounded-2xl rounded-br-sm font-body"
          >
            {displayText}
          </div>
        ) : (
          <div
            style={{ color: "var(--color-ink)" }}
            className="text-base leading-relaxed font-body"
          >
            {displayText}
          </div>
        )}

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
