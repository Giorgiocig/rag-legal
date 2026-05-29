"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { API_URL } from "@/lib/constants";
import { DossierAnalysis } from "@/lib/types";
import { toast } from "sonner";
import { Progress } from "./ui/progress";

interface AnalyzeButtonProps {
  dossierId: string;
  onResult: (result: DossierAnalysis) => void;
}

export default function AnalyzeButton({
  dossierId,
  onResult,
}: AnalyzeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startProgress = () => {
    setProgress(0);
    intervalRef.current = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 3 : prev));
    }, 800);
  };

  const stopProgress = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(100);
    setTimeout(() => setProgress(0), 500);
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    startProgress();

    try {
      const res = await fetch(`${API_URL}/dossier/${dossierId}/analyze`, {
        method: "POST",
      });

      if (!res.ok) throw new Error();

      const data: DossierAnalysis = await res.json();
      stopProgress();
      onResult(data);
      toast.success("Analisi completata");
    } catch {
      toast.error("Errore durante l'analisi del dossier");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button
        onClick={handleAnalyze}
        disabled={isLoading}
        className="bg-zinc-900 hover:bg-zinc-700"
      >
        {isLoading ? (
          <>
            <Loader2 size={14} className="animate-spin mr-2" />
            Analisi in corso...
          </>
        ) : (
          <>
            <Search size={14} className="mr-2" />
            Analizza Dossier
          </>
        )}
      </Button>
      {isLoading && <Progress value={progress} className="h-1 mt-2" />}
    </div>
  );
}
