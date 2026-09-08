import { prisma } from "@/lib/prisma";
import { PLANS, toolRequiresPro } from "@/lib/stripe";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Returns { allowed, remaining } for a given user + tool.
 * Pro users are never limited. Free users get PLANS.free.dailyLimit per tool per day.
 * Tools that are Pro-only are blocked entirely for free users (allowed=false).
 */
export async function checkAndConsumeUsage(userId: string, tool: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { allowed: false, reason: "not_found" as const };

  const isPro = user.plan === "pro" && user.stripeStatus === "active";

  if (!isPro && toolRequiresPro(tool)) {
    return { allowed: false, reason: "requires_pro" as const };
  }

  if (isPro) return { allowed: true, remaining: Infinity };

  const date = today();
  const existing = await prisma.usage.findUnique({
    where: { userId_tool_date: { userId, tool, date } }
  });

  const limit = PLANS.free.dailyLimit;
  const used = existing?.count ?? 0;

  if (used >= limit) {
    return { allowed: false, reason: "limit_reached" as const, remaining: 0 };
  }

  await prisma.usage.upsert({
    where: { userId_tool_date: { userId, tool, date } },
    update: { count: { increment: 1 } },
    create: { userId, tool, date, count: 1 }
  });

  return { allowed: true, remaining: limit - used - 1 };
}
