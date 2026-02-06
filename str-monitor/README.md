# STR Monitor - Pleasanton & Alameda County

Short-term rental regulation monitoring for Airbnb/VRBO hosts.

We monitor official Pleasanton + Alameda County STR rules and alert customers immediately when anything changes, with archived evidence of previous language.

## Architecture

```
str-monitor/
├── scraper/          # Python: page fetching, diff detection, evidence storage, alerts
├── web/              # Next.js: landing page, customer portal, admin dashboard
├── supabase/         # Database migrations and config
└── .env.example      # Required environment variables
```

## Quick Start

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL editor
3. Create a Storage bucket named `snapshots` (public read)
4. Copy your project URL and keys to `.env`

### 2. Set up the Scraper

```bash
cd scraper
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env  # fill in values
python seed_sources.py      # populate monitored URLs
python run.py               # run first scrape
```

### 3. Set up the Web App

```bash
cd web
npm install
cp ../.env.example .env.local  # fill in values
npm run dev
```

### 4. Set up Stripe

1. Create products: "STR Monitor Monthly" ($59/mo) and "STR Monitor Annual" ($499/yr)
2. Add the price IDs to `.env`
3. Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
4. Events to listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## Scraper Schedule

Run `python run.py` via cron twice daily:

```cron
0 6,18 * * * cd /path/to/str-monitor/scraper && .venv/bin/python run.py
```

## Pricing

| Plan | Price | Notes |
|------|-------|-------|
| Founding Monthly | $39/mo | First 20 customers, locked forever |
| Monthly | $59/mo | Standard |
| Annual | $499/yr | Save $209 |
