"use client";

import * as React from "react";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function OrganizationMessagesPage() {
  const [text, setText] = React.useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    toast.success("Message Sent to Volunteer");
    setText("");
  };

  return (
    <div className="h-[calc(100vh-140px)] border border-border bg-card rounded-2xl overflow-hidden grid md:grid-cols-3">
      <div className="border-r border-border p-4 space-y-4">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" /> Org Inbox
        </h2>
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 cursor-pointer space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm">Alex Rivera</span>
            <span className="text-[10px] text-muted-foreground">10:42 AM</span>
          </div>
          <p className="text-xs text-muted-foreground">Looking forward to the Beach Cleanup!</p>
        </div>
      </div>

      <div className="md:col-span-2 flex flex-col justify-between p-6">
        <div className="border-b border-border pb-4 flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary font-bold">AR</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-base">Alex Rivera</h3>
            <p className="text-xs text-muted-foreground">Applicant • Coastal Beach Cleanup</p>
          </div>
        </div>

        <div className="flex-1 py-6 space-y-4 overflow-y-auto">
          <div className="p-3.5 rounded-2xl bg-muted/80 text-xs max-w-md space-y-1">
            <p className="font-semibold">Alex Rivera</p>
            <p>Hi! Should I bring my own gloves for the Saturday cleanup?</p>
          </div>
        </div>

        <form onSubmit={handleSend} className="flex gap-2 pt-4 border-t border-border">
          <Input placeholder="Reply to Alex..." value={text} onChange={(e) => setText(e.target.value)} className="h-11" />
          <Button type="submit" size="icon" className="h-11 w-11 shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
