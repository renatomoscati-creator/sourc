"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createOutreachEvent } from "@/lib/actions/outreach";
import { OUTREACH_STATUSES } from "@/lib/db/schema";
import type { StartupWithRelations } from "@/lib/db/queries/startups";
import { Plus } from "lucide-react";

type Founder = NonNullable<StartupWithRelations>["founders"][0];

interface Props {
  startupId: number;
  founders: Founder[];
}

export function AddOutreachDialog({ startupId, founders }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>("Outreach Sent");
  const [founderId, setFounderId] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createOutreachEvent(startupId, {
        date: fd.get("date") as string,
        channel: fd.get("channel") as string,
        status: status ?? "Outreach Sent",
        messageType: fd.get("messageType") as string,
        followUpDate: fd.get("followUpDate") as string,
        founderId: founderId ? Number(founderId) : undefined,
        notes: fd.get("notes") as string,
      });
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="gap-1 h-7 text-xs" />}>
        <Plus className="h-3 w-3" /> Log Outreach
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Log Outreach Event</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Date *</Label><Input name="date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} /></div>
            <div className="space-y-1"><Label className="text-xs">Channel</Label><Input name="channel" placeholder="LinkedIn, Email…" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="text-xs h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{OUTREACH_STATUSES.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Type</Label><Input name="messageType" placeholder="First outreach, Follow-up…" /></div>
          </div>
          {founders.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs">Founder</Label>
              <Select value={founderId} onValueChange={setFounderId}>
                <SelectTrigger className="text-xs h-9"><SelectValue placeholder="Select founder" /></SelectTrigger>
                <SelectContent>{founders.map(f => <SelectItem key={f.id} value={String(f.id)} className="text-xs">{f.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1"><Label className="text-xs">Follow-up date</Label><Input name="followUpDate" type="date" /></div>
          <div className="space-y-1"><Label className="text-xs">Notes</Label><Textarea name="notes" rows={2} placeholder="Context, message sent…" /></div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={isPending}>{isPending ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
