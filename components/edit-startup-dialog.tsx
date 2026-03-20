"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateStartup } from "@/lib/actions/startups";
import { STARTUP_STAGES } from "@/lib/db/schema";
import { Pencil } from "lucide-react";

interface StartupProfile {
  id: number;
  name: string;
  website?: string | null;
  city?: string | null;
  stage?: string | null;
  sector?: string | null;
  foundedYear?: number | null;
  description?: string | null;
  problem?: string | null;
  product?: string | null;
  businessModel?: string | null;
  traction?: string | null;
  fundingStatus?: string | null;
  accelerator?: string | null;
}

interface Props {
  startup: StartupProfile;
}

export function EditStartupDialog({ startup }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const fy = fd.get("foundedYear");
    startTransition(async () => {
      await updateStartup(startup.id, {
        name: fd.get("name") as string,
        website: (fd.get("website") as string) || null,
        city: (fd.get("city") as string) || null,
        stage: (fd.get("stage") as string) || null,
        sector: (fd.get("sector") as string) || null,
        foundedYear: fy ? parseInt(fy as string, 10) : null,
        description: (fd.get("description") as string) || null,
        problem: (fd.get("problem") as string) || null,
        product: (fd.get("product") as string) || null,
        businessModel: (fd.get("businessModel") as string) || null,
        traction: (fd.get("traction") as string) || null,
        fundingStatus: (fd.get("fundingStatus") as string) || null,
        accelerator: (fd.get("accelerator") as string) || null,
      });
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-2 text-xs text-zinc-500 hover:text-zinc-300"
          />
        }
      >
        <Pencil className="h-3 w-3" />
        Edit Profile
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto pr-1">
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* Row 1: name + website */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="name"
                  required
                  defaultValue={startup.name}
                  placeholder="Startup name"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Website</Label>
                <Input
                  name="website"
                  type="url"
                  defaultValue={startup.website ?? ""}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            {/* Row 2: city + stage + foundedYear + sector */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">City</Label>
                <Input
                  name="city"
                  defaultValue={startup.city ?? ""}
                  placeholder="Milan"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Stage</Label>
                <select
                  name="stage"
                  defaultValue={startup.stage ?? ""}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">— select —</option>
                  {STARTUP_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Founded year</Label>
                <Input
                  name="foundedYear"
                  type="number"
                  min={1900}
                  max={new Date().getFullYear()}
                  defaultValue={startup.foundedYear ?? ""}
                  placeholder="2022"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Sector</Label>
                <Input
                  name="sector"
                  defaultValue={startup.sector ?? ""}
                  placeholder="Fintech"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea
                name="description"
                rows={3}
                defaultValue={startup.description ?? ""}
                placeholder="Short description of the startup…"
              />
            </div>

            {/* Problem + Product */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Problem</Label>
                <Textarea
                  name="problem"
                  rows={3}
                  defaultValue={startup.problem ?? ""}
                  placeholder="What problem do they solve?"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Product</Label>
                <Textarea
                  name="product"
                  rows={3}
                  defaultValue={startup.product ?? ""}
                  placeholder="What is the product?"
                />
              </div>
            </div>

            {/* Business model + Traction */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Business model</Label>
                <Textarea
                  name="businessModel"
                  rows={3}
                  defaultValue={startup.businessModel ?? ""}
                  placeholder="SaaS, marketplace, etc."
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Traction</Label>
                <Textarea
                  name="traction"
                  rows={3}
                  defaultValue={startup.traction ?? ""}
                  placeholder="MRR, users, growth…"
                />
              </div>
            </div>

            {/* Funding status + Accelerator */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Funding status</Label>
                <Input
                  name="fundingStatus"
                  defaultValue={startup.fundingStatus ?? ""}
                  placeholder="Bootstrapped / Raising…"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Accelerator</Label>
                <Input
                  name="accelerator"
                  defaultValue={startup.accelerator ?? ""}
                  placeholder="YC, Techstars…"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
