"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { generatePriceCopy } from "@/lib/boomerBlueprints";

type AgentDetail = {
  id: string;
  name: string;
  offerName: string;
  clientName: string | null;
  industryId: string;
  roleId: string;
  toneId: string;
  description: string | null;
  systemPrompt: string;
  ownerNotes: string | null;
  quickWins: string[];
  deliverables: string[];
  talkingPoints: string[];
  supportPackages: Array<{ id?: string; label?: string; description?: string; proofPoint?: string }>;
  integrations: string[];
  blueprint: Record<string, any>;
  priceSetup: number;
  priceRetainer: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  salesScripts?: {
    phone?: string;
    sms?: string;
    email?: string;
    printBlurb?: string;
  };
  handoffChecklist?: string[];
};

type CalendarWindow = {
  start: string;
  end: string;
};

type CalendarDay = {
  day: number;
  windows: CalendarWindow[];
};

type CalendarConfig = {
  timezone: string;
  meetingDuration: number;
  bufferBefore: number;
  bufferAfter: number;
  availability: CalendarDay[];
};

type WorkflowSummary = {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  description?: string | null;
};

type AppointmentSummary = {
  id: string;
  customerName: string | null;
  customerContact: string | null;
  start: string;
  channel: string;
  status: string;
  source: string | null;
};

const weekdayLabels = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function ensureCalendarDraft(config: CalendarConfig | null): CalendarConfig | null {
  if (!config) return null;

  return {
    ...config,
    availability: config.availability.map((day) => ({
      day: day.day,
      windows: day.windows.length > 0 ? day.windows.map((window) => ({ ...window })) : [{ start: "09:00", end: "17:00" }],
    })),
  };
}

export default function AgentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const agentId = params?.id;

  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [calendarConfig, setCalendarConfig] = useState<CalendarConfig | null>(null);
  const [calendarDraft, setCalendarDraft] = useState<CalendarConfig | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [appointments, setAppointments] = useState<AppointmentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [calendarSaving, setCalendarSaving] = useState(false);

  const fetchAgent = useCallback(async () => {
    if (!agentId) return;
    setIsLoading(true);
    setError(null);

    try {
      const [agentRes, calendarRes, workflowRes, appointmentRes] = await Promise.all([
        fetch(`/api/agents/${agentId}`),
        fetch(`/api/agents/${agentId}/calendar`),
        fetch(`/api/workflows?agentId=${agentId}`),
        fetch(`/api/agents/${agentId}/appointments?limit=5`),
      ]);

      if (!agentRes.ok) {
        throw new Error("Failed to load agent details");
      }

      const agentPayload = (await agentRes.json()) as AgentDetail & { salesScripts?: AgentDetail["salesScripts"] };
      setAgent(agentPayload);

      if (calendarRes.ok) {
        const calendar = (await calendarRes.json()) as CalendarConfig;
        setCalendarConfig(calendar);
        setCalendarDraft(ensureCalendarDraft(calendar));
      } else {
        setCalendarConfig(null);
        setCalendarDraft(null);
      }

      if (workflowRes.ok) {
        const workflowData = (await workflowRes.json()) as any[];
        setWorkflows(
          workflowData.map((workflow) => ({
            id: workflow.id,
            name: workflow.name,
            status: workflow.status,
            description: workflow.description,
            createdAt: workflow.createdAt,
            updatedAt: workflow.updatedAt,
          }))
        );
      }

      if (appointmentRes.ok) {
        const appointmentData = (await appointmentRes.json()) as AppointmentSummary[];
        setAppointments(appointmentData);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to load agent");
    } finally {
      setIsLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    void fetchAgent();
  }, [fetchAgent]);

  const priceCopy = useMemo(() => {
    if (!agent) return "";
    return generatePriceCopy({ setup: agent.priceSetup, retainer: agent.priceRetainer });
  }, [agent]);

  const handleStatusChange = async (nextStatus: string) => {
    if (!agentId) return;
    setStatusSaving(true);
    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Failed to update status");
      }

      setAgent(await response.json());
    } catch (err) {
      console.error(err);
      window.alert(err instanceof Error ? err.message : "Unable to update status");
    } finally {
      setStatusSaving(false);
    }
  };

  const handleCalendarChange = (
    dayIndex: number,
    windowIndex: number,
    field: keyof CalendarWindow,
    value: string
  ) => {
    setCalendarDraft((prev) => {
      if (!prev) return prev;
      const nextAvailability = prev.availability.map((day, index) => {
        if (index !== dayIndex) return day;
        const windows = day.windows.map((window, wIndex) =>
          wIndex === windowIndex ? { ...window, [field]: value } : window
        );
        return { ...day, windows };
      });

      return { ...prev, availability: nextAvailability };
    });
  };

  const handleAddWindow = (dayIndex: number) => {
    setCalendarDraft((prev) => {
      if (!prev) return prev;
      const nextAvailability = prev.availability.map((day, index) => {
        if (index !== dayIndex) return day;
        return {
          ...day,
          windows: [...day.windows, { start: "13:00", end: "17:00" }],
        };
      });
      return { ...prev, availability: nextAvailability };
    });
  };

  const handleRemoveWindow = (dayIndex: number, windowIndex: number) => {
    setCalendarDraft((prev) => {
      if (!prev) return prev;
      const nextAvailability = prev.availability.map((day, index) => {
        if (index !== dayIndex) return day;
        const nextWindows = day.windows.filter((_, wIndex) => wIndex !== windowIndex);
        return {
          ...day,
          windows: nextWindows.length > 0 ? nextWindows : [{ start: "09:00", end: "17:00" }],
        };
      });
      return { ...prev, availability: nextAvailability };
    });
  };

  const handleCalendarFieldChange = (field: keyof CalendarConfig, value: string) => {
    setCalendarDraft((prev) => {
      if (!prev) return prev;
      if (field === "timezone") {
        return { ...prev, timezone: value };
      }
      const numericValue = Number(value) || 0;
      return { ...prev, [field]: numericValue } as CalendarConfig;
    });
  };

  const handleCalendarSave = async () => {
    if (!agentId || !calendarDraft) return;
    setCalendarSaving(true);
    try {
      const response = await fetch(`/api/agents/${agentId}/calendar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(calendarDraft),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Failed to save calendar");
      }

      const saved = (await response.json()) as CalendarConfig;
      setCalendarConfig(saved);
      setCalendarDraft(ensureCalendarDraft(saved));
      window.alert("Availability saved");
    } catch (err) {
      console.error(err);
      window.alert(err instanceof Error ? err.message : "Unable to save availability");
    } finally {
      setCalendarSaving(false);
    }
  };

  const copyToClipboard = async (label: string, value?: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      window.alert(`${label} copied to clipboard`);
    } catch (error) {
      console.error("Clipboard copy failed", error);
      window.alert("Copy failed. Try selecting the text manually.");
    }
  };

  if (!agentId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="rounded-2xl bg-white px-6 py-4 text-sm text-gray-600 shadow">Agent ID missing.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-3xl bg-white px-6 py-4 text-sm text-gray-600 shadow">Loading agent...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-3xl bg-white px-6 py-4 text-sm text-red-600 shadow">
          {error ?? "Agent not found"}
        </div>
      </div>
    );
  }

  const blueprintIndustry = agent.blueprint?.industry as { label?: string; shortName?: string; tagline?: string };
  const blueprintRole = agent.blueprint?.role as { label?: string; summary?: string };
  const supportPackages = Array.isArray(agent.supportPackages) ? agent.supportPackages : [];
  const salesScripts = agent.salesScripts ?? {};
  const handoffChecklist = Array.isArray(agent.handoffChecklist) && agent.handoffChecklist.length > 0
    ? agent.handoffChecklist
    : ((agent.blueprint?.handoffChecklist as string[] | undefined) ?? []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Agent Detail</p>
            <h1 className="text-3xl font-bold text-gray-900">{agent.offerName}</h1>
            <p className="mt-1 text-sm text-gray-600">
              {blueprintIndustry?.label ?? agent.industryId} · {blueprintRole?.label ?? agent.roleId}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                agent.status === "active"
                  ? "bg-emerald-100 text-emerald-700"
                  : agent.status === "archived"
                  ? "bg-gray-300 text-gray-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {agent.status}
            </span>
            <Button variant="outline" size="sm" onClick={() => router.refresh()}>
              Refresh
            </Button>
            <Link href={`/agents/${agent.id}/sandbox`}>
              <Button size="sm">Open sandbox</Button>
            </Link>
            <Link href={`/agents/create?from=${agent.id}`}>
              <Button size="sm" variant="outline">
                Duplicate
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Overview</p>
                  <h2 className="text-xl font-semibold text-gray-900">{agent.name}</h2>
                  <p className="mt-1 text-sm text-gray-600">{agent.description}</p>
                  <p className="mt-3 text-sm font-semibold text-emerald-700">{priceCopy}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Deployment status
                  </label>
                  <select
                    value={agent.status}
                    onChange={(event) => handleStatusChange(event.target.value)}
                    disabled={statusSaving}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="archived">Archived</option>
                  </select>
                  {statusSaving && <span className="text-xs text-gray-500">Updating...</span>}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Quick wins</p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-700">
                    {agent.quickWins.slice(0, 4).map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Deliverables</p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-700">
                    {agent.deliverables.slice(0, 4).map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                    {agent.deliverables.length > 4 && (
                      <li className="text-xs text-gray-500">
                        +{agent.deliverables.length - 4} more assets included
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Scripts & prompts</p>
                  <h2 className="text-lg font-semibold text-gray-900">Analog-friendly collateral</h2>
                </div>
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">System prompt</span>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard("System prompt", agent.systemPrompt)}>
                      Copy
                    </Button>
                  </div>
                  <pre className="max-h-48 overflow-y-auto rounded-2xl bg-gray-900/90 p-4 text-xs leading-relaxed text-gray-100">
                    {agent.systemPrompt}
                  </pre>
                </div>

                {salesScripts.phone && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Phone script</span>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard("Phone script", salesScripts.phone)}>
                        Copy
                      </Button>
                    </div>
                    <pre className="max-h-48 overflow-y-auto rounded-2xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-800">
                      {salesScripts.phone}
                    </pre>
                  </div>
                )}

                {salesScripts.sms && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">SMS follow-up</span>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard("SMS script", salesScripts.sms)}>
                        Copy
                      </Button>
                    </div>
                    <pre className="rounded-2xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-800">
                      {salesScripts.sms}
                    </pre>
                  </div>
                )}

                {salesScripts.email && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Email follow-up</span>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard("Email script", salesScripts.email)}>
                        Copy
                      </Button>
                    </div>
                    <pre className="rounded-2xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-800">
                      {salesScripts.email}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Launch checklist</p>
              <h2 className="text-lg font-semibold text-gray-900">Make it real on day one</h2>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                {handoffChecklist.map((item) => (
                  <li key={item} className="rounded-2xl bg-gray-50 px-4 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Support add-ons</p>
              <h2 className="text-lg font-semibold text-gray-900">Give owners analog proof</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {supportPackages.map((pkg, index) => (
                  <div key={`${pkg.id ?? index}-${pkg.label ?? index}`} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <h3 className="text-sm font-semibold text-gray-900">{pkg.label ?? pkg.id ?? "Support package"}</h3>
                    {pkg.description && <p className="mt-2 text-sm text-gray-600">{pkg.description}</p>}
                    {pkg.proofPoint && <p className="mt-2 text-xs text-gray-500">Proof: {pkg.proofPoint}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Integrations</p>
              <h2 className="text-lg font-semibold text-gray-900">Recommended stack</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {agent.integrations.map((integration) => (
                  <span key={integration} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {integration}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Workflows</p>
                  <h2 className="text-lg font-semibold text-gray-900">Automation map</h2>
                </div>
                <Link href={`/workflows?agentId=${agent.id}`}>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {workflows.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    No workflows yet. Use the workflow builder to connect triggers, actions, and follow-up sequences.
                  </p>
                ) : (
                  workflows.slice(0, 3).map((workflow) => (
                    <Link
                      key={workflow.id}
                      href={`/workflows/${workflow.id}`}
                      className="block rounded-2xl border border-gray-200 bg-gray-50 p-3 transition hover:border-blue-300 hover:bg-blue-50"
                    >
                      <p className="text-sm font-semibold text-gray-900">{workflow.name}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {workflow.status} · {new Date(workflow.updatedAt).toLocaleString("en-US", { dateStyle: "short" })}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Upcoming appointments</p>
              <div className="mt-3 space-y-3">
                {appointments.length === 0 ? (
                  <p className="text-sm text-gray-600">No bookings yet. Calendar availability below powers automatic scheduling.</p>
                ) : (
                  appointments.map((appointment) => (
                    <div key={appointment.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                      <p className="text-sm font-semibold text-gray-900">
                        {appointment.customerName ?? appointment.customerContact ?? "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(appointment.start).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">{appointment.channel}</span>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">{appointment.status}</span>
                        {appointment.source && (
                          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-gray-700">{appointment.source}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Calendar & availability</p>
                  <h2 className="text-lg font-semibold text-gray-900">Control booking windows</h2>
                </div>
              </div>

              {calendarDraft ? (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Timezone</span>
                      <input
                        value={calendarDraft.timezone}
                        onChange={(event) => handleCalendarFieldChange("timezone", event.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Duration (min)</span>
                        <input
                          type="number"
                          min={10}
                          max={240}
                          value={calendarDraft.meetingDuration}
                          onChange={(event) => handleCalendarFieldChange("meetingDuration", event.target.value)}
                          className="rounded-lg border border-gray-300 px-3 py-2"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Buffer before</span>
                        <input
                          type="number"
                          min={0}
                          max={120}
                          value={calendarDraft.bufferBefore}
                          onChange={(event) => handleCalendarFieldChange("bufferBefore", event.target.value)}
                          className="rounded-lg border border-gray-300 px-3 py-2"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Buffer after</span>
                        <input
                          type="number"
                          min={0}
                          max={120}
                          value={calendarDraft.bufferAfter}
                          onChange={(event) => handleCalendarFieldChange("bufferAfter", event.target.value)}
                          className="rounded-lg border border-gray-300 px-3 py-2"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {calendarDraft.availability.map((day, dayIndex) => (
                      <div key={day.day} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900">{weekdayLabels[day.day]}</p>
                          <Button variant="ghost" size="sm" onClick={() => handleAddWindow(dayIndex)}>
                            Add window
                          </Button>
                        </div>
                        <div className="mt-3 space-y-3">
                          {day.windows.map((window, windowIndex) => (
                            <div key={`${day.day}-${windowIndex}`} className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-3 text-sm">
                              <span className="text-xs uppercase tracking-wide text-gray-500">Start</span>
                              <input
                                type="time"
                                value={window.start}
                                onChange={(event) => handleCalendarChange(dayIndex, windowIndex, "start", event.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2"
                              />
                              <input
                                type="time"
                                value={window.end}
                                onChange={(event) => handleCalendarChange(dayIndex, windowIndex, "end", event.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveWindow(dayIndex, windowIndex)}
                                className="rounded-full border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button onClick={handleCalendarSave} disabled={calendarSaving} className="w-full">
                    {calendarSaving ? "Saving..." : "Save availability"}
                  </Button>
                </div>
              ) : (
                <div className="mt-3 text-sm text-gray-600">
                  <p>No calendar configuration yet. Saving availability will create a default schedule.</p>
                  <Button onClick={() => setCalendarDraft(ensureCalendarDraft(calendarConfig ?? {
                    timezone: "America/Chicago",
                    meetingDuration: 30,
                    bufferBefore: 10,
                    bufferAfter: 10,
                    availability: [
                      { day: 1, windows: [{ start: "09:00", end: "17:00" }] },
                      { day: 2, windows: [{ start: "09:00", end: "17:00" }] },
                      { day: 3, windows: [{ start: "09:00", end: "17:00" }] },
                      { day: 4, windows: [{ start: "09:00", end: "17:00" }] },
                      { day: 5, windows: [{ start: "09:00", end: "15:00" }] },
                    ],
                  }))} className="mt-4">
                    Initialize availability
                  </Button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

