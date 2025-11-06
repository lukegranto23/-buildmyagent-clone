"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type Session = {
  id: string;
  channel: string;
  status: string;
  outcome: string | null;
  createdAt: string;
  updatedAt: string;
  agent: { id: string; offerName: string };
  messages: Array<{ role: string; content: string; createdAt: string }>;
};

type Appointment = {
  id: string;
  customerName: string | null;
  customerContact: string | null;
  start: string;
  end: string;
  channel: string;
  status: string;
  source: string | null;
};

type Stats = {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  scheduledAppointments: number;
  upcomingAppointments: number;
};

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalSessions: 0,
    activeSessions: 0,
    completedSessions: 0,
    scheduledAppointments: 0,
    upcomingAppointments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [sessionsRes, appointmentsRes, statsRes] = await Promise.all([
        fetch("/api/dashboard/sessions?limit=50"),
        fetch("/api/dashboard/appointments?limit=20"),
        fetch("/api/dashboard/stats"),
      ]);

      if (!sessionsRes.ok || !appointmentsRes.ok || !statsRes.ok) {
        throw new Error("Failed to load dashboard data");
      }

      const [sessionsData, appointmentsData, statsData] = await Promise.all([
        sessionsRes.json(),
        appointmentsRes.json(),
        statsRes.json(),
      ]);

      setSessions(sessionsData);
      setAppointments(appointmentsData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to load dashboard.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const getChannelBadgeColor = (channel: string) => {
    const ch = channel.toLowerCase();
    if (ch.includes("voice") || ch === "voice") {
      return "bg-blue-100 text-blue-700";
    }
    if (ch.includes("sms") || ch === "sms") {
      return "bg-green-100 text-green-700";
    }
    if (ch.includes("sandbox") || ch === "sandbox") {
      return "bg-gray-100 text-gray-700";
    }
    return "bg-gray-100 text-gray-700";
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-700";
      case "in-progress":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Operations Dashboard</h1>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => void fetchData()} disabled={isLoading}>
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
            <Link href="/agents">
              <Button variant="ghost">Agent Library</Button>
            </Link>
            <Link href="/">
              <Button variant="ghost">Builder</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total Sessions</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalSessions}</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Active Now</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">{stats.activeSessions}</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Completed</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">{stats.completedSessions}</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Scheduled</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">{stats.scheduledAppointments}</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Upcoming</p>
            <p className="mt-2 text-3xl font-bold text-purple-600">{stats.upcomingAppointments}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Conversations</h2>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-16 animate-pulse rounded-2xl bg-gray-100" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-600">
                No conversations yet. Once you deploy an agent and start receiving calls/texts, they'll show up here.
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getChannelBadgeColor(session.channel)}`}>
                            {session.channel}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadgeColor(session.status)}`}>
                            {session.status}
                          </span>
                          {session.outcome && (
                            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
                              {session.outcome}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{session.agent.offerName}</p>
                        {session.messages.length > 0 && (
                          <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                            {session.messages[session.messages.length - 1]?.content}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-gray-500">{formatDate(session.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-16 animate-pulse rounded-2xl bg-gray-100" />
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-600">
                No appointments scheduled yet. When agents book slots during calls/texts, they'll appear here.
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        {appointment.channel}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        {appointment.status}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {appointment.customerName ?? appointment.customerContact ?? "Unknown"}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">{formatDate(appointment.start)}</p>
                    {appointment.source && (
                      <p className="mt-1 text-xs text-gray-500">Source: {appointment.source}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-3xl rounded-3xl border border-gray-200 bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Conversation Transcript</h3>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Agent:</span>
                  <span className="text-gray-900">{selectedSession.agent.offerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Channel:</span>
                  <span className="text-gray-900">{selectedSession.channel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Status:</span>
                  <span className="text-gray-900">{selectedSession.status}</span>
                </div>
                {selectedSession.outcome && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Outcome:</span>
                    <span className="text-gray-900">{selectedSession.outcome}</span>
                  </div>
                )}
              </div>

              <div className="max-h-[60vh] space-y-3 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 p-4">
                {selectedSession.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      message.role === "assistant"
                        ? "bg-blue-100 text-blue-900"
                        : "ml-auto bg-gray-900 text-white"
                    }`}
                  >
                    <p className="mb-1 text-xs font-semibold opacity-70">
                      {message.role === "assistant" ? "Agent" : "Customer"}
                    </p>
                    <p>{message.content}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedSession(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

