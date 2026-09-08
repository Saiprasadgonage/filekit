"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-line">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-amber rounded-sm" />
          <span className="font-semibold tracking-tight text-paper">filekit</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm text-dim">
          <Link href="/tools" className="hover:text-paper transition-colors">
            Tools
          </Link>
          <Link href="/pricing" className="hover:text-paper transition-colors">
            Pricing
          </Link>
          {session && (
            <Link href="/dashboard" className="hover:text-paper transition-colors">
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {session ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm text-dim hover:text-paper transition-colors"
            >
              Sign out
            </button>
          ) : (
            <>
              <Link href="/login" className="text-sm text-dim hover:text-paper transition-colors">
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm bg-amber text-ink font-medium px-4 py-2 rounded-sm hover:bg-amberDeep transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
