"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createFounder } from "@/lib/actions/founders";
import { Plus } from "lucide-react";

interface Props { startupId: number }

export function AddFounderDialog({ startupId }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createFounder(startupId, {
        name: fd.get("name") as string,
        title: fd.get("title") as string,
        email: fd.get("email") as string,
        linkedin: fd.get("linkedin") as string,
        notes: fd.get("notes") as string,
      });
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="gap-1 h-7 text-xs" />}>
        <Plus className="h-3 w-3" /> Add Founder
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add Founder</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Name *</Label><Input name="name" required placeholder="Full name" /></div>
            <div className="space-y-1"><Label className="text-xs">Title</Label><Input name="title" placeholder="CEO, CTO…" /></div>
          </div>
          <div className="space-y-1"><Label className="text-xs">Email</Label><Input name="email" type="email" placeholder="founder@startup.com" /></div>
          <div className="space-y-1"><Label className="text-xs">LinkedIn</Label><Input name="linkedin" placeholder="https://linkedin.com/in/..." /></div>
          <div className="space-y-1"><Label className="text-xs">Notes</Label><Textarea name="notes" rows={2} placeholder="Background, context…" /></div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={isPending}>{isPending ? "Adding…" : "Add"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
