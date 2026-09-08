"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Wrong email or password.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-20">
      <h1 className="text-2xl font-semibold text-paper">Log in</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm text-dim">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full bg-panel2 border border-line rounded-sm px-3 py-2 text-paper focus-ring"
          />
        </div>
        <div>
          <label className="text-sm text-dim">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full bg-panel2 border border-line rounded-sm px-3 py-2 text-paper focus-ring"
          />
        </div>
        {error && <p className="text-rust text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber text-ink font-medium py-2.5 rounded-sm hover:bg-amberDeep transition-colors disabled:opacity-60"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-6 text-sm text-dim">
        No account?{" "}
        <Link href="/signup" className="text-paper underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </div>
  );
}
