"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { workflowTemplates } from "@/lib/workflowData";

type SavedWorkflow = {
  id: string;
  name: string;
  templateId?: string;
  createdAt: string;
  notes?: string;
};

const STORAGE_KEY = "bma-workflow-library";
const TEMPLATE_SESSION_KEY = "bma-workflow-template";

function loadSavedWorkflows(): SavedWorkflow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedWorkflow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to parse saved workflows", error);
    return [];
  }
}

function persistWorkflows(workflows: SavedWorkflow[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

export default function WorkflowsPage() {
  const router = useRouter();
  const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflow[]>([]);

  useEffect(() => {
    setSavedWorkflows(loadSavedWorkflows());
  }, []);

  const handleLaunchTemplate = (templateId: string) => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(TEMPLATE_SESSION_KEY, templateId);
    }
    router.push(`/workflows/create?template=${templateId}`);
  };

  const handleSaveTemplate = (templateId: string, name: string) => {
    setSavedWorkflows((prev) => {
      const next: SavedWorkflow[] = [
        {
          id: `${templateId}-${Date.now()}`,
          name,
          templateId,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ];
      persistWorkflows(next);
      return next;
    });
  };

  const handleDeleteSaved = (id: string) => {
    setSavedWorkflows((prev) => {
      const next = prev.filter((workflow) => workflow.id !== id);
      persistWorkflows(next);
      return next;
    });
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setSavedWorkflows((prev) => {
      const next = prev.map((workflow) =>
        workflow.id === id ? { ...workflow, notes } : workflow
      );
      persistWorkflows(next);
      return next;
    });
  };

  const templatesByDifficulty = useMemo(() => {
    return workflowTemplates.reduce<Record<string, typeof workflowTemplates>>((acc, template) => {
      const key = template.difficulty;
      if (!acc[key]) acc[key] = [];
      acc[key].push(template);
      return acc;
    }, {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Workflow library</p>
            <h1 className="text-2xl font-semibold text-gray-900">Blueprint the way your agent operates</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost">Back to builder</Button>
            </Link>
            <Link href="/agents">
              <Button variant="ghost">Agent playbooks</Button>
            </Link>
            <Button onClick={() => router.push("/workflows/create")}>Open canvas</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <section className="mb-10 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                Saved playbooks
              </span>
              <h2 className="text-xl font-semibold text-gray-900">Launch-ready workflows you’ve staged</h2>
              <p className="text-sm text-gray-600">
                Each saved workflow remembers the template you started from and any notes you add before handing it to a client.
              </p>
            </div>
            <Button variant="outline" onClick={() => setSavedWorkflows(() => {
              persistWorkflows([]);
              return [];
            })}>
              Clear library
            </Button>
          </div>

          {savedWorkflows.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-600">
              No saved workflows yet. Load a template below and click “Save to library” to keep a copy.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {savedWorkflows.map((workflow) => {
                const template = workflow.templateId
                  ? workflowTemplates.find((item) => item.id === workflow.templateId)
                  : undefined;
                return (
                  <div key={workflow.id} className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500">Saved flow</p>
                          <h3 className="mt-1 text-lg font-semibold text-gray-900">{workflow.name}</h3>
                          <p className="mt-1 text-xs text-gray-500">Saved {formatDate(workflow.createdAt)}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteSaved(workflow.id)}>
                          Remove
                        </Button>
                      </div>
                      {template ? (
                        <p className="mt-3 text-sm text-gray-600">Based on <span className="font-semibold text-blue-600">{template.name}</span> · {template.category}</p>
                      ) : null}
                      <textarea
                        value={workflow.notes ?? ""}
                        onChange={(event) => handleUpdateNotes(workflow.id, event.target.value)}
                        placeholder="Add notes about handoff, owner expectations, or launch blockers."
                        className="mt-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button onClick={() => handleLaunchTemplate(workflow.templateId ?? workflowTemplates[0]?.id ?? "")}>
                        Open in workflow canvas
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-8">
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Proven templates
            </span>
            <h2 className="text-2xl font-semibold text-gray-900">Start from a workflow Main Street teams already trust</h2>
            <p className="text-sm text-gray-600">
              Pick a template to preload the canvas with triggers, AI logic, and analog touchpoints. Customize anything before you package it for a client.
            </p>
          </div>

          {Object.entries(templatesByDifficulty).map(([difficulty, templates]) => (
            <div key={difficulty} className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{difficulty} workflows</h3>
              <div className="grid gap-5 lg:grid-cols-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex h-full flex-col justify-between rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{template.category}</span>
                        <span className="text-xs font-semibold uppercase text-gray-500">{template.heroStat}</span>
                      </div>
                      <h4 className="mt-3 text-lg font-semibold text-gray-900">{template.name}</h4>
                      <p className="mt-2 text-sm text-gray-600">{template.headline}</p>
                      <p className="mt-3 text-xs text-gray-500">{template.summary}</p>
                      <ul className="mt-4 space-y-1 text-xs text-gray-600">
                        {template.timeline.map((step) => (
                          <li key={step}>• {step}</li>
                        ))}
                      </ul>
                      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-gray-500">
                        {template.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-gray-100 px-3 py-1">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2">
                      <Button onClick={() => handleLaunchTemplate(template.id)}>Open in builder</Button>
                      <Button variant="outline" onClick={() => handleSaveTemplate(template.id, template.name)}>
                        Save to library
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

