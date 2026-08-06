"use client";

import * as React from "react";
import { Users, ShieldCheck, Mail, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const users = [
  { id: 1, name: "Alex Rivera", email: "alex@example.com", role: "volunteer", status: "Active" },
  { id: 2, name: "Green Earth Rep", email: "contact@greenearth.org", role: "organization", status: "Active" },
  { id: 3, name: "System Admin", email: "admin@krow.app", role: "admin", status: "Active" },
];

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Platform Users</h1>
        <p className="text-muted-foreground text-sm">Manage registered volunteers, organization accounts, and administrators.</p>
      </div>

      <div className="space-y-3">
        {users.map((u) => (
          <Card key={u.id} className="border-border bg-card">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">{u.name}</h3>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
              <Badge variant="outline" className="capitalize text-xs font-semibold">{u.role}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
