"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

/**
 * For Pro-only tools: shows the tool's children only to signed-in Pro users.
 * Anyone else sees an upgrade prompt instead of the tool UI.
 * (The real enforcement also happens server-side in each API route via
 * lib/usage.ts — this component is just the UX layer.)
 */
export default function UpgradeGate({
  isPro,
  children
}: {
  isPro: boolean;
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (!isPro) return <>{children}</>;

  if (status === "loading") {
    return <p className="text-dim text-sm">Checking your plan…</p>;
  }

  if (!session) {
    return (
      <div className="text-center py-8">
        <p className="text-paper font-medium">Sign in to use this tool</p>
        <p className="text-dim text-sm mt-1">It's part of the Pro plan.</p>
        <Link
          href="/login"
          className="inline-block mt-4 bg-amber text-ink font-medium px-5 py-2.5 rounded-sm hover:bg-amberDeep transition-colors"
        >
          Log in
        </Link>
      </div>
    );
  }

  const plan = (session.user as any)?.plan;
  if (plan !== "pro") {
    return (
      <div className="text-center py-8">
        <p className="text-paper font-medium">This tool needs Pro</p>
        <p className="text-dim text-sm mt-1">Upgrade to unlock it, plus unlimited use of every free tool.</p>
        <Link
          href="/pricing"
          className="inline-block mt-4 bg-amber text-ink font-medium px-5 py-2.5 rounded-sm hover:bg-amberDeep transition-colors"
        >
          View plans
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
