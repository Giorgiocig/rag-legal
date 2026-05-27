"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { API_URL } from "@/lib/constants";
import { DossierAnalysis } from "@/lib/types";

interface AnalyzeButtonProps {
  dossierId: string;
  onResult: (result: DossierAnalysis) => void;
}

export default function AnalyzeButton({
  dossierId,
  onResult,
}: AnalyzeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/dossier/${dossierId}/analyze`, {
        method: "POST",
      });
      console.log("Status:", res.status);
      const data = await res.json();
      console.log("Data:", data);
      onResult(data);
    } catch (err) {
      console.error("Errore:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
}
