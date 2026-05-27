"use client";

import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dossier } from "@/lib/interfaces";
import DossierItem from "./DossierItem";

interface DossierListProps {
  dossiers: Dossier[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function DossierList({
  dossiers,
  selectedId,
  onSelect,
}: DossierListProps) {
  if (!dossiers) {
    return (
      <p className="text-sm text-muted-foreground text-center mt-12">
        Nessun dossier presente
      </p>
    );
  }

  return (
    <div className="space-y-2 p-4">
      {dossiers.map((dossier) => (
        <button
          key={dossier.id}
          onClick={() => onSelect(dossier.id)}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all",
            selectedId === dossier.id
              ? "bg-zinc-900 text-white"
              : "hover:bg-zinc-100 text-zinc-700",
          )}
        >
          <FolderOpen size={14} className="shrink-0" />
          <DossierItem {...dossier} />
        </button>
      ))}
    </div>
  );
}
