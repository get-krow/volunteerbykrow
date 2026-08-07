const { createClient } = require("@supabase/supabase-js");

const url = "https://tedrkyuwcqtvcpcwvjqv.supabase.co";
const anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZHJreXV3Y3F0dmNwY3d2anF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NzM2MTIsImV4cCI6MjEwMTU0OTYxMn0.Qmk-s4B22iu8N_maNP0rfNJiOXJJ7N-Vq7YRFRhA5kQ";

const supabase = createClient(url, anon_key);

async function testAnonInsert() {
  const { data, error } = await supabase.from("opportunities").insert({
    title: "Test Opportunity",
    description: "Test description",
    status: "published",
    volunteer_hours: 4
  });

  console.log("Anon insert result:", data, "Error:", error);
}

testAnonInsert();
