CREATE TABLE IF NOT EXISTS popups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  body TEXT,
  image_url TEXT,
  cta_text VARCHAR(100),
  cta_link TEXT,
  trigger_type VARCHAR(20) NOT NULL CHECK (trigger_type IN ('exit_intent', 'timer', 'scroll', 'page_load')),
  trigger_value INTEGER DEFAULT 0, -- seconds for timer, percentage for scroll
  display_frequency VARCHAR(20) DEFAULT 'once_per_session' CHECK (display_frequency IN ('always', 'once_per_session', 'once_per_day')),
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  active BOOLEAN DEFAULT true,
  max_impressions_per_session INTEGER DEFAULT 1,
  max_impressions_per_day INTEGER DEFAULT 3,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_popups_active ON popups(active);
CREATE INDEX idx_popups_priority ON popups(priority DESC);
CREATE INDEX idx_popups_dates ON popups(starts_at, ends_at);
