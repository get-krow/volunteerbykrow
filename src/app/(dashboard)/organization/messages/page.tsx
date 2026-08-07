"use client";

import * as React from "react";
import { MessageSquare, Send, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function OrganizationMessagesPage() {
  const [conversations, setConversations] = React.useState<any[]>([]);
  const [text, setText] = React.useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    toast.success("Message Sent");
    setText("");
  };

  if (conversations.length === 0) {
    return (
      <div className="h-[calc(100vh-140px)] border border-border bg-card rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Inbox className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold">No Messages Yet</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Messages from volunteers interested in your opportunities will appear here in your inbox.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] border border-border bg-card rounded-2xl overflow-hidden grid md:grid-cols-3">
      <div className="border-r border-border p-4 space-y-4">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" /> Org Inbox
        </h2>
      </div>
    </div>
  );
}
