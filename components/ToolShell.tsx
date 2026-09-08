import { getTool } from "@/lib/tools";

export default function ToolShell({
  slug,
  children
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const tool = getTool(slug);
  if (!tool) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{tool.icon}</span>
        <div>
          <h1 className="text-2xl font-semibold text-paper">{tool.name}</h1>
          <p className="tag text-dim">{tool.format}</p>
        </div>
        {tool.pro && (
          <span className="tag bg-amber/10 text-amber px-2 py-0.5 rounded-sm border border-amber/30 ml-auto">
            PRO
          </span>
        )}
      </div>
      <p className="mt-3 text-dim">{tool.description}</p>
      <div className="mt-8 border border-line rounded-lg bg-panel p-6">{children}</div>
    </div>
  );
}
