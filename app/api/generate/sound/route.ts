import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkAndConsumeUsage } from "@/lib/usage";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const usage = await checkAndConsumeUsage(userId, "ai-sound");
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

  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Sound generation isn't configured yet. Add REPLICATE_API_TOKEN and pick a model (e.g. MusicGen) — see README."
      },
      { status: 501 }
    );
  }

  // --- Plug in your provider here. Example: Replicate (async prediction) ---
  const start = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      // Replace with a real, current model version hash from replicate.com
      // (search "musicgen" or "audio generation") before going live.
      version: "REPLACE_WITH_MODEL_VERSION_ID",
      input: { prompt, duration: 8 }
    })
  });

  if (!start.ok) {
    const err = await start.text();
    return NextResponse.json({ error: `Provider error: ${err}` }, { status: 502 });
  }

  const prediction = await start.json();
  // Replicate runs async: the client should poll GET .../predictions/{id}
  // until status is "succeeded", then read prediction.output for the URL.
  return NextResponse.json({ predictionId: prediction.id, statusUrl: prediction.urls?.get });
}
