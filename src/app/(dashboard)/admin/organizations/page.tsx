"use client";

import * as React from "react";
import { Building2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminOrganizationsPage() {
  const [orgList, setOrgList] = React.useState<any[]>([]);

  const handleVerify = (id: number) => {
    setOrgList(orgList.map(o => o.id === id ? { ...o, status: "verified" } : o));
    toast.success("Organization Verified & Badge Awarded!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Organization Approvals</h1>
        <p className="text-muted-foreground text-sm">Review non-profit 501(c)(3) documentation and grant verified status.</p>
      </div>

      {orgList.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-12 text-center space-y-3">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-bold">No Organizations Pending Approval</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Newly registered organizations will appear here for verification and badge approval.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orgList.map((o) => (
            <Card key={o.id} className="border-border bg-card">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">{o.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{o.type}</p>
                </div>
                {o.status === "pending" ? (
                  <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700 font-semibold" onClick={() => handleVerify(o.id)}>
                    <CheckCircle2 className="w-4 h-4" /> Grant Verified Badge
                  </Button>
                ) : (
                  <Badge variant="outline" className="text-xs text-green-600 bg-green-500/10 border-green-500/30 gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
