# Energyfox Spin & Win

Lead-collection prize wheel for the Energyfox stall at solar expos. Visitors
scan a QR code, register with their name and mobile number, and spin the wheel
once to win 5%, 10% or (rarely) 15% off their solar project. Each mobile number gets one
spin. Every registration appears as a lead in the admin panel with the prize
they won.

The prize is decided on the server when the visitor taps Spin; the wheel then
animates to that result, so it can't be tampered with from the browser.

Built with Next.js 16 (App Router, Server Actions), Tailwind CSS 4 and Postgres (Neon).

## Deploy to Vercel

1. Push this folder to a GitHub repository and import it at
   [vercel.com/new](https://vercel.com/new). The defaults are correct.
2. In the Vercel project, open **Storage → Create Database → Neon (Postgres)**,
   choose the free plan and connect it to the project. This adds `DATABASE_URL`.
   The tables are created automatically on first use.
3. In **Settings → Environment Variables**, add `ADMIN_PASSWORD` (something long).
4. Redeploy (**Deployments → ⋯ → Redeploy**).
5. Open `https://<your-domain>/admin`, sign in, go to **QR codes**, create one
   and click **Poster** to print it (or **PNG** to download the QR code alone).

Using the CLI instead:

```bash
npm i -g vercel
vercel link
vercel integration add neon
vercel env add ADMIN_PASSWORD production
vercel deploy --prod
```

QR codes always point to the project's production domain, even if you open the
admin panel on a preview URL. If you add a custom domain later, re-print the
posters (or set `SITE_URL`).

## Admin panel (`/admin`)

- **Dashboard**: leads, QR scans, wheels spun, average discount, prizes won,
  latest leads, and performance per QR code.
- **Leads**: search by name, mobile or coupon; filter by reward; call or
  WhatsApp a lead in one tap; export to CSV (Excel-friendly, IST times).
  Deleting a lead lets that number spin again, which is handy for testing.
- **QR codes**: create as many as you like (e.g. one per stall or poster). One
  QR code works for unlimited visitors. Pause a QR code to stop new entries.

## Customising

- **Odds**: `lib/spin.ts` (`WEIGHTS`, in percent): 5% off 50%, 10% off 45%,
  15% off 5% (rare). The 50% FoxGrid inverter slice is 0, so it is shown on
  the wheel but never won.
- **Wheel slices and prize text**: `lib/prizes.ts`.
- **FoxGrid inverter image**: `public/foxgrid-inverter.png`, a transparent
  cut-out of the product photo. To swap it, use a square PNG with a
  transparent background.
- **Time zone** for admin screens and exports: `TIME_ZONE` env var (default `Asia/Kolkata`).
- **Phone numbers**: Indian mobile numbers (`+91`, 10 digits); see `lib/phone.ts`.

## Local development

```bash
npm install
vercel env pull .env.local   # after `vercel link`, or copy .env.example
npm run dev
```

Open http://localhost:3000/admin. Note that QR codes created locally point to
`localhost`, which phones can't open. Print them from the deployed site.
