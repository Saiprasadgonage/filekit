import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const statusUrl = searchParams.get("url");
  if (!statusUrl || !statusUrl.startsWith("https://api.replicate.com/")) {
    return NextResponse.json({ error: "Invalid status URL" }, { status: 400 });
  }

  const res = await fetch(statusUrl, {
    headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` }
  });
  const data = await res.json();
  return NextResponse.json({ status: data.status, output: data.output });
}
