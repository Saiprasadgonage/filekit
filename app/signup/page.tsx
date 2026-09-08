"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (signInRes?.error) {
      setError("Account created — please log in.");
      router.push("/login");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-20">
      <h1 className="text-2xl font-semibold text-paper">Create your account</h1>
      <p className="text-dim text-sm mt-1">Free tools don't need an account — this is for saving usage and Pro.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm text-dim">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full bg-panel2 border border-line rounded-sm px-3 py-2 text-paper focus-ring"
          />
        </div>
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full bg-panel2 border border-line rounded-sm px-3 py-2 text-paper focus-ring"
          />
          <p className="text-xs text-dim mt-1">At least 8 characters.</p>
        </div>
        {error && <p className="text-rust text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber text-ink font-medium py-2.5 rounded-sm hover:bg-amberDeep transition-colors disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-sm text-dim">
        Already have an account?{" "}
        <Link href="/login" className="text-paper underline underline-offset-4">
          Log in
        </Link>
      </p>
    </div>
  );
}
