"use client";

import { FileText, Trash2 } from "lucide-react";

interface Document {
  id: string;
  filename: string;
  created_at: string;
}

interface DossierDocumentListProps {
  documents: Document[];
  dossierId: string;
  onDeleted: () => void;
}

export default function DossierDocumentList({
  documents,
  dossierId,
  onDeleted,
}: DossierDocumentListProps) {
  if (documents.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">Nessun documento caricato</p>
    );
  }

  const handleDelete = async (documentId: string) => {
    await fetch(
      `http://localhost:8000/dossier/${dossierId}/documents/${documentId}`,
      {
        method: "DELETE",
      },
    );
    onDeleted();
  };

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
          <button
            onClick={() => handleDelete(doc.id)}
            className="text-zinc-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
