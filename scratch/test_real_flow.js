const { createClient } = require("@supabase/supabase-js");

const url = "https://tedrkyuwcqtvcpcwvjqv.supabase.co";
const service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZHJreXV3Y3F0dmNwY3d2anF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTk3MzYxMiwiZXhwIjoyMTAxNTQ5NjEyfQ.IADWiccVmDR4H57t8ObtZ7yYhIog72JLLhzSWVjkES8";

const supabase = createClient(url, service_key);

async function testFullFlow() {
  // 1. Create a dummy test profile if needed
  const testUserId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
  await supabase.from("profiles").upsert({
    id: testUserId,
    email: "testorg@krow.app",
    full_name: "Test Organization",
    role: "organization"
  });

  // 2. Create organization
  const { data: org, error: orgErr } = await supabase.from("organizations").insert({
    name: "Test Community Org",
    slug: "test-community-org-" + Date.now(),
    email: "testorg@krow.app",
    created_by: testUserId
  }).select().single();

  console.log("Org created:", org, "Error:", orgErr);

  // 3. Create opportunity
  const { data: opp, error: oppErr } = await supabase.from("opportunities").insert({
    organization_id: org.id,
    created_by: testUserId,
    title: "Community Park Beautification & Planting",
    description: "Join us in Coquitlam to beautify local parks!",
    address: "Coquitlam, BC, Canada",
    start_date: new Date().toISOString(),
    capacity: 25,
    volunteer_hours: 4,
    status: "published",
    images: ["https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80"]
  }).select().single();

  console.log("Opportunity created:", opp, "Error:", oppErr);
}

testFullFlow();
