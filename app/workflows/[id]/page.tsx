"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { WorkflowBuilder } from "@/components/workflows/WorkflowBuilder";

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

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflow = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/workflows/${id}`);
      if (!response.ok) {
        throw new Error("Failed to load workflow");
      }

      const data = await response.json();
      setWorkflow(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to load workflow.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchWorkflow();
  }, [fetchWorkflow]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this workflow?")) {
      return;
    }

    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete workflow");
      }

      router.push("/workflows");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to delete workflow");
    }
  };

  const handleClone = async () => {
    try {
      const response = await fetch(`/api/workflows/${id}/clone`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to clone workflow");
      }

      const cloned = await response.json();
      router.push(`/workflows/${cloned.id}`);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to clone workflow");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm text-gray-600">Loading workflow...</p>
        </div>
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="border-b bg-white">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Workflow</h1>
            <Link href="/workflows">
              <Button variant="outline">Back to Workflows</Button>
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-lg font-semibold text-red-700">{error || "Workflow not found"}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{workflow.name}</h1>
            {workflow.description && (
              <p className="mt-1 text-sm text-gray-600">{workflow.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleClone}>
              Clone
            </Button>
            <Button variant="outline" onClick={handleDelete}>
              Delete
            </Button>
            <Link href="/workflows">
              <Button variant="outline">Back to Workflows</Button>
            </Link>
            <Link href="/agents">
              <Button variant="ghost">Agents</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <WorkflowBuilder />
      </main>
    </div>
  );
}
