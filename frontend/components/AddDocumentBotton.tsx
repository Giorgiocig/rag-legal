"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
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
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    await fetch(`${API_URL}/dossier/${dossierId}/upload`, {
      method: "POST",
      body: formData,
    });

    setIsLoading(false);
    onUploaded();
  };

  return (
    <>
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
    </>
  );
}
