import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20"
});

export const PLANS = {
  free: {
    name: "Free",
    dailyLimit: 5, // per tool, per day
    tools: [
      "image-resize",
      "pdf-merge",
      "pdf-compress",
      "word-to-pdf",
      "background-remover",
      "noise-reducer"
    ]
  },
  pro: {
    name: "Pro",
    dailyLimit: Infinity,
    tools: [
      "image-resize",
      "pdf-merge",
      "pdf-compress",
      "word-to-pdf",
      "background-remover",
      "noise-reducer",
      "pdf-editor",
      "word-editor",
      "watermark-remover",
      "resume-generator",
      "ai-image",
      "ai-sound"
    ]
  }
} as const;

export type PlanId = keyof typeof PLANS;

export function toolRequiresPro(tool: string): boolean {
  return !PLANS.free.tools.includes(tool as any);
}
