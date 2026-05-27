"use client";

import { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import DocumentSidebar, { Document } from "@/components/DocumentSidebar";
import ChatWindow from "@/components/ChatWindow";
import { API_URL } from "@/lib/constants";

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);

  const fetchDocuments = async () => {
    const res = await fetch(`${API_URL}/documents`);
    if (!res.ok) throw new Error("error during fetch");
    const data = await res.json();
    setDocuments(data.documents);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <DocumentSidebar
          documents={documents}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onUploadComplete={fetchDocuments}
        />
        <main className="flex-1 overflow-hidden">
          <ChatWindow documentId={selectedId} />
        </main>
      </div>
    </SidebarProvider>
  );
}
