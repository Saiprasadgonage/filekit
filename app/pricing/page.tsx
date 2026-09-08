"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";

const FREE_FEATURES = [
  "Image crop / resize / compress",
  "PDF merge",
  "PDF size reducer",
  "Word → PDF",
  "Background remover",
  "Audio noise reducer",
  "5 jobs per tool per day"
];

const PRO_FEATURES = [
  "Everything in Free, unlimited",
  "PDF editor (text, rotate, reorder pages)",
  "Word editor with .docx export",
  "Watermark eraser for your own images",
  "AI image generator",
  "AI sound generator",
  "Priority processing queue"
];

export default function PricingPage() {
  const { data: session } = useSession();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    if (!session) {
      signIn(undefined, { callbackUrl: "/pricing" });
      return;
    }
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ billing })
    });
    const data = await res.json();
    setLoading(false);
    if (data.url) window.location.href = data.url;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-semibold text-paper text-center">Plans</h1>
      <p className="text-dim text-center mt-2">Start free. Upgrade when you hit a limit or need a Pro tool.</p>

      <div className="flex justify-center mt-8">
        <div className="inline-flex border border-line rounded-sm p-1 bg-panel2">
          {(["monthly", "yearly"] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={`px-4 py-1.5 text-sm rounded-sm transition-colors ${
                billing === b ? "bg-amber text-ink" : "text-dim"
              }`}
            >
              {b === "monthly" ? "Monthly" : "Yearly (2 months free)"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-10">
        <div className="border border-line rounded-lg p-8 bg-panel">
          <h2 className="text-lg font-medium text-paper">Free</h2>
          <p className="text-3xl font-semibold text-paper mt-2">$0</p>
          <p className="text-dim text-sm mt-1">No card needed</p>
          <ul className="mt-6 space-y-3 text-sm">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex gap-2 text-dim">
                <span className="text-teal">✓</span> {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-2 border-amber rounded-lg p-8 bg-panel relative">
          <span className="absolute -top-3 left-8 tag bg-amber text-ink px-2 py-0.5 rounded-sm">
            MOST POPULAR
          </span>
          <h2 className="text-lg font-medium text-paper">Pro</h2>
          <p className="text-3xl font-semibold text-paper mt-2">
            {billing === "monthly" ? "$9" : "$90"}
            <span className="text-base font-normal text-dim">
              /{billing === "monthly" ? "mo" : "yr"}
            </span>
          </p>
          <p className="text-dim text-sm mt-1">Cancel anytime</p>
          <ul className="mt-6 space-y-3 text-sm">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex gap-2 text-paper">
                <span className="text-amber">✓</span> {f}
              </li>
            ))}
          </ul>
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="mt-8 w-full bg-amber text-ink font-medium py-2.5 rounded-sm hover:bg-amberDeep transition-colors disabled:opacity-60"
          >
            {loading ? "Redirecting…" : "Upgrade to Pro"}
          </button>
        </div>
      </div>
    </div>
  );
}
