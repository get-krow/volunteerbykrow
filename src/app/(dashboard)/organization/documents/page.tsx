"use client";

import * as React from "react";
import { FolderOpen, ShieldCheck, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function OrganizationDocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Verification & Documents</h1>
          <p className="text-muted-foreground text-sm">Upload 501(c)(3) determination letters, school district accreditations, or legal filings for KROW verified badge status.</p>
        </div>

        <Button size="sm" className="gap-1.5 font-semibold" onClick={() => toast("Opening Document Upload Modal...")}>
          <Upload className="w-4 h-4" /> Upload Document
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-xl">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              <div>
                <p className="font-bold text-sm">501(c)(3) IRS Determination Letter.pdf</p>
                <p className="text-xs text-muted-foreground">Uploaded Aug 1, 2026 • Verified</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs text-green-600 bg-green-500/10 border-green-500/30 gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
