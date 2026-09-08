"use client";

import { useState, useRef } from "react";
import ToolShell from "@/components/ToolShell";
import UpgradeGate from "@/components/UpgradeGate";
import ResumeWizard from "@/components/resume/ResumeWizard";
import StylePicker from "@/components/resume/StylePicker";
import ClassicTemplate from "@/components/resume/ClassicTemplate";
import ModernTemplate from "@/components/resume/ModernTemplate";
import MinimalTemplate from "@/components/resume/MinimalTemplate";
import { emptyResume, ResumeData, TemplateId } from "@/components/resume/types";

type Phase = "questions" | "style" | "preview";

export default function ResumeGeneratorTool() {
  const [phase, setPhase] = useState<Phase>("questions");
  const [data, setData] = useState<ResumeData>(emptyResume);
  const [template, setTemplate] = useState<TemplateId>("classic");
  const [busy, setBusy] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  async function handleDownload() {
    if (!previewRef.current) return;
    setBusy(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: 0,
          filename: `${data.name || "resume"}.pdf`.replace(/\s+/g, "-").toLowerCase(),
          html2canvas: { scale: 2 },
          jsPDF: { unit: "pt", format: "a4" }
        })
        .from(previewRef.current)
        .save();
    } finally {
      setBusy(false);
    }
  }

  function renderTemplate() {
    if (template === "modern") return <ModernTemplate data={data} />;
    if (template === "minimal") return <MinimalTemplate data={data} />;
    return <ClassicTemplate data={data} />;
  }

  return (
    <ToolShell slug="resume-generator">
      <UpgradeGate isPro={true}>
        {phase === "questions" && (
          <ResumeWizard data={data} onChange={setData} onDone={() => setPhase("style")} />
        )}

        {phase === "style" && (
          <div>
            <StylePicker selected={template} onSelect={setTemplate} />
            <div className="flex items-center justify-between mt-8">
              <button onClick={() => setPhase("questions")} className="text-dim hover:text-paper text-sm">
                ← Back to answers
              </button>
              <button
                onClick={() => setPhase("preview")}
                className="bg-amber text-ink font-medium px-5 py-2.5 rounded-sm hover:bg-amberDeep transition-colors"
              >
                Preview resume →
              </button>
            </div>
          </div>
        )}

        {phase === "preview" && (
          <div>
            <div className="bg-white rounded-md overflow-hidden max-h-[32rem] overflow-y-auto">
              <div ref={previewRef}>{renderTemplate()}</div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex gap-4">
                <button onClick={() => setPhase("style")} className="text-dim hover:text-paper text-sm">
                  ← Change style
                </button>
                <button onClick={() => setPhase("questions")} className="text-dim hover:text-paper text-sm">
                  Edit answers
                </button>
              </div>
              <button
                onClick={handleDownload}
                disabled={busy}
                className="bg-amber text-ink font-medium px-5 py-2.5 rounded-sm hover:bg-amberDeep transition-colors disabled:opacity-60"
              >
                {busy ? "Building PDF…" : "Download PDF"}
              </button>
            </div>
          </div>
        )}
      </UpgradeGate>
    </ToolShell>
  );
}
