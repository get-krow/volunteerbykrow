"use client";

import * as React from "react";
import { MessageSquare, Send, Search, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const conversations = [
  { id: 1, org: "Green Earth Foundation", lastMsg: "See you on Saturday at 9:00 AM!", time: "10:42 AM", unread: true },
  { id: 2, org: "Bright Futures Academy", lastMsg: "Thanks for submitting your tutoring hours.", time: "Yesterday", unread: false },
];

export default function VolunteerMessagesPage() {
  const [selected, setSelected] = React.useState(conversations[0]);
  const [text, setText] = React.useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    toast.success("Message Sent");
    setText("");
  };

  return (
    <div className="h-[calc(100vh-140px)] border border-border bg-card rounded-2xl overflow-hidden grid md:grid-cols-3">
      <div className="border-r border-border p-4 space-y-4">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" /> Messages
        </h2>
        <div className="space-y-2">
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelected(c)}
              className={`p-3 rounded-xl cursor-pointer transition-colors space-y-1 ${
                selected.id === c.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">{c.org}</span>
                <span className="text-[10px] text-muted-foreground">{c.time}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{c.lastMsg}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="md:col-span-2 flex flex-col justify-between p-6">
        <div className="border-b border-border pb-4 flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary font-bold">GE</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-base">{selected.org}</h3>
            <p className="text-xs text-muted-foreground">Coordinator • Online</p>
          </div>
        </div>

        <div className="flex-1 py-6 space-y-4 overflow-y-auto">
          <div className="p-3.5 rounded-2xl bg-muted/80 text-xs max-w-md space-y-1">
            <p className="font-semibold">Green Earth Coordinator</p>
            <p>Hi! We look forward to seeing you at the Coastal Cleanup on Saturday at 9 AM.</p>
          </div>
        </div>

        <form onSubmit={handleSend} className="flex gap-2 pt-4 border-t border-border">
          <Input
            placeholder="Type your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="h-11"
          />
          <Button type="submit" size="icon" className="h-11 w-11 shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
