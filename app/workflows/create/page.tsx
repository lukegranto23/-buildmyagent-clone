"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { WorkflowBuilder } from "@/components/workflows/WorkflowBuilder";
import { workflowTemplates } from "@/lib/workflowData";

const TEMPLATE_SESSION_KEY = "bma-workflow-template";

function WorkflowBuilderShell() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryTemplate = searchParams.get("template");

  const [templateId, setTemplateId] = useState<string | null>(null);

  useEffect(() => {
    let nextTemplate = queryTemplate;

    if (!nextTemplate && typeof window !== "undefined") {
      nextTemplate = window.sessionStorage.getItem(TEMPLATE_SESSION_KEY);
    }

    if (!nextTemplate) {
      nextTemplate = workflowTemplates[0]?.id ?? null;
    }

    setTemplateId(nextTemplate);

    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(TEMPLATE_SESSION_KEY);
    }
  }, [queryTemplate]);

  const activeTemplate = useMemo(
    () => (templateId ? workflowTemplates.find((template) => template.id === templateId) : null),
    [templateId]
  );

  const handleTemplateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value;
    setTemplateId(next);
    router.replace(`/workflows/create?template=${next}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Workflow canvas</p>
            <h1 className="text-2xl font-semibold text-gray-900">Design how your agent runs day to day</h1>
            <p className="mt-1 text-sm text-gray-600">
              Load a template or start tweaking the canvas. Everything here stays client-side until you’re ready to deploy.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/workflows">
              <Button variant="ghost">Back to library</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Agent builder</Button>
            </Link>
            <select
              value={templateId ?? ""}
              onChange={handleTemplateChange}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {workflowTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} · {template.category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="container mx-auto space-y-6 px-4 py-6">
        {activeTemplate ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                  {activeTemplate.category}
                </span>
                <h2 className="mt-3 text-xl font-semibold text-gray-900">{activeTemplate.name}</h2>
                <p className="mt-2 text-sm text-gray-600">{activeTemplate.headline}</p>
              </div>
              <div className="flex flex-col items-end gap-2 text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Workflow stat</p>
                <p className="text-lg font-semibold text-emerald-600">{activeTemplate.heroStat}</p>
              </div>
            </div>
            <ul className="mt-4 grid gap-2 text-xs text-gray-600 sm:grid-cols-3">
              {activeTemplate.timeline.map((step) => (
                <li key={step} className="rounded-2xl bg-gray-50 px-3 py-2">{step}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
          <WorkflowBuilder templateId={templateId} />
        </div>
      </main>
    </div>
  );
}

export default function WorkflowCreatePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading workflow canvas…</div>}>
      <WorkflowBuilderShell />
    </Suspense>
  );
}

