"use client";

import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { useEffect, useRef, useState } from "react";
import { API_URL } from "@/lib/constants";
import { toast } from "sonner";

interface ChatWindowProps {
  documentId: string | null;
}

export default function ChatWindow({ documentId }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: string; content: string; id: string }[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const question = input;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: question, id: crypto.randomUUID() },
    ]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, document_id: documentId }),
      });

      if (!response.ok) throw new Error();

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", id: crypto.randomUUID() },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        assistantMessage += decoder.decode(value);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: assistantMessage,
          };
          return updated;
        });
      }
    } catch {
      toast.error("Errore durante la risposta del modello");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen flex-1">
      {/* Messaggi */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">
              {documentId
                ? "Fai una domanda sul documento."
                : "Seleziona un documento per iniziare."}
            </p>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex gap-1 px-1">
            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput
        input={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        disabled={!documentId}
      />
    </div>
  );
}
