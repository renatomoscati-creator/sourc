"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { updateFounder, deleteFounder } from "@/lib/actions/founders";
import { Pencil, Trash2 } from "lucide-react";

type Founder = {
  id: number;
  name: string;
  title?: string | null;
  email?: string | null;
  linkedin?: string | null;
  notes?: string | null;
};

interface Props {
  founder: Founder;
  startupId: number;
}

export function EditFounderDialog({ founder, startupId }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateFounder(founder.id, startupId, {
        name: fd.get("name") as string,
        title: fd.get("title") as string,
        email: fd.get("email") as string,
        linkedin: fd.get("linkedin") as string,
        notes: fd.get("notes") as string,
      });
      setOpen(false);
    });
  }

  function handleDelete() {
    if (!confirm(`Are you sure you want to delete ${founder.name}? This action cannot be undone.`)) {
      return;
    }
    setIsDeleting(true);
    deleteFounder(founder.id, startupId).then(() => {
      setOpen(false);
      setIsDeleting(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="ghost" className="gap-1 h-7 text-xs" />}>
        <Pencil className="h-3 w-3" /> Edit
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Founder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Name *</Label>
              <Input 
                name="name" 
                required 
                defaultValue={founder.name || ""} 
                placeholder="Full name" 
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Title</Label>
              <Input 
                name="title" 
                defaultValue={founder.title || ""} 
                placeholder="CEO, CTO…" 
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Email</Label>
            <Input 
              name="email" 
              type="email" 
              defaultValue={founder.email || ""} 
              placeholder="founder@startup.com" 
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">LinkedIn</Label>
            <Input 
              name="linkedin" 
              defaultValue={founder.linkedin || ""} 
              placeholder="https://linkedin.com/in/..." 
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Notes</Label>
            <Textarea 
              name="notes" 
              rows={2} 
              defaultValue={founder.notes || ""} 
              placeholder="Background, context…" 
            />
          </div>
          <div className="flex items-center justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-400 hover:text-red-300 hover:bg-red-950/30 gap-1"
            >
              <Trash2 className="h-3 w-3" />
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => setOpen(false)}
                disabled={isPending || isDeleting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="sm" 
                disabled={isPending || isDeleting}
              >
                {isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
