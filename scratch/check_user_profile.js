const { createClient } = require("@supabase/supabase-js");

const url = "https://tedrkyuwcqtvcpcwvjqv.supabase.co";
const service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZHJreXV3Y3F0dmNwY3d2anF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTk3MzYxMiwiZXhwIjoyMTAxNTQ5NjEyfQ.IADWiccVmDR4H57t8ObtZ7yYhIog72JLLhzSWVjkES8";

const supabase = createClient(url, service_key);

async function checkProfile() {
  const userId = "85e8ecbd-a913-4790-bbfc-e8f9e81c280d";
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId);
  console.log("Profile for user:", profile, "Error:", error);

  const { data: orgs } = await supabase.from("organizations").select("*").eq("created_by", userId);
  console.log("Organizations for user:", orgs);
}

checkProfile();
