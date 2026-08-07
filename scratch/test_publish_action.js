const { createClient } = require("@supabase/supabase-js");

const url = "https://tedrkyuwcqtvcpcwvjqv.supabase.co";
const service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZHJreXV3Y3F0dmNwY3d2anF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTk3MzYxMiwiZXhwIjoyMTAxNTQ5NjEyfQ.IADWiccVmDR4H57t8ObtZ7yYhIog72JLLhzSWVjkES8";

const supabase = createClient(url, service_key);

async function testActionLogic() {
  const userId = "85e8ecbd-a913-4790-bbfc-e8f9e81c280d"; // Zachary Tan

  // 1. Get or create Org
  let orgId = null;
  const { data: existingOrg } = await supabase
    .from("organizations")
    .select("id")
    .eq("created_by", userId)
    .limit(1)
    .maybeSingle();

  if (existingOrg?.id) {
    orgId = existingOrg.id;
  } else {
    const { data: newOrg, error: orgErr } = await supabase
      .from("organizations")
      .insert({
        name: "Zachary's Organization",
        slug: "zachary-org-" + Date.now().toString(36),
        email: "wackozacko098@gmail.com",
        created_by: userId,
        verification_status: "verified"
      })
      .select("id")
      .single();

    console.log("New Org created:", newOrg, "Error:", orgErr);
    orgId = newOrg?.id;

    if (orgId) {
      await supabase.from("org_members").insert({
        organization_id: orgId,
        user_id: userId,
        role: "owner"
      });
    }
  }

  console.log("Org ID:", orgId);

  // 2. Insert opportunity (without non-existent columns)
  const { data: opp, error: oppErr } = await supabase
    .from("opportunities")
    .insert({
      organization_id: orgId,
      title: "Community Park Cleanup",
      description: "Help clean up Coquitlam community park!",
      address: "Coquitlam, BC, Canada",
      is_remote: false,
      start_date: new Date().toISOString(),
      capacity: 25,
      spots_filled: 0,
      volunteer_hours: 4.0,
      status: "published",
      images: ["https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80"],
      skills_required: ["Community Service", "Teamwork"]
    })
    .select("id, title")
    .single();

  console.log("SUCCESSFULLY PUBLISHED OPPORTUNITY TO SUPABASE:", opp, "Error:", oppErr);
}

testActionLogic();
