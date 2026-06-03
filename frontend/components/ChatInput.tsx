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
    <div
      className="px-8 py-5"
      style={{ borderTop: "1px solid var(--color-border)" }}
    >
      <form onSubmit={onSubmit} className="flex items-end gap-3">
        <Textarea
          value={input}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled ? "Seleziona un documento..." : "Fai una domanda..."
          }
          disabled={disabled || isLoading}
          rows={1}
          className="resize-none min-h-[48px] max-h-[200px] text-base font-body rounded-xl"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--color-border)",
            color: "var(--color-ink)",
          }}
        />
        <Button
          type="submit"
          size="icon"
          disabled={disabled || isLoading || !input.trim()}
          className="shrink-0 w-12 h-12 rounded-xl"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          <ArrowUp size={18} />
        </Button>
      </form>
      <p
        className="text-xs text-center mt-2 font-body"
        style={{ color: "var(--color-muted)" }}
      >
        Invio per inviare · Shift+Invio per andare a capo
      </p>
    </div>
  );
}
