import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

interface SourceBadgeProps {
  article: string;
  page: number;
}

export default function SourceBadge({ article, page }: SourceBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="text-[10px] gap-1.5 px-2 py-1 text-zinc-500 border-zinc-200"
    >
      <FileText size={10} />
      Art. {article} · p. {page}
    </Badge>
  );
}
