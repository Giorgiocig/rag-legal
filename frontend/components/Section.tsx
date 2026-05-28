export const Section = ({
  title,
  fields,
}: {
  title: string;
  fields: [string, string | null][];
}) => {
  const visible = fields.filter(([_, v]) => v);
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {visible.map(([key, value]) => (
          <div
            key={key}
            className="px-4 py-3 bg-zinc-50 rounded-lg border border-zinc-200"
          >
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
              {key.replace(/_/g, " ")}
            </p>
            <p className="text-xs font-medium text-zinc-800 mt-1">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
