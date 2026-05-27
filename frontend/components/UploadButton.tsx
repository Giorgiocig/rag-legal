"use client";

import { useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/constants";

interface UploadButtonProps {
  onUploadComplete: () => void;
}

export default function UploadButton({ onUploadComplete }: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    await fetch(`${API_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    setIsUploading(false);
    onUploadComplete();
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
        className="w-full"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? (
          <>
            <Loader2 size={14} className="animate-spin mr-2" /> Caricamento...
          </>
        ) : (
          <>
            <Upload size={14} className="mr-2" /> Carica documento
          </>
        )}
      </Button>
    </>
  );
}
