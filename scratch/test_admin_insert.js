const { createClient } = require("@supabase/supabase-js");

const url = "https://tedrkyuwcqtvcpcwvjqv.supabase.co";
const service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZHJreXV3Y3F0dmNwY3d2anF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTk3MzYxMiwiZXhwIjoyMTAxNTQ5NjEyfQ.IADWiccVmDR4H57t8ObtZ7yYhIog72JLLhzSWVjkES8";

const supabase = createClient(url, service_key);

async function testAdminInsert() {
  // First ensure an organization exists or create one
  let { data: org } = await supabase.from("organizations").select("id").limit(1).maybeSingle();
  let orgId = org?.id;

  if (!orgId) {
    const { data: newOrg, error: orgErr } = await supabase.from("organizations").insert({
      name: "Test Organization",
      slug: "test-org-" + Date.now(),
      email: "test@org.com",
      created_by: "00000000-0000-0000-0000-000000000000" // placeholder or test
    }).select().single();
    console.log("New org:", newOrg, orgErr);
    orgId = newOrg?.id;
  }

  console.log("Using orgId:", orgId);

  const { data: opp, error: oppErr } = await supabase.from("opportunities").insert({
    organization_id: orgId,
    title: "Test Community Cleanup",
    description: "Join us for a community cleanup opportunity!",
    address: "Coquitlam, BC, Canada",
    start_date: new Date().toISOString(),
    capacity: 20,
    volunteer_hours: 4,
    status: "published",
    images: ["https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80"]
  }).select().single();

  console.log("Admin insert result:", opp, "Error:", oppErr);
}

testAdminInsert();
