-- ##########################################
-- 1. EXTENSIONS & CLEANUP
-- ##########################################
-- Good practice to ensure UUID generation is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ##########################################
-- 2. CORE TABLES
-- ##########################################

-- Clubs Table
CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    college_name TEXT DEFAULT 'BMCC',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memberships (RBAC Bridge)
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('member', 'officer', 'advisor')),
    position_title TEXT, -- e.g., "President", "Treasurer"
    UNIQUE(user_id, club_id)
);

-- Budget Requests (The Parent)
CREATE TABLE IF NOT EXISTS budget_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id),
    event_name TEXT NOT NULL,
    expected_attendees INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_advisor', 'pending_sga', 'approved', 'rejected')),
    ai_audit_feedback JSONB, -- Stores the "Bylaw Whisperer" suggestions
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budget Line Items (The Children)
CREATE TABLE IF NOT EXISTS budget_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES budget_requests(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    category TEXT CHECK (category IN ('Food', 'Travel', 'Equipment', 'Prizes', 'Marketing')),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- ##########################################
-- 3. SECURITY (RLS)
-- ##########################################
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_line_items ENABLE ROW LEVEL SECURITY;

-- EXAMPLE POLICY: Everyone can see active clubs
CREATE POLICY "Clubs are viewable by everyone" 
ON clubs FOR SELECT USING (is_active = true);

-- EXAMPLE POLICY: Only officers can create budgets for their own club
CREATE POLICY "Officers can insert budget requests"
ON budget_requests FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE user_id = auth.uid()
    AND club_id = budget_requests.club_id
    AND role = 'officer'
  )
);