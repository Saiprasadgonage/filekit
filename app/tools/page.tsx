import Link from "next/link";
import { TOOLS } from "@/lib/tools";

export default function ToolsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-semibold text-paper">All tools</h1>
      <p className="mt-2 text-dim">Free tools run five jobs a day per browser. Pro removes the limit.</p>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((t) => (
          <Link
            key={t.slug}
            href={`/tools/${t.slug}`}
            className="border border-line rounded-lg p-5 hover:border-amber transition-colors bg-panel"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{t.icon}</span>
              {t.pro && (
                <span className="tag bg-amber/10 text-amber px-2 py-0.5 rounded-sm border border-amber/30">
                  PRO
                </span>
              )}
            </div>
            <h3 className="mt-4 font-medium text-paper">{t.name}</h3>
            <p className="mt-1.5 text-sm text-dim leading-relaxed">{t.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
