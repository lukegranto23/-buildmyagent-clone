"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

type WorkflowListItem = {
  id: string;
  name: string;
  status: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  agentId?: string | null;
  metadata?: Record<string, any> | null;
};

const statusFilters = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
];

const defaultTriggerNode = {
  id: "trigger-1",
  type: "trigger",
  label: "Conversation started",
  position: { x: 100, y: 100 },
  data: {
    description: "Begin when the agent receives an inbound call, SMS, or webhook.",
  },
  config: {
    channel: "voice",
  },
};

export default function WorkflowsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const agentIdParam = searchParams.get("agentId");
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") ?? "all");

  const [workflows, setWorkflows] = useState<WorkflowListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [cloningId, setCloningId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchWorkflows = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (agentIdParam) params.set("agentId", agentIdParam);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const response = await fetch(`/api/workflows${params.toString() ? `?${params.toString()}` : ""}`);
      if (!response.ok) {
        throw new Error("Failed to load workflows");
      }
      const payload = (await response.json()) as any[];

      setWorkflows(
        payload.map((item) => ({
          id: item.id,
          name: item.name,
          status: item.status,
          description: item.description,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          agentId: item.agentId,
          metadata: item.metadata ?? null,
        }))
      );
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to load workflows");
    } finally {
      setIsLoading(false);
    }
  }, [agentIdParam, statusFilter]);

  useEffect(() => {
    void fetchWorkflows();
  }, [fetchWorkflows]);

  const statusFilterLabel = useMemo(() => statusFilters.find((option) => option.value === statusFilter)?.label ?? "All", [statusFilter]);

  const handleCreateWorkflow = async () => {
    setIsCreating(true);
    try {
      const payload = {
        agentId: agentIdParam,
        name: agentIdParam ? "Agent runtime workflow" : "New workflow",
        description: "Automate follow-up actions with drag-and-drop nodes.",
        nodes: [defaultTriggerNode],
        edges: [],
        status: "draft",
        metadata: {
          createdFrom: "builder",
        },
      };

      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error ?? "Failed to create workflow");
      }

      const workflow = (await response.json()) as { id: string };
      router.push(`/workflows/${workflow.id}`);
    } catch (err) {
      console.error(err);
      window.alert(err instanceof Error ? err.message : "Unable to create workflow");
    } finally {
      setIsCreating(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const payload = {
        agentId: typeof parsed.agentId === "string" ? parsed.agentId : agentIdParam,
        name: typeof parsed.name === "string" && parsed.name.trim().length > 0 ? parsed.name : `Imported Workflow ${new Date().toLocaleString()}`,
        description: typeof parsed.description === "string" ? parsed.description : null,
        nodes: Array.isArray(parsed.nodes) ? parsed.nodes : [],
        edges: Array.isArray(parsed.edges) ? parsed.edges : [],
        status: typeof parsed.status === "string" ? parsed.status : "draft",
        schedule: typeof parsed.schedule === "string" ? parsed.schedule : null,
        metadata: parsed.metadata && typeof parsed.metadata === "object" ? parsed.metadata : undefined,
      };

      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to import workflow");
      }

      const created = await response.json();
      await fetchWorkflows();
      router.push(`/workflows/${created.id}`);
    } catch (err) {
      console.error(err);
      window.alert(err instanceof Error ? err.message : "Unable to import workflow. Ensure the JSON matches the export format.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleClone = async (workflowId: string) => {
    setCloningId(workflowId);
    try {
      const response = await fetch(`/api/workflows/${workflowId}/clone`, {
        method: "POST",
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.error ?? "Failed to clone workflow");
      }

      await fetchWorkflows();
      router.push(`/workflows/${body.id}`);
    } catch (err) {
      console.error(err);
      window.alert(err instanceof Error ? err.message : "Unable to clone workflow");
    } finally {
      setCloningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Workflow Automation</p>
            <h1 className="text-3xl font-bold text-gray-900">Visual builder</h1>
            <p className="mt-1 text-sm text-gray-600">
              Chain together triggers, decisions, and actions for your agents—no code required.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => void fetchWorkflows()} disabled={isLoading}>
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
            <Button variant="outline" onClick={handleImportClick} disabled={isImporting}>
              {isImporting ? "Importing..." : "Import JSON"}
            </Button>
            <Button onClick={handleCreateWorkflow} disabled={isCreating}>
              {isCreating ? "Creating..." : "New workflow"}
            </Button>
          </div>
        </div>
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleImportFileChange}
      />

      <main className="container mx-auto px-4 py-8">
        {agentIdParam && (
          <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
            Showing workflows scoped to agent <code className="font-mono text-xs">{agentIdParam}</code>.
            <button
              type="button"
              onClick={() => router.push("/workflows")}
              className="ml-3 rounded-full border border-blue-500 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100"
            >
              Clear filter
            </button>
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2"
            >
              {statusFilters.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-gray-500">
            {statusFilterLabel} · {isLoading ? "Loading..." : `${workflows.length} workflows`}
          </span>
        </div>

        {error && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-48 animate-pulse rounded-3xl border border-gray-200 bg-white" />
            ))}
          </div>
        ) : workflows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-600">
            <p className="text-lg font-semibold">No workflows yet</p>
            <p className="mt-2 text-sm text-gray-500">
              Spin up your first automation. Connect triggers, condition logic, and actions just like n8n.
            </p>
            <Button className="mt-6" onClick={handleCreateWorkflow} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create workflow"}
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workflows.map((workflow) => (
              <Link
                key={workflow.id}
                href={`/workflows/${workflow.id}`}
                className="flex h-full flex-col rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
              >
                <div className="flex flex-1 flex-col">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                        workflow.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : workflow.status === "paused"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {workflow.status}
                    </span>
                    {workflow.agentId && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        Agent linked
                      </span>
                    )}
                  </div>
                  <h2 className="mt-3 text-xl font-semibold text-gray-900">{workflow.name}</h2>
                  <p className="mt-2 flex-1 text-sm text-gray-600">
                    {workflow.description ?? "Use the builder to define each step—from triggers to follow-ups."}
                  </p>
                </div>
                <div className="mt-4 border-t border-dashed border-gray-200 pt-4 text-xs text-gray-500">
                  <p>Updated {new Date(workflow.updatedAt).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(event) => {
                      event.preventDefault();
                      void handleClone(workflow.id);
                    }}
                    disabled={cloningId === workflow.id}
                  >
                    {cloningId === workflow.id ? "Cloning..." : "Clone"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(event) => {
                      event.preventDefault();
                      router.push(`/workflows/${workflow.id}`);
                    }}
                  >
                    Open
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

