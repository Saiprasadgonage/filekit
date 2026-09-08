import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ManageBillingButton from "@/components/ManageBillingButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (!user) redirect("/login");

  const isPro = user.plan === "pro" && user.stripeStatus === "active";

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-semibold text-paper">Your account</h1>

      <div className="mt-8 border border-line rounded-lg p-6 bg-panel flex items-center justify-between">
        <div>
          <p className="tag text-dim">CURRENT PLAN</p>
          <p className="text-xl font-medium text-paper mt-1">{isPro ? "Pro" : "Free"}</p>
          {isPro && user.currentPeriodEnd && (
            <p className="text-sm text-dim mt-1">
              Renews {user.currentPeriodEnd.toLocaleDateString()}
            </p>
          )}
        </div>
        {isPro ? (
          <ManageBillingButton />
        ) : (
          <a
            href="/pricing"
            className="bg-amber text-ink font-medium px-4 py-2 rounded-sm hover:bg-amberDeep transition-colors"
          >
            Upgrade
          </a>
        )}
      </div>

      <div className="mt-6 text-sm text-dim">
        <p>Signed in as {user.email}</p>
      </div>
    </div>
  );
}
