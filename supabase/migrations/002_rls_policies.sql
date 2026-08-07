-- =============================================
-- Row Level Security Policies
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES
-- =============================================

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =============================================
-- CATEGORIES
-- =============================================

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins can manage categories" ON categories;
CREATE POLICY "Only admins can manage categories"
  ON categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- ORGANIZATIONS
-- =============================================

DROP POLICY IF EXISTS "Published orgs are viewable by everyone" ON organizations;
CREATE POLICY "Published orgs are viewable by everyone"
  ON organizations FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
CREATE POLICY "Users can create organizations"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Org owners can update their org" ON organizations;
CREATE POLICY "Org owners can update their org"
  ON organizations FOR UPDATE
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.organization_id = organizations.id
      AND org_members.user_id = auth.uid()
      AND org_members.role IN ('owner', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Org owners can delete their org" ON organizations;
CREATE POLICY "Org owners can delete their org"
  ON organizations FOR DELETE
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- ORG MEMBERS
-- =============================================

DROP POLICY IF EXISTS "Org members are viewable by org members" ON org_members;
CREATE POLICY "Org members are viewable by org members"
  ON org_members FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM org_members om
      WHERE om.organization_id = org_members.organization_id
      AND om.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Org admins can manage members" ON org_members;
CREATE POLICY "Org admins can manage members"
  ON org_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_members om
      WHERE om.organization_id = org_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- OPPORTUNITIES
-- =============================================

DROP POLICY IF EXISTS "Published opportunities are viewable by everyone" ON opportunities;
CREATE POLICY "Published opportunities are viewable by everyone"
  ON opportunities FOR SELECT
  USING (
    status = 'published'
    OR EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.organization_id = opportunities.organization_id
      AND org_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Org members can create opportunities" ON opportunities;
CREATE POLICY "Org members can create opportunities"
  ON opportunities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.organization_id = opportunities.organization_id
      AND org_members.user_id = auth.uid()
      AND org_members.role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Org members can update opportunities" ON opportunities;
CREATE POLICY "Org members can update opportunities"
  ON opportunities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.organization_id = opportunities.organization_id
      AND org_members.user_id = auth.uid()
      AND org_members.role IN ('owner', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Org members can delete opportunities" ON opportunities;
CREATE POLICY "Org members can delete opportunities"
  ON opportunities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.organization_id = opportunities.organization_id
      AND org_members.user_id = auth.uid()
      AND org_members.role IN ('owner', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- APPLICATIONS
-- =============================================

DROP POLICY IF EXISTS "Volunteers can view own applications" ON applications;
CREATE POLICY "Volunteers can view own applications"
  ON applications FOR SELECT
  USING (
    auth.uid() = volunteer_id
    OR EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.organization_id = (
        SELECT organization_id FROM opportunities WHERE id = applications.opportunity_id
      )
      AND org_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Volunteers can create applications" ON applications;
CREATE POLICY "Volunteers can create applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = volunteer_id);

DROP POLICY IF EXISTS "Volunteers can update own applications" ON applications;
CREATE POLICY "Volunteers can update own applications"
  ON applications FOR UPDATE
  USING (
    auth.uid() = volunteer_id
    OR EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.organization_id = (
        SELECT organization_id FROM opportunities WHERE id = applications.opportunity_id
      )
      AND org_members.user_id = auth.uid()
    )
  );

-- =============================================
-- VOLUNTEER HOURS
-- =============================================

DROP POLICY IF EXISTS "Users can view own hours or org hours" ON volunteer_hours;
CREATE POLICY "Users can view own hours or org hours"
  ON volunteer_hours FOR SELECT
  USING (
    auth.uid() = volunteer_id
    OR EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.organization_id = volunteer_hours.organization_id
      AND org_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Volunteers can log hours" ON volunteer_hours;
CREATE POLICY "Volunteers can log hours"
  ON volunteer_hours FOR INSERT
  WITH CHECK (auth.uid() = volunteer_id);

DROP POLICY IF EXISTS "Org admins can update hours status" ON volunteer_hours;
CREATE POLICY "Org admins can update hours status"
  ON volunteer_hours FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.organization_id = volunteer_hours.organization_id
      AND org_members.user_id = auth.uid()
      AND org_members.role IN ('owner', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- CONVERSATIONS & MESSAGES
-- =============================================

DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = ANY(participant_ids));

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = ANY(participant_ids));

DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = ANY(participant_ids));

DROP POLICY IF EXISTS "Users can view messages in own conversations" ON messages;
CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND auth.uid() = ANY(conversations.participant_ids)
    )
  );

DROP POLICY IF EXISTS "Users can send messages in own conversations" ON messages;
CREATE POLICY "Users can send messages in own conversations"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND auth.uid() = ANY(conversations.participant_ids)
    )
  );

DROP POLICY IF EXISTS "Users can update own messages" ON messages;
CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND auth.uid() = ANY(conversations.participant_ids)
    )
  );

-- =============================================
-- NOTIFICATIONS
-- =============================================

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- SAVED OPPORTUNITIES
-- =============================================

DROP POLICY IF EXISTS "Users can view own saved" ON saved_opportunities;
CREATE POLICY "Users can view own saved"
  ON saved_opportunities FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can save opportunities" ON saved_opportunities;
CREATE POLICY "Users can save opportunities"
  ON saved_opportunities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unsave opportunities" ON saved_opportunities;
CREATE POLICY "Users can unsave opportunities"
  ON saved_opportunities FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- REVIEWS
-- =============================================

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- CERTIFICATES
-- =============================================

DROP POLICY IF EXISTS "Users can view own certificates" ON certificates;
CREATE POLICY "Users can view own certificates"
  ON certificates FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "System can create certificates" ON certificates;
CREATE POLICY "System can create certificates"
  ON certificates FOR INSERT
  WITH CHECK (true);

-- =============================================
-- DOCUMENTS
-- =============================================

DROP POLICY IF EXISTS "Org members can view documents" ON documents;
CREATE POLICY "Org members can view documents"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.organization_id = documents.organization_id
      AND org_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Org admins can manage documents" ON documents;
CREATE POLICY "Org admins can manage documents"
  ON documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.organization_id = documents.organization_id
      AND org_members.user_id = auth.uid()
      AND org_members.role IN ('owner', 'admin')
    )
  );

-- =============================================
-- AUDIT LOGS
-- =============================================

DROP POLICY IF EXISTS "Only admins can view audit logs" ON audit_logs;
CREATE POLICY "Only admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "System can create audit logs" ON audit_logs;
CREATE POLICY "System can create audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);
