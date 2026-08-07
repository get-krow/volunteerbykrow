const { createClient } = require("@supabase/supabase-js");

const url = "https://tedrkyuwcqtvcpcwvjqv.supabase.co";
const service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZHJreXV3Y3F0dmNwY3d2anF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTk3MzYxMiwiZXhwIjoyMTAxNTQ5NjEyfQ.IADWiccVmDR4H57t8ObtZ7yYhIog72JLLhzSWVjkES8";

const supabase = createClient(url, service_key);

async function test() {
  const { data: opps, count: oppCount, error: oppErr } = await supabase.from("opportunities").select("*", { count: "exact" });
  console.log("Opportunities:", oppCount, opps, oppErr);

  const { data: orgs, count: orgCount, error: orgErr } = await supabase.from("organizations").select("*", { count: "exact" });
  console.log("Organizations:", orgCount, orgs, orgErr);
}

test();
