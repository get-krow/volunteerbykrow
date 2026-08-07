const { Client } = require("pg");

// Connection string format for Supabase:
// postgres://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
// or direct: postgresql://postgres:[password]@db.tedrkyuwcqtvcpcwvjqv.supabase.co:5432/postgres

async function run() {
  const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:VolunteerKrow2026!@db.tedrkyuwcqtvcpcwvjqv.supabase.co:5432/postgres";
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL!");
    
    const res = await client.query(`
      DROP POLICY IF EXISTS "Org members are viewable by org members" ON org_members;
      CREATE POLICY "Org members are viewable by authenticated users"
        ON org_members FOR SELECT
        USING (true);

      DROP POLICY IF EXISTS "Published opportunities are viewable by everyone" ON opportunities;
      CREATE POLICY "Published opportunities are viewable by everyone"
        ON opportunities FOR SELECT
        USING (true);
    `);
    console.log("RLS policy fix applied successfully!", res);
    await client.end();
  } catch (err) {
    console.error("DB connection error:", err.message);
  }
}

run();
