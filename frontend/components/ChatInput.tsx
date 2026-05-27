"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { FormEvent, KeyboardEvent } from "react";

interface ChatInputProps {
  input: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  disabled: boolean;
}

export default function ChatInput({
  input,
  onChange,
  onSubmit,
  isLoading,
  disabled,
}: ChatInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e as unknown as FormEvent<HTMLFormElement>);
    }
  };

  return (
    <div className="px-6 py-4 border-t border-zinc-200">
      <form onSubmit={onSubmit} className="flex items-end gap-2">
        <Textarea
          value={input}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled ? "Seleziona un documento..." : "Fai una domanda..."
          }
          disabled={disabled || isLoading}
          rows={1}
          className="resize-none min-h-[42px] max-h-[200px] text-sm"
        />
        <Button
          type="submit"
          size="icon"
          disabled={disabled || isLoading || !input.trim()}
          className="shrink-0 bg-zinc-900 hover:bg-zinc-700"
        >
          <ArrowUp size={16} />
        </Button>
      </form>
      <p className="text-[10px] text-muted-foreground text-center mt-2">
        Invio per inviare · Shift+Invio per andare a capo
      </p>
    </div>
  );
}
