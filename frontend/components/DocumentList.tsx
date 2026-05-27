"use client";

import { FileText } from "lucide-react";

interface Document {
  id: string;
  filename: string;
  created_at: string;
}

interface DossierDocumentListProps {
  documents: Document[];
}

export default function DossierDocumentList({
  documents,
}: DossierDocumentListProps) {
  if (documents.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">Nessun documento caricato</p>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center gap-3 px-4 py-3 bg-zinc-50 rounded-lg border border-zinc-200"
        >
          <FileText size={14} className="shrink-0 text-zinc-400" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{doc.filename}</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">{doc.created_at}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
