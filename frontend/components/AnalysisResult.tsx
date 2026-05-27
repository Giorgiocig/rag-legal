"use client";

import { DossierAnalysis } from "@/lib/types";

interface AnalysisResultProps {
  result: DossierAnalysis | null;
}

export default function AnalysisResult({ result }: AnalysisResultProps) {
  if (!result) return null;

  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
        Analisi Dossier
      </p>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(result).map(
          ([key, value]) =>
            value && (
              <div
                key={key}
                className="px-4 py-3 bg-zinc-50 rounded-lg border border-zinc-200"
              >
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                  {key.replace(/_/g, " ")}
                </p>
                <p className="text-xs font-medium text-zinc-800 mt-1">
                  {value}
                </p>
              </div>
            ),
        )}
      </div>
    </div>
  );
}
