import os
from supabase import create_client

url = "https://tedrkyuwcqtvcpcwvjqv.supabase.co"
service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZHJreXV3Y3F0dmNwY3d2anF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTk3MzYxMiwiZXhwIjoyMTAxNTQ5NjEyfQ.IADWiccVmDR4H57t8ObtZ7yYhIog72JLLhzSWVjkES8"

supabase = create_client(url, service_key)

print("Checking opportunities table count...")
res = supabase.table("opportunities").select("count", count="exact").execute()
print("Opportunities count:", res.count)

print("Checking organizations table count...")
res_org = supabase.table("organizations").select("count", count="exact").execute()
print("Organizations count:", res_org.count)
