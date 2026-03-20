"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createCallNote } from "@/lib/actions/callNotes";
import { Phone } from "lucide-react";

interface Props { startupId: number }

export function AddCallNoteDialog({ startupId }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => (fd.get(k) as string) || undefined;
    startTransition(async () => {
      await createCallNote(startupId, {
        date: fd.get("date") as string,
        participants: get("participants"),
        founderBackground: get("founderBackground"),
        whatTheyDo: get("whatTheyDo"),
        problemAndMarket: get("problemAndMarket"),
        productMaturity: get("productMaturity"),
        traction: get("traction"),
        customers: get("customers"),
        businessModel: get("businessModel"),
        fundraisingStatus: get("fundraisingStatus"),
        milestones: get("milestones"),
        keyRisks: get("keyRisks"),
        overallImpression: get("overallImpression"),
        recommendation: get("recommendation"),
        nextStep: get("nextStep"),
      });
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="gap-1 h-7 text-xs" />}>
        <Phone className="h-3 w-3" /> Add Call Notes
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add Call Notes</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Date *</Label><Input name="date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} /></div>
            <div className="space-y-1"><Label className="text-xs">Participants</Label><Input name="participants" placeholder="Names, roles…" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field name="founderBackground" label="Founder background" />
            <Field name="whatTheyDo" label="What they do" />
          </div>
          <Field name="problemAndMarket" label="Problem & market" rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <Field name="productMaturity" label="Product maturity" />
            <Field name="traction" label="Traction" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field name="customers" label="Customers / pilots" />
            <Field name="businessModel" label="Business model" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field name="fundraisingStatus" label="Fundraising status" />
            <Field name="milestones" label="Near-term milestones" />
          </div>
          <Field name="keyRisks" label="Key risks" rows={2} />
          <Field name="overallImpression" label="Overall impression" rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <Field name="recommendation" label="Recommendation" placeholder="Present / Do Not Present" />
            <Field name="nextStep" label="Next step" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={isPending}>{isPending ? "Saving…" : "Save Notes"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ name, label, rows, placeholder }: { name: string; label: string; rows?: number; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {rows ? (
        <Textarea name={name} rows={rows} placeholder={placeholder} className="text-sm" />
      ) : (
        <Input name={name} placeholder={placeholder} className="text-sm" />
      )}
    </div>
  );
}
