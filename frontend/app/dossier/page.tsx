"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dossier } from "@/lib/interfaces";
import DossierList from "@/components/DossierList";
import AddDocumentButton from "@/components/AddDocumentBotton";
import AnalyzeButton from "@/components/AnalyzeButton";
import DossierDocumentList from "@/components/DocumentList";
import AnalysisResult from "@/components/AnalysisResult";
import CreateDossierModal from "@/components/CreateDossierModal";
import { API_URL } from "@/lib/constants";
import { DossierAnalysis } from "@/lib/types";
interface Document {
  id: string;
  filename: string;
  created_at: string;
}

export default function DossierPage() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [analysisResult, setAnalysisResult] = useState<DossierAnalysis | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);

  const fetchDossiers = async () => {
    const res = await fetch(`${API_URL}/dossiers`);
    const data = await res.json();
    setDossiers(data.dossiers);
  };

  const fetchDocuments = async (dossierId: string) => {
    const res = await fetch(`${API_URL}/dossier/${dossierId}/documents`);
    const data = await res.json();
    setDocuments(data.documents);
  };

  useEffect(() => {
    fetchDossiers();
  }, []);

  useEffect(() => {
    console.log("analysisResult:", analysisResult);
  }, [analysisResult]);

  useEffect(() => {
    if (selectedId) {
      fetchDocuments(selectedId);
      setAnalysisResult(null);
    } else {
      setDocuments([]);
      setAnalysisResult(null);
    }
  }, [selectedId]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-72 border-r border-zinc-200 bg-zinc-50 flex flex-col">
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
            Dossier
          </p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setModalOpen(true)}
          >
            <Plus size={14} />
          </Button>
        </div>

        <DossierList
          dossiers={dossiers}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </aside>

      {/* Main */}
      <main className=" p-8 overflow-y-auto">
        {selectedId ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <AddDocumentButton
                dossierId={selectedId}
                onUploaded={() => fetchDocuments(selectedId)}
              />
              <AnalyzeButton
                dossierId={selectedId}
                onResult={setAnalysisResult}
              />
            </div>
            <DossierDocumentList
              documents={documents}
              dossierId={selectedId}
              onDeleted={() => fetchDocuments(selectedId)}
            />
            <AnalysisResult result={analysisResult} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">
              Seleziona un dossier per iniziare
            </p>
          </div>
        )}
      </main>

      <CreateDossierModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={fetchDossiers}
      />
    </div>
  );
}
