"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type Workflow = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  agent: { id: string; name: string } | null;
  nodes: unknown[];
  edges: unknown[];
};

export default function WorkflowsPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflows = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/workflows");
      if (!response.ok) {
        throw new Error("Failed to load workflows");
      }

      const data = await response.json();
      setWorkflows(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to load workflows.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchWorkflows();
  }, [fetchWorkflows]);

  const handleCreateWorkflow = () => {
    router.push("/workflows/create");
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700";
      case "paused":
        return "bg-amber-100 text-amber-700";
      case "draft":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Workflow Library</h1>
          <div className="flex items-center gap-3">
            <Button onClick={handleCreateWorkflow}>Create Workflow</Button>
            <Link href="/agents">
              <Button variant="outline">Agent Library</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
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

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-48 animate-pulse rounded-3xl bg-white" />
            ))}
          </div>
        ) : workflows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-gray-900">No workflows yet</p>
            <p className="mt-2 text-sm text-gray-600">
              Create your first workflow to orchestrate calls, texts, and integrations.
            </p>
            <Button onClick={handleCreateWorkflow} size="lg" className="mt-6">
              Create Workflow
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <Link key={workflow.id} href={`/workflows/${workflow.id}`}>
                <div className="group h-full rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                        {workflow.name}
                      </h3>
                      {workflow.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                          {workflow.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeColor(workflow.status)}`}>
                      {workflow.status}
                    </span>
                    {workflow.agent && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {workflow.agent.name}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                    <div>
                      <span className="font-semibold text-gray-700">{Array.isArray(workflow.nodes) ? workflow.nodes.length : 0}</span> nodes
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">{Array.isArray(workflow.edges) ? workflow.edges.length : 0}</span> connections
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-gray-500">
                    Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
