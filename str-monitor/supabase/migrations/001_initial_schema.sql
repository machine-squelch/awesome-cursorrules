-- STR Monitor: Initial Schema
-- Run this in your Supabase SQL editor or via migrations

-- Sources: the pages we monitor
create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  source_type text not null check (source_type in ('html', 'pdf')),
  jurisdiction text not null check (jurisdiction in ('pleasanton', 'alameda_county', 'california')),
  category text not null check (category in ('ordinance', 'agenda', 'tax', 'permit', 'zoning', 'legislation')),
  css_selector text, -- optional: CSS selector to extract content area (ignore nav/footer)
  is_active boolean not null default true,
  last_checked_at timestamptz,
  created_at timestamptz not null default now()
);

-- Snapshots: every version of every page we've fetched
create table if not exists snapshots (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references sources(id) on delete cascade,
  fetched_at timestamptz not null default now(),
  content_hash text not null, -- SHA-256 of extracted text
  extracted_text text not null,
  raw_storage_path text, -- S3/Supabase Storage path to raw HTML/PDF
  content_length integer not null,
  http_status integer
);

create index if not exists idx_snapshots_source_fetched on snapshots(source_id, fetched_at desc);

-- Changes: confirmed, human-approved changes
create table if not exists changes (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references sources(id) on delete cascade,
  snapshot_before_id uuid not null references snapshots(id),
  snapshot_after_id uuid not null references snapshots(id),
  diff_text text not null, -- unified diff
  summary text, -- human-written plain-English summary
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  status text not null default 'pending_review' check (status in ('pending_review', 'approved', 'dismissed')),
  detected_at timestamptz not null default now(),
  approved_at timestamptz,
  published_at timestamptz -- when alerts were sent
);

create index if not exists idx_changes_status on changes(status);
create index if not exists idx_changes_published on changes(published_at desc);

-- Subscribers: paying customers
create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null unique,
  name text not null,
  phone text, -- for future SMS alerts
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text not null default 'monthly' check (plan in ('monthly', 'annual', 'founding_monthly')),
  status text not null default 'active' check (status in ('active', 'past_due', 'canceled', 'trialing')),
  property_address text, -- optional: their STR address
  jurisdictions text[] not null default '{pleasanton,alameda_county}',
  alert_preferences jsonb not null default '{"email": true, "sms": false}'::jsonb,
  created_at timestamptz not null default now(),
  canceled_at timestamptz
);

create index if not exists idx_subscribers_status on subscribers(status);
create index if not exists idx_subscribers_stripe on subscribers(stripe_customer_id);

-- Alert log: track every alert sent
create table if not exists alert_log (
  id uuid primary key default gen_random_uuid(),
  change_id uuid not null references changes(id) on delete cascade,
  subscriber_id uuid not null references subscribers(id) on delete cascade,
  channel text not null check (channel in ('email', 'sms')),
  sent_at timestamptz not null default now(),
  status text not null default 'sent' check (status in ('sent', 'delivered', 'failed', 'bounced')),
  resend_message_id text -- email provider message ID for tracking
);

-- Scrape log: monitor scraper health
create table if not exists scrape_log (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references sources(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null check (status in ('success', 'error', 'warning')),
  content_length integer,
  content_hash text,
  has_change boolean not null default false,
  error_message text,
  duration_ms integer
);

create index if not exists idx_scrape_log_source on scrape_log(source_id, started_at desc);

-- RLS Policies
alter table subscribers enable row level security;
alter table changes enable row level security;
alter table snapshots enable row level security;
alter table sources enable row level security;
alter table alert_log enable row level security;

-- Public can read sources
create policy "Sources are viewable by everyone" on sources
  for select using (true);

-- Public can read approved/published changes
create policy "Published changes are viewable by everyone" on changes
  for select using (status = 'approved' and published_at is not null);

-- Subscribers can read their own record
create policy "Users can view own subscriber record" on subscribers
  for select using (auth.uid() = user_id);

-- Snapshots readable by authenticated users
create policy "Snapshots viewable by authenticated users" on snapshots
  for select using (auth.role() = 'authenticated');

-- Alert log readable by the subscriber it belongs to
create policy "Users can view own alerts" on alert_log
  for select using (
    subscriber_id in (select id from subscribers where user_id = auth.uid())
  );
