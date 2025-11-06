"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { generatePriceCopy, type BlueprintOutput, type SupportPackage } from "@/lib/boomerBlueprints";

type ApiAgent = {
  id: string;
  name: string;
  offerName: string;
  clientName: string | null;
  industryId: string;
  roleId: string;
  toneId: string;
  description: string | null;
  systemPrompt: string;
  blueprint: Partial<BlueprintOutput> & Record<string, unknown>;
  quickWins: string[];
  deliverables: string[];
  talkingPoints: string[];
  salesScripts: BlueprintOutput["salesScripts"];
  handoffChecklist: string[];
  integrations: string[];
  supportPackages: Partial<SupportPackage>[];
  priceSetup: number;
  priceRetainer: number;
  ownerNotes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type UiAgent = {
  id: string;
  name: string;
  offerName: string;
  industryLabel: string;
  roleLabel: string;
  toneLabel: string;
  description: string;
  price: { setup: number; retainer: number };
  quickWins: string[];
  deliverables: string[];
  supportLabels: string[];
  salesScripts: BlueprintOutput["salesScripts"];
  systemPrompt: string;
  handoffChecklist: string[];
  integrations: string[];
  status: string;
  createdAt: string;
  raw: ApiAgent;
};

function mapToUiAgent(agent: ApiAgent): UiAgent {
  const blueprint = agent.blueprint ?? ({} as Partial<BlueprintOutput>);
  const supportPackages = Array.isArray(agent.supportPackages) ? agent.supportPackages : [];
  const salesScripts = agent.salesScripts ?? {
    phone: "",
    sms: "",
    email: "",
    printBlurb: "",
  };

  return {
    id: agent.id,
    name: agent.name,
    offerName: agent.offerName,
    industryLabel: blueprint?.industry?.label ?? agent.industryId,
    roleLabel: blueprint?.role?.label ?? agent.roleId,
    toneLabel: blueprint?.tone?.label ?? agent.toneId,
    description: agent.description ?? blueprint?.description ?? "",
    price: { setup: agent.priceSetup, retainer: agent.priceRetainer },
    quickWins: Array.isArray(agent.quickWins) ? agent.quickWins : [],
    deliverables: Array.isArray(agent.deliverables) ? agent.deliverables : [],
    supportLabels: supportPackages.map((item) => item?.label ?? item?.id ?? "Support package"),
    salesScripts,
    systemPrompt: agent.systemPrompt,
    handoffChecklist: Array.isArray(agent.handoffChecklist) ? agent.handoffChecklist : [],
    integrations: Array.isArray(agent.integrations) ? agent.integrations : [],
    status: agent.status,
    createdAt: agent.createdAt,
    raw: agent,
  };
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<UiAgent[]>([]);
  const [industryFilter, setIndustryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/agents");
      if (!response.ok) {
        throw new Error("Failed to load agents");
      }
      const data = (await response.json()) as ApiAgent[];
      setAgents(data.map(mapToUiAgent));
    } catch (err) {
      console.error("Error loading agents", err);
      setError(err instanceof Error ? err.message : "Unable to load agents.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAgents();
  }, [fetchAgents]);

  const uniqueIndustries = useMemo(() => {
    const industries = agents.map((agent) => agent.industryLabel);
    return ["all", ...Array.from(new Set(industries))];
  }, [agents]);

  const filteredAgents = agents.filter((agent) =>
    industryFilter === "all" ? true : agent.industryLabel === industryFilter
  );

  const copyToClipboard = async (label: string, value: string) => {
    if (!value) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        throw new Error("Clipboard unsupported");
      }
    } catch (err) {
      console.warn("Copy failed", err);
      window.alert(`Copy failed. Select and copy the ${label} manually.`);
    }
  };

  const exportPlaybook = async (agent: UiAgent) => {
    const payload = JSON.stringify(agent.raw, null, 2);
    await copyToClipboard("playbook", payload);
  };

    return (
      <div className="min-h-screen bg-gray-100">
        <header className="border-b bg-white">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-bold">
              Main Street Agent Library
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost">Back to builder</Button>
              </Link>
              <Link href="/workflows">
                <Button variant="ghost">Workflows</Button>
              </Link>
              <Link href="/agents/create">
                <Button>Create new agent</Button>
              </Link>
            </div>
          </div>
        </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales-ready playbooks</h1>
            <p className="mt-1 text-sm text-gray-600">
              These agents include prompts, analog collateral, and pricing anchors so you can pitch legacy business owners with confidence.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
            <div className="flex gap-2">
              {uniqueIndustries.map((industry) => (
                <button
                  key={industry}
                  onClick={() => setIndustryFilter(industry)}
                  className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                    industryFilter === industry
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  {industry === "all" ? "All niches" : industry}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => void fetchAgents()} disabled={isLoading}>
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-3xl border border-gray-200 bg-white p-6"
              >
                <div className="h-5 w-32 rounded bg-gray-200" />
                <div className="mt-4 h-4 w-48 rounded bg-gray-200" />
                <div className="mt-4 h-4 w-full rounded bg-gray-200" />
                <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
                <div className="mt-auto h-10 w-full rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-600">
            <p className="text-lg font-semibold">No agents yet</p>
            <p className="mt-2 text-sm text-gray-500">
              Start by packaging your first playbook. Everything you save will show up here.
            </p>
            <div className="mt-6 flex justify-center">
              <Link href="/agents/create">
                <Button>Create your first agent</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="flex h-full flex-col rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      {agent.industryLabel}
                    </span>
                  </div>
                  <h2 className="mt-3 text-xl font-semibold text-gray-900">{agent.offerName}</h2>
                  <p className="mt-1 text-sm text-gray-500">{agent.roleLabel} · {agent.toneLabel}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                    agent.status === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {agent.status}
                </span>
              </div>

              <p className="mt-4 text-sm text-gray-600">{agent.description}</p>

              <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">Pricing anchor</p>
                <p className="mt-1">{generatePriceCopy(agent.price)}</p>
                <p className="mt-3 text-xs uppercase tracking-wide text-gray-500">Quick wins</p>
                <ul className="mt-1 space-y-1 text-sm">
                  {agent.quickWins.slice(0, 3).map((win) => (
                    <li key={win}>• {win}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
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

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
                {agent.supportLabels.map((label) => (
                  <span key={label} className="rounded-full bg-gray-200 px-3 py-1">
                    {label}
                  </span>
                ))}
              </div>

              <div className="mt-auto flex flex-col gap-2 pt-6">
                <Link href={`/agents/${agent.id}/sandbox`}>
                  <Button>Test in sandbox</Button>
                </Link>
                <Button variant="outline" onClick={() => copyToClipboard("system prompt", agent.systemPrompt)}>
                  Copy system prompt
                </Button>
                <Button variant="outline" onClick={() => copyToClipboard("phone script", agent.salesScripts.phone)}>
                  Copy phone script
                </Button>
                <Button variant="outline" onClick={() => exportPlaybook(agent)}>
                  Export full playbook (JSON)
                </Button>
              </div>
            </div>
            ))}

            <Link
              href="/agents/create"
              className="flex h-full min-h-[260px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-white text-center text-gray-600 transition hover:border-blue-500 hover:text-blue-600"
            >
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <p className="mt-2 text-sm font-semibold">Add another Main Street playbook</p>
              <p className="mt-1 text-xs text-gray-500">Package a new niche in under 10 minutes</p>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

