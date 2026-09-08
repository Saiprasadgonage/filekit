# Filekit — file tools SaaS starter

A working Next.js app: 11 file tools, email/password accounts, and a
Stripe-powered Free/Pro subscription. Most tools run entirely in the
visitor's browser (no server cost per use); the two AI generator tools
call a paid third-party API you plug in yourself.

## What's included and what needs you

| Tool | Status |
|---|---|
| Image crop/resize/compress | ✅ Works out of the box |
| PDF merge | ✅ Works out of the box |
| PDF size reducer | ✅ Works out of the box (structural compression; see note below) |
| Word → PDF | ✅ Works out of the box |
| Background remover | ✅ Works out of the box (runs a real ML model in-browser, free) |
| Audio noise reducer | ✅ Works out of the box (frequency filtering, not full ML denoise) |
| PDF editor (Pro) | ✅ Works out of the box |
| Word editor (Pro) | ✅ Works out of the box |
| Watermark eraser (Pro) | ✅ Works out of the box (brush/blend tool, not AI inpainting) |
| AI image generator (Pro) | ⚙️ Needs your `OPENAI_API_KEY` |
| AI sound generator (Pro) | ⚙️ Needs your `REPLICATE_API_TOKEN` + a model version ID |

Subscriptions, login, and usage limits work fully once you complete the
setup below.

---

## 1. Local setup

Requirements: Node.js 18+, npm.

```bash
cd filekit
npm install
cp .env.example .env
```

Generate a secret for NextAuth and paste it into `.env`:

```bash
openssl rand -base64 32
```

Create the local database (SQLite, zero config) and start the dev server:

```bash
npx prisma migrate dev --name init
npm run dev
```

Visit `http://localhost:3000`. Sign up for an account — free tools work
immediately with no further setup.

---

## 2. Set up Stripe (subscriptions + payment)

1. **Create a Stripe account** at https://dashboard.stripe.com if you don't
   have one. Stay in **Test mode** (toggle top-right) while developing.

2. **Get your API keys**: Developers → API keys.
   Copy the Secret key and Publishable key into `.env`:
   ```
   STRIPE_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   ```

3. **Create the Pro product and prices**: Product catalog → Add product.
   - Name: "Pro"
   - Add a recurring price, monthly (e.g. $9/month) → copy its price ID
     (`price_...`) into `STRIPE_PRICE_PRO_MONTHLY`
   - Add a second recurring price, yearly (e.g. $90/year) → copy into
     `STRIPE_PRICE_PRO_YEARLY`

4. **Set up the webhook** (this is what keeps a user's plan in sync when
   they pay, cancel, or a card fails):
   - For local testing, install the Stripe CLI (https://stripe.com/docs/stripe-cli),
     then run:
     ```bash
     stripe login
     stripe listen --forward-to localhost:3000/api/stripe/webhook
     ```
     It prints a `whsec_...` value — put that in `STRIPE_WEBHOOK_SECRET`.
   - For production, in the Stripe Dashboard: Developers → Webhooks →
     Add endpoint → URL = `https://yourdomain.com/api/stripe/webhook`.
     Select these events: `checkout.session.completed`,
     `customer.subscription.updated`, `customer.subscription.deleted`,
     `invoice.payment_failed`. Copy the signing secret into your
     production environment variables.

5. **Test a full payment**: go to `/pricing`, click Upgrade, and use
   Stripe's test card `4242 4242 4242 4242`, any future expiry, any CVC.
   After checkout you should land back on `/dashboard` and see "Pro."

6. **When you're ready for real money**: flip Stripe out of Test mode,
   repeat steps 2–4 with your live keys (Stripe keeps test and live data
   completely separate), and update your production `.env` accordingly.

---

## 3. Deployment (Vercel — recommended)

Vercel is the simplest path since this is a Next.js app.

1. Push this project to a GitHub repo.
2. Go to https://vercel.com → New Project → import the repo.
3. **Add a production database.** SQLite doesn't work on Vercel's
   serverless functions (no persistent disk), so switch to Postgres:
   - Easiest: Vercel dashboard → Storage → Create → Postgres (or use
     Supabase/Neon/Railway — any Postgres URL works).
   - In `prisma/schema.prisma`, change:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```
   - Set `DATABASE_URL` in Vercel's Environment Variables to the Postgres
     connection string.
4. **Add all environment variables** from your `.env` into Vercel's
   Environment Variables settings (Production + Preview). Set
   `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to your real domain, e.g.
   `https://filekit.app`.
5. Deploy. After the first deploy, run the database migration once
   against production:
   ```bash
   DATABASE_URL="your-production-url" npx prisma migrate deploy
   ```
6. Go back to Stripe and add the **production** webhook endpoint
   (step 4 above) pointing at your real domain, and put that
   `whsec_...` in Vercel's env vars too.
7. Custom domain: Vercel → Project → Settings → Domains → add your
   domain and follow the DNS instructions.

That's a fully live, paid SaaS.

---

## 4. Turning on the AI tools (optional)

These two tools need a paid API because image/audio generation requires
real GPU inference — there's no free/client-side equivalent.

**AI image generator** — uses OpenAI's Images API by default:
1. Get a key at https://platform.openai.com/api-keys
2. Set `OPENAI_API_KEY` in your environment.
3. Done — `app/api/generate/image/route.ts` is already wired up.
   (You can swap in Replicate, Stability, or any provider — it's one
   function to change.)

**AI sound generator** — uses Replicate by default (e.g. MusicGen):
1. Get a token at https://replicate.com/account/api-tokens
2. Pick a model on replicate.com (search "musicgen" or "audio"), copy its
   current **version ID**, and paste it into
   `app/api/generate/sound/route.ts` where it says
   `REPLACE_WITH_MODEL_VERSION_ID`.
3. Set `REPLICATE_API_TOKEN` in your environment.

Both routes already enforce login + Pro plan + daily usage limits before
calling the provider, so you won't get billed for abuse from logged-out
visitors.

---

## 5. Notes on tool honesty (read before marketing these)

- **PDF size reducer** rebuilds the file's internal structure but does not
  recompress embedded photos client-side. For real deep compression on
  scanned/image-heavy PDFs, add a server-side pass using Ghostscript
  (`gs -sDEVICE=pdfwrite -dPDFSETTINGS=/ebook ...`) in a serverless
  function or a small worker service — that's the standard approach
  tools like SmallPDF use.
- **Noise reducer** does frequency filtering (removes steady hiss/hum),
  not full ML source separation. For studio-grade denoising, integrate
  a model like RNNoise or Resemble AI's API server-side.
- **Watermark eraser** is a manual blend brush for marks on images you
  own the rights to — not an automatic "remove any watermark" tool. Don't
  market it as a way to strip other people's copyright marks; that's both
  against most platforms' terms and legally risky for your business.

---

## 6. Project structure

```
app/
  page.tsx                landing page
  tools/                  one folder per tool
  pricing/                plans + Stripe checkout trigger
  dashboard/              account + billing portal
  login/ signup/          auth pages
  api/
    auth/                 NextAuth + registration
    stripe/               checkout, webhook, billing portal
    generate/             AI image / sound routes
lib/
  auth.ts                 NextAuth config
  stripe.ts               Stripe client + plan definitions
  usage.ts                daily free-tier limit enforcement
  tools.ts                central tool registry (used by UI + gating)
prisma/
  schema.prisma           User + Usage models
```

## 7. Customizing plans, limits, and prices

- Change the free daily limit: `lib/stripe.ts` → `PLANS.free.dailyLimit`
- Change which tools are Pro-only: `lib/tools.ts` → each tool's `pro` flag,
  and mirror it in `PLANS.free.tools` / `PLANS.pro.tools` in `lib/stripe.ts`
- Change prices: edit them in the Stripe Dashboard (price IDs are read
  from env vars, so no code change needed) — just update `.env`
