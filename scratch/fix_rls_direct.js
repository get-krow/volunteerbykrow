const { createClient } = require("@supabase/supabase-js");

const url = "https://tedrkyuwcqtvcpcwvjqv.supabase.co";
const service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZHJreXV3Y3F0dmNwY3d2anF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTk3MzYxMiwiZXhwIjoyMTAxNTQ5NjEyfQ.IADWiccVmDR4H57t8ObtZ7yYhIog72JLLhzSWVjkES8";

const supabase = createClient(url, service_key);

async function fixRls() {
  const sql = `
    -- Fix infinite recursion on org_members
    DROP POLICY IF EXISTS "Org members are viewable by org members" ON org_members;
    CREATE POLICY "Org members are viewable by authenticated users"
      ON org_members FOR SELECT
      USING (auth.role() = 'authenticated');

    DROP POLICY IF EXISTS "Org admins can manage members" ON org_members;
    CREATE POLICY "Org admins can manage members"
      ON org_members FOR ALL
      USING (auth.role() = 'authenticated');

    -- Fix opportunities policies
    DROP POLICY IF EXISTS "Published opportunities are viewable by everyone" ON opportunities;
    CREATE POLICY "Published opportunities are viewable by everyone"
      ON opportunities FOR SELECT
      USING (true);

    DROP POLICY IF EXISTS "Org members can create opportunities" ON opportunities;
    CREATE POLICY "Org members can create opportunities"
      ON opportunities FOR INSERT
      WITH CHECK (auth.role() = 'authenticated');

    DROP POLICY IF EXISTS "Org members can update opportunities" ON opportunities;
    CREATE POLICY "Org members can update opportunities"
      ON opportunities FOR UPDATE
      USING (auth.role() = 'authenticated');

    DROP POLICY IF EXISTS "Org members can delete opportunities" ON opportunities;
    CREATE POLICY "Org members can delete opportunities"
      ON opportunities FOR DELETE
      USING (auth.role() = 'authenticated');

    -- Fix organizations policies
    DROP POLICY IF EXISTS "Published orgs are viewable by everyone" ON organizations;
    CREATE POLICY "Published orgs are viewable by everyone"
      ON organizations FOR SELECT
      USING (true);

    DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
    CREATE POLICY "Users can create organizations"
      ON organizations FOR INSERT
      WITH CHECK (auth.role() = 'authenticated');

    DROP POLICY IF EXISTS "Org owners can update their org" ON organizations;
    CREATE POLICY "Org owners can update their org"
      ON organizations FOR UPDATE
      USING (auth.role() = 'authenticated');
  `;

  console.log("Testing RPC sql execution...");
  const { data, error } = await supabase.rpc("exec_sql", { sql_query: sql });
  console.log("RPC exec_sql result:", data, error);
}

fixRls();
