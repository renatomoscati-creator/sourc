export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { getStartupById } from "@/lib/db/queries/startups";
import { StatusSelect } from "@/components/status-select";
import { AddFounderDialog } from "@/components/add-founder-dialog";
import { AddOutreachDialog } from "@/components/add-outreach-dialog";
import { AddCallNoteDialog } from "@/components/add-call-note-dialog";
import { ScoringGrid } from "@/components/scoring-grid";
import { BriefSection } from "@/components/brief-section";
import { ChevronLeft, ExternalLink, Mail, Linkedin } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

const outreachStatusColors: Record<string, string> = {
  "Replied": "text-emerald-400",
  "Call Scheduled": "text-amber-400",
  "Call Completed": "text-teal-400",
  "No Response": "text-red-400",
  "Closed": "text-zinc-600",
};

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <div className="text-xs text-zinc-600 mb-0.5">{label}</div>
      <div className="text-sm text-zinc-200">{value ?? <span className="text-zinc-700">—</span>}</div>
    </div>
  );
}

export default async function StartupDetailPage({ params }: Props) {
  const { id } = await params;
  const startup = await getStartupById(Number(id));
  if (!startup) notFound();

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-6">
      {/* Back + header */}
      <div className="mb-6">
        <Link href="/startups" className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 mb-3">
          <ChevronLeft className="h-3.5 w-3.5" /> Startups
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100">{startup.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
              {startup.website && (
                <a href={startup.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-zinc-300">
                  {startup.website.replace(/^https?:\/\//, "")}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {startup.stage && <span>{startup.stage}</span>}
              {startup.sector && <span>{startup.sector}</span>}
              {startup.city && <span>{startup.city}</span>}
              {startup.accelerator && <span className="text-emerald-600">{startup.accelerator}</span>}
            </div>
          </div>
          <StatusSelect startupId={startup.id} currentStatus={startup.status} />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Profile + Scoring */}
        <div className="space-y-8">
          {/* Profile */}
          <Section title="Profile">
            <div className="space-y-4">
              {startup.description && (
                <p className="text-sm text-zinc-300 leading-relaxed">{startup.description}</p>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Problem" value={startup.problem} />
                <Field label="Product" value={startup.product} />
                <Field label="Business model" value={startup.businessModel} />
                <Field label="Traction" value={startup.traction} />
                <Field label="Funding status" value={startup.fundingStatus} />
                <Field label="Founded" value={startup.foundedYear} />
              </div>
              {startup.notes && (
                <div>
                  <div className="text-xs text-zinc-600 mb-1">Notes</div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{startup.notes}</p>
                </div>
              )}
            </div>
          </Section>

          {/* Founders */}
          <Section title="Founders" action={<AddFounderDialog startupId={startup.id} />}>
            {startup.founders.length === 0 ? (
              <p className="text-xs text-zinc-700">No founders added yet.</p>
            ) : (
              <div className="space-y-3">
                {startup.founders.map((f) => (
                  <div key={f.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-zinc-100">{f.name}</span>
                        {f.title && <span className="text-xs text-zinc-500 ml-2">{f.title}</span>}
                      </div>
                      <div className="flex gap-2">
                        {f.email && (
                          <a href={`mailto:${f.email}`} className="text-zinc-600 hover:text-zinc-300">
                            <Mail className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {f.linkedin && (
                          <a href={f.linkedin} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-zinc-300">
                            <Linkedin className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                    {f.notes && <p className="text-xs text-zinc-500 mt-1">{f.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Scoring */}
          <Section title="Evaluation">
            <ScoringGrid startup={startup} />
          </Section>
        </div>

        {/* RIGHT: Outreach + Call Notes + Brief */}
        <div className="space-y-8">
          {/* Outreach */}
          <Section title="Outreach" action={<AddOutreachDialog startupId={startup.id} founders={startup.founders} />}>
            {startup.outreachEvents.length === 0 ? (
              <p className="text-xs text-zinc-700">No outreach logged yet.</p>
            ) : (
              <div className="space-y-2">
                {startup.outreachEvents.map((ev) => (
                  <div key={ev.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 font-mono">{ev.date}</span>
                        {ev.channel && <span className="text-zinc-500">· {ev.channel}</span>}
                        {ev.messageType && <span className="text-zinc-600">· {ev.messageType}</span>}
                      </div>
                      <span className={outreachStatusColors[ev.status] ?? "text-zinc-400"}>
                        {ev.status}
                      </span>
                    </div>
                    {ev.founder && <div className="text-zinc-600">{ev.founder.name}</div>}
                    {ev.notes && <p className="text-zinc-400 mt-1">{ev.notes}</p>}
                    {ev.followUpDate && (
                      <p className="text-zinc-600 mt-1">Follow-up: {ev.followUpDate}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Call Notes */}
          <Section title="Call Notes" action={<AddCallNoteDialog startupId={startup.id} />}>
            {startup.callNotes.length === 0 ? (
              <p className="text-xs text-zinc-700">No call notes yet.</p>
            ) : (
              <div className="space-y-3">
                {startup.callNotes.map((note) => (
                  <div key={note.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-zinc-500">{note.date}</span>
                      {note.participants && <span className="text-zinc-600">{note.participants}</span>}
                    </div>
                    {note.whatTheyDo && <NoteField label="What they do" value={note.whatTheyDo} />}
                    {note.problemAndMarket && <NoteField label="Problem & market" value={note.problemAndMarket} />}
                    {note.traction && <NoteField label="Traction" value={note.traction} />}
                    {note.keyRisks && <NoteField label="Key risks" value={note.keyRisks} />}
                    {note.overallImpression && <NoteField label="Impression" value={note.overallImpression} />}
                    {note.recommendation && (
                      <div className="pt-1 border-t border-zinc-800">
                        <span className="text-zinc-500">Rec: </span>
                        <span className="text-zinc-200 font-medium">{note.recommendation}</span>
                      </div>
                    )}
                    {note.nextStep && <NoteField label="Next step" value={note.nextStep} />}
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Brief */}
          <BriefSection startup={startup} />
        </div>
      </div>
    </div>
  );
}

function NoteField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-zinc-600">{label}: </span>
      <span className="text-zinc-300">{value}</span>
    </div>
  );
}
