# Energyfox Solar Quiz

Lead-collection quiz for the Energyfox stall at solar expos. Visitors scan a QR
code, register with their name and mobile number, answer 5 solar questions and
unlock a discount:

| Correct answers | Discount |
| --------------- | -------- |
| 5 / 5           | 15%      |
| 4 / 5           | 10%      |
| 3 / 5           | 5%       |
| 0–2             | 0%       |

Each mobile number can play once. Every registration appears as a lead in the
admin panel with the discount they won.

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

- **Dashboard**: leads, QR scans, completion rate, discounts won, latest leads,
  and performance per QR code.
- **Leads**: search by name, mobile or coupon; filter by reward; call or
  WhatsApp a lead in one tap; export to CSV (Excel-friendly, IST times).
  Deleting a lead lets that number play again, which is handy for testing.
- **QR codes**: create as many as you like (e.g. one per stall or poster). One
  QR code works for unlimited visitors. Pause a QR code to stop new entries.

## Customising

- **Questions**: `lib/questions.ts` holds the 20 questions of "Solar Pro Quiz,
  Set 1". Each player gets 5 at random, and the options are shuffled per player
  (True/False stays in order) so the answer isn't always in the same spot.
  "Select all that apply" questions use an array for `answer` and only count as
  correct when exactly those options are picked. To add Sets 2–5, append
  questions with new ids (`s2-01`, …). Never reuse an id.
- **Discount tiers**: `lib/prizes.ts`.
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
