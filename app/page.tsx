import Link from "next/link";
import { TOOLS } from "@/lib/tools";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 grid md:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div>
          <p className="tag text-teal mb-4">PDF · DOCX · PNG · JPG · WAV · MP3</p>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-paper">
            Fix your file,
            <br />
            then get on with it.
          </h1>
          <p className="mt-6 text-lg text-dim max-w-md leading-relaxed">
            Convert, compress, crop and clean up documents, images and audio
            in your browser. Five free jobs a day, no watermark, no signup
            wall on the free tools.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link
              href="/tools"
              className="bg-amber text-ink font-medium px-6 py-3 rounded-sm hover:bg-amberDeep transition-colors"
            >
              Browse tools
            </Link>
            <Link href="/pricing" className="text-paper underline underline-offset-4 decoration-line">
              See Pro plan
            </Link>
          </div>
        </div>

        <div className="border border-line rounded-lg bg-panel p-2">
          <div className="grid grid-cols-3 gap-2">
            {TOOLS.slice(0, 9).map((t) => (
              <Link
                key={t.slug}
                href={`/tools/${t.slug}`}
                className="group bg-panel2 border border-line rounded-md p-3 hover:border-amber transition-colors"
              >
                <div className="text-xl">{t.icon}</div>
                <div className="mt-2 text-xs text-paper leading-tight">{t.name}</div>
                <div className="tag text-dim mt-1">{t.format}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tool list */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-line">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-2xl font-semibold text-paper">Every tool</h2>
          <Link href="/tools" className="text-sm text-dim hover:text-paper">
            View all →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </section>

      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-10 flex items-center justify-between text-sm text-dim">
          <span>filekit</span>
          <span className="tag">Processing runs in your browser unless noted otherwise.</span>
        </div>
      </footer>
    </div>
  );
}
