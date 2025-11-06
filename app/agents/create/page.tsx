"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  agentRoles,
  boomerIndustries,
  buildDefaultAgentName,
  buildDefaultOfferName,
  generateBlueprint,
  generatePriceCopy,
  getTemplate,
  supportPackages,
  toneProfiles,
  type BlueprintOutput,
} from "@/lib/boomerBlueprints";

type PrefillData = {
  prefilledDescription?: string;
  prefilledSystemPrompt?: string;
  prefilledSalesScripts?: BlueprintOutput["salesScripts"];
  prefilledIntegrations?: string[];
};

const staticIntegrations = [
  "Phone-to-Text Bridge",
  "Google Voice",
  "WhatsApp Business",
  "Mailchimp",
  "QuickBooks",
  "Jobber / ServiceTitan",
  "Calendly",
  "Dentrix / OpenDental",
  "Printed Mailers",
  "Handwritten Notes",
  "Zapier",
  "CRM CSV Export",
];

function dedupe(values: string[]) {
  return Array.from(new Set(values));
}

function formatNumberInput(value: number) {
  if (Number.isNaN(value) || value < 0) return 0;
  return Math.round(value);
}

function CreateAgentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template");
  const descriptionFromHero = searchParams.get("description");

  const [industryId, setIndustryId] = useState(boomerIndustries[0].id);
  const [roleId, setRoleId] = useState(agentRoles[0].id);
  const [toneId, setToneId] = useState(toneProfiles[0].id);
  const [supportIds, setSupportIds] = useState<string[]>(["launch-kit"]);
  const [setupFee, setSetupFee] = useState<number>(897);
  const [retainer, setRetainer] = useState<number>(597);
  const [ownerNotes, setOwnerNotes] = useState("");

  const [agentName, setAgentName] = useState(buildDefaultAgentName(industryId, roleId));
  const [agentNameTouched, setAgentNameTouched] = useState(false);
  const [offerName, setOfferName] = useState(buildDefaultOfferName(industryId, roleId));
  const [offerNameTouched, setOfferNameTouched] = useState(false);

  const [agentDescription, setAgentDescription] = useState("");
  const [descriptionTouched, setDescriptionTouched] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [systemTouched, setSystemTouched] = useState(false);
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
  const [integrationsTouched, setIntegrationsTouched] = useState(false);

  const [phoneScript, setPhoneScript] = useState("");
  const [smsScript, setSmsScript] = useState("");
  const [emailScript, setEmailScript] = useState("");
  const [printBlurb, setPrintBlurb] = useState("");

  const [prefillData, setPrefillData] = useState<PrefillData | null>(null);
  const [needsBlueprintHydrate, setNeedsBlueprintHydrate] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!agentNameTouched) {
      setAgentName(buildDefaultAgentName(industryId, roleId));
    }
  }, [industryId, roleId, agentNameTouched]);

  useEffect(() => {
    if (!offerNameTouched) {
      setOfferName(buildDefaultOfferName(industryId, roleId));
    }
  }, [industryId, roleId, offerNameTouched]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedDraftRaw = window.sessionStorage.getItem("bma-agent-draft");
    let payload: any = null;

    if (storedDraftRaw) {
      try {
        payload = JSON.parse(storedDraftRaw);
      } catch (error) {
        console.warn("Unable to parse stored draft", error);
      }
    }

    if (!payload && templateId) {
      const template = getTemplate(templateId);
      if (template) {
        const templateAgentName = template.agentName ?? buildDefaultAgentName(template.industryId, template.roleId);
        const blueprint = generateBlueprint({
          industryId: template.industryId,
          roleId: template.roleId,
          toneId: template.toneId,
          supportIds: template.supportIds,
          agentName: templateAgentName,
          offerName: template.offerName,
          price: template.price,
          ownerNotes: template.notes,
        });

        payload = {
          industryId: template.industryId,
          roleId: template.roleId,
          toneId: template.toneId,
          supportIds: template.supportIds,
          agentName: templateAgentName,
          offerName: template.offerName,
          price: template.price,
          ownerNotes: template.notes ?? "",
          prefilledDescription: blueprint.description,
          prefilledSystemPrompt: blueprint.systemPrompt,
          prefilledSalesScripts: blueprint.salesScripts,
          prefilledIntegrations: blueprint.recommendedIntegrations,
        };
      }
    }

    if (!payload && descriptionFromHero) {
      const generatedName = descriptionFromHero.split(" ").slice(0, 3).join(" ") || "Main Street Agent";
      payload = {
        agentName: generatedName,
        agentDescription: descriptionFromHero,
        prefilledDescription: descriptionFromHero,
        prefilledSystemPrompt: `You are a helpful AI assistant. ${descriptionFromHero}`,
      };
    }

    if (payload) {
      if (payload.industryId) setIndustryId(payload.industryId);
      if (payload.roleId) setRoleId(payload.roleId);
      if (payload.toneId) setToneId(payload.toneId);
      if (payload.supportIds) setSupportIds(payload.supportIds);
      if (payload.price) {
        setSetupFee(formatNumberInput(payload.price.setup ?? 0));
        setRetainer(formatNumberInput(payload.price.retainer ?? 0));
      }
      if (payload.ownerNotes) setOwnerNotes(payload.ownerNotes);
      if (payload.agentName) {
        setAgentName(payload.agentName);
        setAgentNameTouched(true);
      }
      if (payload.offerName) {
        setOfferName(payload.offerName);
        setOfferNameTouched(true);
      }
      if (payload.agentDescription) {
        setAgentDescription(payload.agentDescription);
      }

      setPrefillData({
        prefilledDescription: payload.prefilledDescription,
        prefilledSystemPrompt: payload.prefilledSystemPrompt,
        prefilledSalesScripts: payload.prefilledSalesScripts,
        prefilledIntegrations: payload.prefilledIntegrations,
      });
      setNeedsBlueprintHydrate(true);
    }
  }, [templateId, descriptionFromHero]);

  const blueprint = useMemo(
    () =>
      generateBlueprint({
        industryId,
        roleId,
        toneId,
        supportIds,
        agentName,
        offerName: offerName || buildDefaultOfferName(industryId, roleId),
        price: { setup: setupFee, retainer },
        ownerNotes,
      }),
    [industryId, roleId, toneId, supportIds, agentName, offerName, setupFee, retainer, ownerNotes]
  );

  const allIntegrations = useMemo(
    () => dedupe([...blueprint.recommendedIntegrations, ...staticIntegrations]),
    [blueprint.recommendedIntegrations]
  );

  useEffect(() => {
    if (!needsBlueprintHydrate) return;

    setAgentDescription((prev) => (!descriptionTouched || !prev ? prefillData?.prefilledDescription ?? blueprint.description : prev));
    setSystemPrompt((prev) => (!systemTouched || !prev ? prefillData?.prefilledSystemPrompt ?? blueprint.systemPrompt : prev));
    const salesScripts = prefillData?.prefilledSalesScripts ?? blueprint.salesScripts;
    setPhoneScript(salesScripts.phone);
    setSmsScript(salesScripts.sms);
    setEmailScript(salesScripts.email);
    setPrintBlurb(salesScripts.printBlurb);
    if (!integrationsTouched) {
      setSelectedIntegrations(prefillData?.prefilledIntegrations ?? blueprint.recommendedIntegrations);
    }
    setPrefillData(null);
    setNeedsBlueprintHydrate(false);
  }, [blueprint, descriptionTouched, systemTouched, integrationsTouched, needsBlueprintHydrate, prefillData]);

  const toggleSupport = (id: string) => {
    setSupportIds((prev) =>
      prev.includes(id) ? prev.filter((supportId) => supportId !== id) : [...prev, id]
    );
    setNeedsBlueprintHydrate(true);
  };

  const toggleIntegration = (integration: string) => {
    setIntegrationsTouched(true);
    setSelectedIntegrations((prev) =>
      prev.includes(integration)
        ? prev.filter((item) => item !== integration)
        : [...prev, integration]
    );
  };

  const applyBlueprintCopy = () => {
    setAgentDescription(blueprint.description);
    setSystemPrompt(blueprint.systemPrompt);
    setPhoneScript(blueprint.salesScripts.phone);
    setSmsScript(blueprint.salesScripts.sms);
    setEmailScript(blueprint.salesScripts.email);
    setPrintBlurb(blueprint.salesScripts.printBlurb);
    setSelectedIntegrations(blueprint.recommendedIntegrations);
    setDescriptionTouched(false);
    setSystemTouched(false);
    setIntegrationsTouched(false);
  };

  const resetAgentNameToDefault = () => {
    setAgentName(buildDefaultAgentName(industryId, roleId));
    setAgentNameTouched(false);
  };

  const resetOfferNameToDefault = () => {
    setOfferName(buildDefaultOfferName(industryId, roleId));
    setOfferNameTouched(false);
  };

  const copyToClipboard = async (value: string) => {
    if (!value) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        throw new Error("Clipboard API unavailable");
      }
    } catch (error) {
      console.warn("Clipboard copy failed", error);
      window.alert("Copy failed. Try manually selecting the text.");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: agentName,
          offerName: offerName || buildDefaultOfferName(industryId, roleId),
          clientName: blueprint.industry.defaultBusinessName,
          industryId,
          roleId,
          toneId,
          description: agentDescription,
          systemPrompt,
          blueprint,
          quickWins: blueprint.quickWins,
          deliverables: blueprint.deliverables,
          talkingPoints: blueprint.talkingPoints,
          salesScripts: {
            phone: phoneScript,
            sms: smsScript,
            email: emailScript,
            printBlurb,
          },
          handoffChecklist: blueprint.handoffChecklist,
          integrations: selectedIntegrations,
          supportPackages: blueprint.support,
          priceSetup: setupFee,
          priceRetainer: retainer,
          ownerNotes,
          status: "draft",
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.error ?? "Failed to save agent");
      }

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("bma-agent-draft");
      }

      router.push("/agents");
    } catch (error) {
      console.error("Failed to save agent", error);
      const message = error instanceof Error ? error.message : "Something went wrong while saving.";
      window.alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold">
            Main Street Agent Lab
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost">Back to Builder</Button>
            </Link>
            <Link href="/agents">
              <Button variant="outline">My Agents</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Package your boomer-ready AI agent
          </h1>
            <p className="mt-3 text-lg text-gray-600">
              Finalize the sales kit, scripts, and launch checklist. We’ll save everything so you can pitch it, demo it, and onboard a client in under an hour.
            </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    1 · Industry and offer positioning
                  </p>
                  <h2 className="text-lg font-semibold text-gray-900">Dial in the package</h2>
                </div>
                <Button variant="outline" size="sm" onClick={applyBlueprintCopy}>
                  Apply blueprint copy
                </Button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {boomerIndustries.map((industry) => (
                  <button
                    key={industry.id}
                    onClick={() => {
                      setIndustryId(industry.id);
                      setNeedsBlueprintHydrate(true);
                    }}
                    className={`rounded-xl border p-4 text-left text-sm transition ${
                      industry.id === industryId
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <p className="font-semibold text-blue-700">{industry.shortName}</p>
                    <p className="mt-1 font-medium text-gray-900">{industry.label}</p>
                    <p className="mt-2 text-gray-600">{industry.tagline}</p>
                  </button>
                ))}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {agentRoles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      setRoleId(role.id);
                      setNeedsBlueprintHydrate(true);
                    }}
                    className={`rounded-xl border p-4 text-left text-sm transition ${
                      role.id === roleId
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <p className="font-semibold text-gray-900">{role.label}</p>
                    <p className="mt-2 text-gray-600">{role.summary}</p>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {toneProfiles.map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => {
                      setToneId(tone.id);
                      setNeedsBlueprintHydrate(true);
                    }}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      tone.id === toneId
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 text-gray-700 hover:border-blue-300"
                    }`}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {supportPackages.map((pkg) => (
                  <label
                    key={pkg.id}
                    className={`flex cursor-pointer flex-col rounded-xl border p-4 text-sm transition ${
                      supportIds.includes(pkg.id)
                        ? "border-emerald-600 bg-emerald-50"
                        : "border-gray-200 hover:border-emerald-300"
                    }`}
                  >
                    <span className="font-semibold text-emerald-700">{pkg.label}</span>
                    <span className="mt-2 text-gray-600">{pkg.description}</span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        toggleSupport(pkg.id);
                      }}
                      className="mt-4 self-start rounded-full border border-emerald-500 px-3 py-1 text-xs font-semibold text-emerald-700"
                    >
                      {supportIds.includes(pkg.id) ? "Included" : "Add to package"}
                    </button>
                  </label>
                ))}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700">Agent name</span>
                  <div className="flex gap-2">
                    <input
                      value={agentName}
                      onChange={(event) => {
                        setAgentName(event.target.value);
                        setAgentNameTouched(true);
                      }}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Heritage Front Desk Host"
                    />
                    <button
                      type="button"
                      onClick={resetAgentNameToDefault}
                      className="rounded-lg border border-gray-300 px-3 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                    >
                      Reset
                    </button>
                  </div>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700">Offer name</span>
                  <div className="flex gap-2">
                    <input
                      value={offerName}
                      onChange={(event) => {
                        setOfferName(event.target.value);
                        setOfferNameTouched(true);
                      }}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Recall Retention Agent"
                    />
                    <button
                      type="button"
                      onClick={resetOfferNameToDefault}
                      className="rounded-lg border border-gray-300 px-3 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                    >
                      Reset
                    </button>
                  </div>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700">Setup fee</span>
                  <input
                    type="number"
                    min={0}
                    value={setupFee}
                    onChange={(event) => setSetupFee(formatNumberInput(Number(event.target.value) || 0))}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700">Monthly retainer</span>
                  <input
                    type="number"
                    min={0}
                    value={retainer}
                    onChange={(event) => setRetainer(formatNumberInput(Number(event.target.value) || 0))}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              </div>

              <label className="mt-6 flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">Owner notes</span>
                <textarea
                  rows={3}
                  value={ownerNotes}
                  onChange={(event) => setOwnerNotes(event.target.value)}
                  placeholder="Mention Dr. Patterson, mailed reminder cards, and same-day financing offers."
                  className="rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    2 · Copy, prompts, and positioning
                  </p>
                  <h2 className="text-lg font-semibold text-gray-900">Hand the client their playbook</h2>
                </div>
              </div>

              <div className="mt-5 space-y-5">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700">Package description</span>
                  <textarea
                    rows={3}
                    value={agentDescription}
                    onChange={(event) => {
                      setAgentDescription(event.target.value);
                      setDescriptionTouched(true);
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700">System prompt</span>
                  <textarea
                    rows={8}
                    value={systemPrompt}
                    onChange={(event) => {
                      setSystemPrompt(event.target.value);
                      setSystemTouched(true);
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                3 · Sales kit scripts
              </p>
              <h2 className="text-lg font-semibold text-gray-900">Analog-friendly scripts</h2>

              <div className="mt-5 space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Phone script</span>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(phoneScript)}>
                      Copy
                    </Button>
                  </div>
                  <textarea
                    rows={4}
                    value={phoneScript}
                    onChange={(event) => setPhoneScript(event.target.value)}
                    className="rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">SMS follow-up</span>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(smsScript)}>
                      Copy
                    </Button>
                  </div>
                  <textarea
                    rows={3}
                    value={smsScript}
                    onChange={(event) => setSmsScript(event.target.value)}
                    className="rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Email follow-up</span>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(emailScript)}>
                      Copy
                    </Button>
                  </div>
                  <textarea
                    rows={5}
                    value={emailScript}
                    onChange={(event) => setEmailScript(event.target.value)}
                    className="rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Print-ready blurb</span>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(printBlurb)}>
                      Copy
                    </Button>
                  </div>
                  <textarea
                    rows={2}
                    value={printBlurb}
                    onChange={(event) => setPrintBlurb(event.target.value)}
                    className="rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                4 · Integrations & launch checklist
              </p>
              <h2 className="text-lg font-semibold text-gray-900">Make it real on Day 1</h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {allIntegrations.map((integration) => (
                  <label
                    key={integration}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                      selectedIntegrations.includes(integration)
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIntegrations.includes(integration)}
                      onChange={() => toggleIntegration(integration)}
                    />
                    <span>{integration}</span>
                  </label>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">Launch checklist</p>
                <ul className="mt-2 space-y-1">
                  {blueprint.handoffChecklist.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 rounded-2xl bg-white p-6 shadow-sm">
              <Button size="lg" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save agent to library"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  applyBlueprintCopy();
                  window.alert("Blueprint refreshed. Review the copy before sending to your client.");
                }}
              >
                Refresh from blueprint
              </Button>
            </div>
          </section>

          <aside className="h-fit rounded-3xl bg-slate-900 p-6 text-slate-50 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-400">Offer snapshot</p>
              <span className="text-xs text-slate-300">{generatePriceCopy(blueprint.price)}</span>
            </div>
            <h2 className="mt-2 text-2xl font-semibold">{blueprint.offerName}</h2>
            <p className="mt-2 text-sm text-slate-300">{blueprint.tagline}</p>

            <div className="mt-6 space-y-6">
              <div>
                <p className="text-sm font-semibold text-slate-200">Quick wins</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-300">
                  {blueprint.quickWins.map((win) => (
                    <li key={win}>• {win}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-200">Deliverables</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-300">
                  {blueprint.deliverables.slice(0, 8).map((deliverable) => (
                    <li key={deliverable} className="rounded-xl bg-slate-800/60 px-3 py-2">
                      {deliverable}
                    </li>
                  ))}
                  {blueprint.deliverables.length > 8 && (
                    <li className="text-xs text-slate-400">
                      +{blueprint.deliverables.length - 8} more assets included
                    </li>
                  )}
                </ul>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-200">Support add-ons</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-300">
                  {blueprint.support.map((support) => (
                    <li key={support.id}>{support.proofPoint}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-200">Analog-friendly talking points</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-300">
                  {blueprint.talkingPoints.map((point) => (
                    <li key={point}>• {point}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-200">Phone opener</p>
                <pre className="mt-2 whitespace-pre-wrap rounded-2xl bg-slate-800/60 p-4 text-sm leading-relaxed text-slate-100">
                  {blueprint.salesScripts.phone.split("\n\n")[0]}
                </pre>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default function CreateAgentPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <CreateAgentPageContent />
    </Suspense>
  );
}

