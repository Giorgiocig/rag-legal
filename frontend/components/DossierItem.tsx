import { Dossier } from "@/lib/interfaces";

export default function DossierItem(dossier: Dossier) {
  return (
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium truncate">{dossier.nome}</p>
      <p className="text-[10px] mt-0.5 text-zinc-400">{dossier.created_at}</p>
    </div>
  );
}
