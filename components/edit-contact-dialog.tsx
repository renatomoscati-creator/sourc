"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { updateStartup } from "@/lib/actions/startups";
import { Pencil } from "lucide-react";

interface Props {
  startupId: number;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactLinkedin?: string | null;
}

export function EditContactDialog({ startupId, contactEmail, contactPhone, contactLinkedin }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateStartup(startupId, {
        contactEmail: fd.get("contactEmail") as string,
        contactPhone: fd.get("contactPhone") as string,
        contactLinkedin: fd.get("contactLinkedin") as string,
      });
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-zinc-600 hover:text-zinc-300" />}>
        <Pencil className="h-3 w-3" />
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Edit Contact Info</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="space-y-1">
            <Label className="text-xs">Email</Label>
            <Input name="contactEmail" type="email" defaultValue={contactEmail ?? ""} placeholder="hello@startup.com" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Phone</Label>
            <Input name="contactPhone" defaultValue={contactPhone ?? ""} placeholder="+39 02 1234567" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Company LinkedIn</Label>
            <Input name="contactLinkedin" defaultValue={contactLinkedin ?? ""} placeholder="https://linkedin.com/company/…" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={isPending}>{isPending ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
