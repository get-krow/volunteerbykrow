const { createClient } = require("@supabase/supabase-js");

const url = "https://tedrkyuwcqtvcpcwvjqv.supabase.co";
const service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZHJreXV3Y3F0dmNwY3d2anF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTk3MzYxMiwiZXhwIjoyMTAxNTQ5NjEyfQ.IADWiccVmDR4H57t8ObtZ7yYhIog72JLLhzSWVjkES8";

const supabase = createClient(url, service_key);

async function testGetOpps() {
  const { data, error } = await supabase.from("opportunities").select(`
    *,
    organizations (
      id,
      name,
      logo_url,
      verification_status,
      city,
      province_state,
      country
    )
  `).order("created_at", { ascending: false });

  console.log("Admin get opportunities result count:", data?.length, "Data:", JSON.stringify(data, null, 2), "Error:", error);
}

testGetOpps();
