"use client";

import { Trash2 } from "lucide-react";

import { FileText, ChevronRight } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import UploadButton from "./UploadButton";
import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/constants";

export interface Document {
  id: string;
  name: string;
  uploadedAt: string;
}

interface DocumentSidebarProps {
  documents: Document[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUploadComplete: () => void;
}

export default function DocumentSidebar({
  documents,
  selectedId,
  onSelect,
  onUploadComplete,
}: DocumentSidebarProps) {
  async function deleteDocument(id: string) {
    await fetch(`${API_URL}/documents/${id}`, {
      method: "DELETE",
    });
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-5 py-4 flex flex-row items-center justify-between">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium group-data-[collapsible=icon]:hidden">
          Documenti
        </p>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="gap-y-1">
          {documents.length === 0 && (
            <p className="text-xs text-muted-foreground text-center mt-8">
              Nessun documento caricato
            </p>
          )}

          {documents.map((doc) => (
            <SidebarMenuItem key={doc.id}>
              <SidebarMenuButton
                isActive={selectedId === doc.id}
                onClick={() => onSelect(doc.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-2",
                  selectedId === doc.id
                    ? "bg-zinc-900 text-white hover:bg-zinc-800"
                    : "hover:bg-zinc-100",
                )}
              >
                <FileText size={14} className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{doc.name}</p>
                  <p
                    className={cn(
                      "text-[10px] mt-0.5",
                      selectedId === doc.id ? "text-zinc-400" : "text-zinc-400",
                    )}
                  >
                    {doc.uploadedAt}
                  </p>
                </div>
                {selectedId === doc.id && (
                  <ChevronRight size={12} className="shrink-0" />
                )}
              </SidebarMenuButton>
              <button
                onClick={async () => {
                  await deleteDocument(doc.id);
                  onUploadComplete();
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 mr-2 text-zinc-400 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <UploadButton onUploadComplete={onUploadComplete} />
      </SidebarFooter>
    </Sidebar>
  );
}
