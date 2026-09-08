"use client";

import { useState } from "react";

export default function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (data.url) window.location.href = data.url;
  }

  return (
    <button
      onClick={openPortal}
      disabled={loading}
      className="border border-line text-paper px-4 py-2 rounded-sm hover:border-amber transition-colors disabled:opacity-60"
    >
      {loading ? "Opening…" : "Manage billing"}
    </button>
  );
}
