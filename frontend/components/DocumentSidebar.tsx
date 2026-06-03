"use client";

import {
  ArrowLeft,
  Trash2,
  FileText,
  ChevronRight,
  Upload,
} from "lucide-react";
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
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

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
  const router = useRouter();

  async function deleteDocument(id: string) {
    await fetch(`${API_URL}/documents/${id}`, { method: "DELETE" });
    onUploadComplete();
  }

  return (
    <Sidebar
      collapsible="icon"
      style={{
        backgroundColor: "var(--color-bg)",
        borderRight: "1px solid var(--color-border)",
      }}
    >
      <SidebarHeader
        className="px-4 py-4 flex flex-row items-center justify-between"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <p
          className="text-[10px] uppercase tracking-widest font-display font-semibold group-data-[collapsible=icon]:hidden"
          style={{ color: "var(--color-muted)" }}
        >
          Contratti
        </p>
        <SidebarTrigger />
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarMenu className="gap-y-1">
          {documents.length === 0 && (
            <p
              className="text-xs text-center mt-8 font-body group-data-[collapsible=icon]:hidden"
              style={{ color: "var(--color-muted)" }}
            >
              Nessun contratto caricato
            </p>
          )}

          {documents.map((doc) => (
            <SidebarMenuItem key={doc.id} className="group/item">
              <SidebarMenuButton
                isActive={selectedId === doc.id}
                onClick={() => onSelect(doc.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-all",
                  selectedId === doc.id ? "text-white" : "hover:bg-zinc-100",
                )}
                style={
                  selectedId === doc.id
                    ? { backgroundColor: "var(--color-accent)" }
                    : {}
                }
              >
                <FileText size={14} className="shrink-0" />
                <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                  <p className="text-xs font-medium truncate font-body">
                    {doc.name}
                  </p>
                  <p className="text-[10px] mt-0.5 opacity-60">
                    {doc.uploadedAt}
                  </p>
                </div>
                {selectedId === doc.id && (
                  <ChevronRight
                    size={12}
                    className="shrink-0 group-data-[collapsible=icon]:hidden"
                  />
                )}
              </SidebarMenuButton>
              <button
                onClick={() => deleteDocument(doc.id)}
                className="opacity-0 group-hover/item:opacity-100 transition-opacity p-1 mr-1 rounded hover:text-red-500"
                style={{ color: "var(--color-muted)" }}
              >
                <Trash2 size={13} />
              </button>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter
        className="p-4 group-data-[collapsible=icon]:hidden"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <UploadButton onUploadComplete={onUploadComplete} />
      </SidebarFooter>
    </Sidebar>
  );
}
