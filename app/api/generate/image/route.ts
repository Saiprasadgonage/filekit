import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkAndConsumeUsage } from "@/lib/usage";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const usage = await checkAndConsumeUsage(userId, "ai-image");
  if (!usage.allowed) {
    return NextResponse.json(
      { error: usage.reason === "requires_pro" ? "This tool needs Pro" : "Limit reached" },
      { status: 403 }
    );
  }

  const { prompt } = await req.json();
  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "A text prompt is required." }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Image generation isn't configured yet. Add OPENAI_API_KEY (or swap in another provider) — see README."
      },
      { status: 501 }
    );
  }

  // --- Plug in your provider here. Example: OpenAI Images API ---
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      n: 1
    })
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: `Provider error: ${err}` }, { status: 502 });
  }

  const data = await res.json();
  const base64 = data.data?.[0]?.b64_json;

  return NextResponse.json({ image: `data:image/png;base64,${base64}` });
}
