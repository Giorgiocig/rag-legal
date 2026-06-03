"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Loader2, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { API_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface UploadButtonProps {
  onUploadComplete: () => void;
}

export default function UploadButton({ onUploadComplete }: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startProgress = () => {
    setProgress(0);
    intervalRef.current = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 5 : prev));
    }, 500);
  };

  const stopProgress = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(100);
    setTimeout(() => setProgress(0), 500);
  };

  const uploadFile = async (file: File) => {
    if (!file.name.endsWith(".pdf")) {
      toast.error("Solo file PDF sono supportati");
      return;
    }

    setIsUploading(true);
    startProgress();

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error();

      stopProgress();
      toast.success("Documento caricato con successo");
      onUploadComplete();
    } catch {
      toast.error("Errore durante il caricamento del documento");
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
  }, []);

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleInputChange}
      />
      <div
        onClick={() => !isUploading && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "w-full flex flex-col items-center justify-center gap-2 px-4 py-5 rounded-xl border-2 border-dashed transition-all cursor-pointer",
          isDragging
            ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
            : "border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5",
          isUploading && "pointer-events-none opacity-70",
        )}
      >
        {isUploading ? (
          <Loader2
            size={18}
            className="animate-spin"
            style={{ color: "var(--color-accent)" }}
          />
        ) : isDragging ? (
          <FileText size={18} style={{ color: "var(--color-accent)" }} />
        ) : (
          <Upload size={18} style={{ color: "var(--color-muted)" }} />
        )}
        <p
          className="text-xs font-body text-center"
          style={{ color: "var(--color-muted)" }}
        >
          {isUploading
            ? "Caricamento in corso..."
            : isDragging
              ? "Rilascia il file"
              : "Trascina un PDF o clicca"}
        </p>
      </div>
      {isUploading && <Progress value={progress} className="h-0.5" />}
    </div>
  );
}
