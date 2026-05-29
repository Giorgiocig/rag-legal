"use client";

import { useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { API_URL } from "@/lib/constants";

interface AddDocumentButtonProps {
  dossierId: string;
  onUploaded: () => void;
}

export default function AddDocumentButton({
  dossierId,
  onUploaded,
}: AddDocumentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".pdf")) {
      toast.error("Solo file PDF sono supportati");
      return;
    }

    setIsLoading(true);
    startProgress();

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/dossier/${dossierId}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error();

      stopProgress();
      toast.success("Documento aggiunto al dossier");
      onUploaded();
    } catch {
      toast.error("Errore durante il caricamento del documento");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleUpload}
      />
      <Button
        variant="outline"
        size="sm"
        disabled={isLoading}
        onClick={() => inputRef.current?.click()}
      >
        {isLoading ? (
          <>
            <Loader2 size={14} className="animate-spin mr-2" />
            Caricamento...
          </>
        ) : (
          <>
            <Upload size={14} className="mr-2" />
            Aggiungi documento
          </>
        )}
      </Button>
      {isLoading && <Progress value={progress} className="h-1" />}
    </div>
  );
}
