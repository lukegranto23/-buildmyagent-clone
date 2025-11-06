"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { WorkflowBuilder } from "@/components/workflows/WorkflowBuilder";

export default function CreateWorkflowPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "New Workflow",
          description: "A new workflow",
          nodes: JSON.stringify([]),
          edges: JSON.stringify([]),
          status: "draft",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create workflow");
      }

      const workflow = await response.json();
      router.push(`/workflows/${workflow.id}`);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to create workflow");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Create Workflow</h1>
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Workflow"}
            </Button>
            <Link href="/workflows">
              <Button variant="outline">Cancel</Button>
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
