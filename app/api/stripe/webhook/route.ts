import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Stripe needs the raw request body to verify the signature, so this route
// must NOT run any JSON body-parsing before reading req.text().
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    // Fires right after a successful Checkout — link the subscription to the user.
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (userId && session.subscription) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: "pro",
            stripeSubId: session.subscription as string,
            stripeStatus: "active"
          }
        });
      }
      break;
    }

    // Fires on renewals, cancellations, payment failures, plan changes, etc.
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      const isActive = sub.status === "active" || sub.status === "trialing";

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: isActive ? "pro" : "free",
            stripeStatus: sub.status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000)
          }
        });
      }
      break;
    }

    // Payment failed on renewal — downgrade so access is cut off promptly.
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { stripeStatus: "past_due" }
        });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
