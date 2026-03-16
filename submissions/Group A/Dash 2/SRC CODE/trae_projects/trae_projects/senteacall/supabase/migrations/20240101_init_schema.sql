-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  subscription_tier VARCHAR(20) DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'premium', 'enterprise')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_tier);

-- Call Sessions Table
CREATE TABLE IF NOT EXISTS call_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  caller_number VARCHAR(20) NOT NULL,
  caller_name VARCHAR(100),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  final_risk_score FLOAT CHECK (final_risk_score >= 0 AND final_risk_score <= 100),
  outcome VARCHAR(50) CHECK (outcome IN ('safe', 'blocked', 'user_ended', 'caller_ended', 'network_error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON call_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON call_sessions(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_risk_score ON call_sessions(final_risk_score DESC);

-- Transcripts Table (Added based on architecture diagram reference)
CREATE TABLE IF NOT EXISTS transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES call_sessions(id) ON DELETE CASCADE,
  text_content TEXT,
  confidence_score FLOAT,
  speaker_role VARCHAR(50),
  transcribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Threat Analysis Table
CREATE TABLE IF NOT EXISTS threat_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES call_sessions(id) ON DELETE CASCADE,
  transcript_id UUID REFERENCES transcripts(id) ON DELETE CASCADE,
  risk_score FLOAT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  threat_indicators JSONB NOT NULL,
  recommended_actions JSONB NOT NULL,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_threat_session_id ON threat_analysis(session_id);
CREATE INDEX IF NOT EXISTS idx_threat_risk_score ON threat_analysis(risk_score DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies (simplified for initial dev)
CREATE POLICY "Public access for dev" ON users FOR ALL USING (true);
CREATE POLICY "Public access for dev" ON call_sessions FOR ALL USING (true);
CREATE POLICY "Public access for dev" ON transcripts FOR ALL USING (true);
CREATE POLICY "Public access for dev" ON threat_analysis FOR ALL USING (true);
