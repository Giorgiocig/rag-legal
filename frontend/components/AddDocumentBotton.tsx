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
  const [currentFile, setCurrentFile] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<boolean> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/dossier/${dossierId}/upload`, {
      method: "POST",
      body: formData,
    });

    return res.ok;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const invalidFiles = files.filter((f) => !f.name.endsWith(".pdf"));
    if (invalidFiles.length > 0) {
      toast.error("Solo file PDF sono supportati");
      return;
    }

    setIsLoading(true);
    setProgress(0);

    let completed = 0;
    let failed = 0;

    for (const file of files) {
      setCurrentFile(file.name);
      try {
        const ok = await uploadFile(file);
        if (ok) {
          completed++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
      setProgress(Math.round(((completed + failed) / files.length) * 100));
    }

    setIsLoading(false);
    setCurrentFile("");

    if (failed === 0) {
      toast.success(
        `${completed} documento${completed > 1 ? "i" : ""} caricato${completed > 1 ? "i" : ""} con successo`,
      );
    } else {
      toast.warning(`${completed} caricati, ${failed} falliti`);
    }

    onUploaded();
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        multiple
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
            {currentFile ? `Caricamento ${currentFile}...` : "Caricamento..."}
          </>
        ) : (
          <>
            <Upload size={14} className="mr-2" />
            Aggiungi documenti
          </>
        )}
      </Button>
      {isLoading && <Progress value={progress} className="h-1" />}
    </div>
  );
}
