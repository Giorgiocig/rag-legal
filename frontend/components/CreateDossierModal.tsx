"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X, FileText } from "lucide-react";
import { API_URL } from "@/lib/constants";
import { toast } from "sonner";
import { Progress } from "./ui/progress";

interface CreateDossierModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateDossierModal({
  open,
  onClose,
  onCreated,
}: CreateDossierModalProps) {
  const [nome, setNome] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!nome.trim() || !file) return;
    setIsLoading(true);
    startProgress();

    try {
      const res = await fetch(`${API_URL}/dossier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      const dossierId = data.dossier_id;

      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch(`${API_URL}/dossier/${dossierId}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error();

      stopProgress();
      toast.success("Dossier creato con successo");
      setNome("");
      setFile(null);
      onCreated();
      onClose();
    } catch {
      toast.error("Errore durante la creazione del dossier");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuovo Dossier</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <Input
            placeholder="Nome dossier"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          {isLoading && <Progress value={progress} className="h-1" />}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => inputRef.current?.click()}
          >
            <Upload size={14} className="mr-2" />
            Aggiungi documenti
          </Button>

          {file && (
            <div className="flex items-center gap-2 text-xs text-zinc-600 px-2 py-1 bg-zinc-50 rounded">
              <FileText size={12} />
              <span className="flex-1 truncate">{file.name}</span>
              <button onClick={() => setFile(null)}>
                <X size={12} className="text-zinc-400 hover:text-red-500" />
              </button>
            </div>
          )}

          <Button
            className="w-full bg-zinc-900 hover:bg-zinc-700"
            disabled={!nome.trim() || isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin mr-2" />
                Caricamento...
              </>
            ) : (
              "Crea Dossier"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
