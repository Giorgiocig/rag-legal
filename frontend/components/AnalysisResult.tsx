"use client";

import { DossierAnalysis } from "@/lib/types";
import { Section } from "./Section";

interface AnalysisResultProps {
  result: DossierAnalysis | null;
}

export default function AnalysisResult({ result }: AnalysisResultProps) {
  if (!result) return null;

  return (
    <div className="space-y-6">
      {/* Sintesi strategica */}
      {result.sintesi_strategica && (
        <div className="px-4 py-3 bg-zinc-900 text-white rounded-lg">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium mb-1">
            Sintesi Strategica
          </p>
          <p className="text-sm">{result.sintesi_strategica}</p>
        </div>
      )}

      <Section
        title="Soggetti"
        fields={[
          ["attore", result.attore],
          ["convenuto", result.convenuto],
          ["avvocato attore", result.avvocato_attore],
          ["avvocato convenuto", result.avvocato_convenuto],
          ["giudice", result.giudice],
        ]}
      />

      <Section
        title="Dati Logistici"
        fields={[
          ["indirizzo", result.indirizzo],
          ["foro competente", result.foro_competente],
          ["sezione tribunale", result.sezione_tribunale],
        ]}
      />

      <Section
        title="Petitum"
        fields={[
          ["totale richiesto", result.totale_richiesto],
          ["domanda riconvenzionale", result.domanda_riconvenzionale],
        ]}
      />

      <Section
        title="Strategia e Rischio"
        fields={[
          ["esito", result.esito],
          ["motivazione", result.motivazione],
          ["punti forza attore", result.punti_forza_attore],
          ["punti debolezza attore", result.punti_debolezza_attore],
          ["punti forza convenuto", result.punti_forza_convenuto],
          ["punti debolezza convenuto", result.punti_debolezza_convenuto],
        ]}
      />
    </div>
  );
}
