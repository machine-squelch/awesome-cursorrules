# STR Monitor - Pleasanton & Alameda County

Short-term rental regulation monitoring for Airbnb/VRBO hosts.

**Product promise**: We monitor official Pleasanton + Alameda County STR rules and alert customers immediately when anything changes, with archived evidence of previous language.

## Architecture

```
str-monitor/
├── scraper/               # Python: page fetching, diff detection, evidence storage, alerts
│   ├── scraper.py         # Core: fetch HTML/PDF pages, extract text
│   ├── diff_engine.py     # Compare versions, detect meaningful changes
│   ├── evidence_store.py  # Supabase: store snapshots, changes, logs
│   ├── alerter.py         # Notify admin (Slack/email) + send subscriber alerts
│   ├── run.py             # Cron entry point: runs full scrape cycle
│   ├── seed_sources.py    # One-time: populate source URLs
│   ├── sources.json       # 9 monitored URLs (Pleasanton + Alameda County)
│   ├── Dockerfile         # Container for Railway/cron deployment
│   └── railway.toml       # Railway cron config (twice daily)
│
├── web/                   # Next.js 14: landing page, customer portal, admin API
│   ├── src/app/
│   │   ├── page.tsx       # Landing page (hero, pricing, rules summary, FAQ)
│   │   ├── login/         # Magic link auth
│   │   ├── dashboard/     # Customer dashboard (changes + sources)
│   │   ├── changes/[id]/  # Change detail with diff viewer
│   │   └── api/
│   │       ├── checkout/          # Stripe Checkout session
│   │       ├── webhooks/stripe/   # Subscription lifecycle
│   │       └── admin/             # Approve changes + send alerts
│   ├── src/lib/           # Supabase client, Stripe, utilities
│   └── vercel.json        # Vercel deployment config
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # 6 tables + RLS policies
│
└── .env.example           # All required environment variables
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `sources` | URLs we monitor (9 initial) |
| `snapshots` | Every version of every page, timestamped |
| `changes` | Detected changes with diffs (pending → approved → published) |
| `subscribers` | Paying customers with Stripe IDs |
| `alert_log` | Every alert sent, for tracking |
| `scrape_log` | Every scrape attempt, for health monitoring |

## Quick Start

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL Editor
3. Create a Storage bucket named `snapshots` (set to public if you want direct download links)
4. Enable Email auth in Authentication → Providers
5. Copy project URL + keys to `.env`

### 2. Scraper Setup

```bash
cd scraper
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env   # fill in all values
python seed_sources.py       # populate source URLs in database
python run.py                # run first scrape (creates baseline snapshots)
```

### 3. Web App Setup

```bash
cd web
npm install
cp .env.example .env.local   # fill in all values
npm run dev                   # http://localhost:3000
```

### 4. Stripe Setup

1. Create 3 products in Stripe Dashboard:
   - "STR Monitor Founding" → $39/month recurring
   - "STR Monitor Monthly" → $59/month recurring
   - "STR Monitor Annual" → $499/year recurring
2. Copy the Price IDs to `.env`
3. Create a webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
4. Subscribe to events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Copy the webhook signing secret to `.env`

### 5. Resend Setup

1. Create account at [resend.com](https://resend.com)
2. Verify your sending domain
3. Copy API key to `.env`

## Deployment

### Web App → Vercel

```bash
cd web
npx vercel            # follow prompts
npx vercel env pull   # sync env vars
```

Set all env vars in Vercel Dashboard → Settings → Environment Variables.

### Scraper → Railway

```bash
cd scraper
railway login
railway init
railway up
```

The `railway.toml` configures it as a cron job running at 6 AM and 6 PM Pacific.

**Alternative**: Run via system cron on any VPS:
```cron
0 6,18 * * * cd /path/to/scraper && .venv/bin/python run.py >> /var/log/str-monitor.log 2>&1
```

## Admin Workflow

When the scraper detects a change:

1. You get a Slack/email notification with a diff preview
2. Review the change — is it a real regulatory update or just a website tweak?
3. Approve it via API:
   ```bash
   curl -X POST https://yourdomain.com/api/admin/approve-change \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"change_id": "uuid-here", "summary": "The city increased the maximum occupancy limit from 8 to 10 guests for hosted rentals.", "severity": "warning"}'
   ```
4. Send alerts to subscribers:
   ```bash
   curl -X POST https://yourdomain.com/api/admin/send-alerts \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"change_id": "uuid-here"}'
   ```

## Pricing

| Plan | Price | Target |
|------|-------|--------|
| Founding Monthly | $39/mo | First 20 customers (locked forever) |
| Monthly | $59/mo | Standard |
| Annual | $499/yr | $41.58/mo effective, save $209 |

**Revenue target**: 85 customers × $59/mo = $5,015/month

## Launch Checklist

- [ ] Supabase project created, schema deployed, storage bucket created
- [ ] All 9 source URLs verified and accessible
- [ ] Scraper baseline run complete (all sources have snapshots)
- [ ] Stripe products and webhook configured
- [ ] Resend domain verified
- [ ] Web app deployed to Vercel with all env vars
- [ ] Scraper deployed to Railway (or cron configured)
- [ ] Landing page live with correct pricing links
- [ ] Test magic link login flow end-to-end
- [ ] Test Stripe checkout → webhook → subscriber creation flow
- [ ] Admin approve + send-alerts flow tested
- [ ] Slack webhook configured for admin notifications
- [ ] First 50 prospect emails drafted
- [ ] Facebook group posts drafted
