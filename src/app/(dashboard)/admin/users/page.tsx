"use client";

import * as React from "react";
import { Users, ShieldCheck, Mail, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminUsersPage() {
  const [userList, setUserList] = React.useState<any[]>([]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Platform Users</h1>
        <p className="text-muted-foreground text-sm">Manage registered volunteers, organization accounts, and administrators.</p>
      </div>

      {userList.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-12 text-center space-y-3">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-bold">No Platform Users Registered</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Newly registered volunteers and organization accounts will appear here for administrative oversight.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {userList.map((u) => (
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
      )}
    </div>
  );
}
