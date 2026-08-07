const { createClient } = require("@supabase/supabase-js");

const url = "https://tedrkyuwcqtvcpcwvjqv.supabase.co";
const service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZHJreXV3Y3F0dmNwY3d2anF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTk3MzYxMiwiZXhwIjoyMTAxNTQ5NjEyfQ.IADWiccVmDR4H57t8ObtZ7yYhIog72JLLhzSWVjkES8";

const supabase = createClient(url, service_key);

async function testApps() {
  const userId = "85e8ecbd-a913-4790-bbfc-e8f9e81c280d"; // Zachary Tan

  // Get opportunity
  const { data: opp } = await supabase.from("opportunities").select("*").limit(1).single();
  console.log("Opp found:", opp?.id);

  if (!opp) return;

  // Insert application
  const { data: app, error: appErr } = await supabase.from("applications").upsert({
    opportunity_id: opp.id,
    volunteer_id: userId,
    status: "approved"
  }, { onConflict: "opportunity_id,volunteer_id" }).select().single();

  console.log("Application created/updated:", app, "Error:", appErr);

  // Add volunteer hours
  const { data: hr, error: hrErr } = await supabase.from("volunteer_hours").insert({
    volunteer_id: userId,
    opportunity_id: opp.id,
    organization_id: opp.organization_id,
    hours: opp.volunteer_hours || 4,
    date: new Date().toISOString().split("T")[0],
    status: "approved",
    notes: "Verified attendance"
  }).select().single();

  console.log("Volunteer hours recorded:", hr, "Error:", hrErr);

  // Update profile total hours
  const { data: profile } = await supabase.from("profiles").select("total_hours").eq("id", userId).single();
  const newTotal = (parseFloat(profile?.total_hours || 0) + parseFloat(opp.volunteer_hours || 4));
  
  await supabase.from("profiles").update({ total_hours: newTotal }).eq("id", userId);
  console.log("Updated profile total_hours to:", newTotal);
}

testApps();
