"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { TemplatesModal } from "./TemplatesModal";
import {
  agentRoles,
  boomerIndustries,
  buildDefaultAgentName,
  buildDefaultOfferName,
  generateBlueprint,
  generatePriceCopy,
  supportPackages,
  toneProfiles,
} from "@/lib/boomerBlueprints";

export function AgentBuilder() {
  const router = useRouter();
  const [showTemplates, setShowTemplates] = useState(false);
  const [industryId, setIndustryId] = useState(boomerIndustries[0].id);
  const [roleId, setRoleId] = useState(agentRoles[0].id);
  const [toneId, setToneId] = useState(toneProfiles[0].id);
  const [supportIds, setSupportIds] = useState<string[]>(["launch-kit"]);
  const [setupFee, setSetupFee] = useState<number>(897);
  const [retainer, setRetainer] = useState<number>(597);
  const [ownerNotes, setOwnerNotes] = useState("");

  const [agentNameTouched, setAgentNameTouched] = useState(false);
  const [agentName, setAgentName] = useState(
    buildDefaultAgentName(industryId, roleId)
  );

  useEffect(() => {
    if (!agentNameTouched) {
      setAgentName(buildDefaultAgentName(industryId, roleId));
    }
  }, [industryId, roleId, agentNameTouched]);

  const [offerNameTouched, setOfferNameTouched] = useState(false);
  const [offerName, setOfferName] = useState(
    buildDefaultOfferName(industryId, roleId)
  );

  useEffect(() => {
    if (!offerNameTouched) {
      setOfferName(buildDefaultOfferName(industryId, roleId));
    }
  }, [industryId, roleId, offerNameTouched]);

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

  const toggleSupport = (supportId: string) => {
    setSupportIds((prev) =>
      prev.includes(supportId)
        ? prev.filter((id) => id !== supportId)
        : [...prev, supportId]
    );
  };

  const handleLaunch = () => {
    if (typeof window === "undefined") return;

    const payload = {
      industryId,
      roleId,
      toneId,
      supportIds,
      agentName,
      offerName: offerName || buildDefaultOfferName(industryId, roleId),
      price: { setup: setupFee, retainer },
      ownerNotes,
      prefilledDescription: blueprint.description,
      prefilledSystemPrompt: blueprint.systemPrompt,
      prefilledSalesScripts: blueprint.salesScripts,
      prefilledIntegrations: blueprint.recommendedIntegrations,
    };

    window.sessionStorage.setItem("bma-agent-draft", JSON.stringify(payload));
    router.push("/agents/create?source=wizard");
  };

  return (
    <>
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1 text-sm font-semibold text-orange-700">
            Main Street Agent Factory
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">
            Build AI agents boomer-run businesses will actually trust
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Choose the Main Street niche, pick what the agent should handle, and
            ship a sales-ready playbook that comes with scripts, analog-friendly
            collateral, and pricing anchors.
          </p>

          <div className="mt-10 space-y-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Step 1 · Select the boomer niche
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {boomerIndustries.map((industry) => {
                  const isActive = industry.id === industryId;
                  return (
                    <button
                      key={industry.id}
                      onClick={() => setIndustryId(industry.id)}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        isActive
                          ? "border-blue-600 bg-blue-50 shadow-sm"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <p className="text-sm font-semibold text-blue-700">
                        {industry.shortName}
                      </p>
                      <p className="mt-1 text-base font-medium">
                        {industry.label}
                      </p>
                      <p className="mt-2 text-sm text-gray-600">
                        {industry.tagline}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Step 2 · What should the agent own?
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {agentRoles.map((role) => {
                  const isActive = role.id === roleId;
                  return (
                    <button
                      key={role.id}
                      onClick={() => setRoleId(role.id)}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        isActive
                          ? "border-blue-600 bg-blue-50 shadow-sm"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <p className="text-base font-semibold">{role.label}</p>
                      <p className="mt-2 text-sm text-gray-600">
                        {role.summary}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Step 3 · Voice and support extras
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {toneProfiles.map((tone) => {
                  const isActive = tone.id === toneId;
                  return (
                    <button
                      key={tone.id}
                      onClick={() => setToneId(tone.id)}
                      className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                        isActive
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-300 text-gray-700 hover:border-blue-300"
                      }`}
                    >
                      {tone.label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {supportPackages.map((pkg) => {
                  const isActive = supportIds.includes(pkg.id);
                  return (
                    <button
                      key={pkg.id}
                      onClick={() => toggleSupport(pkg.id)}
                      className={`rounded-xl border p-4 text-left text-sm transition-all ${
                        isActive
                          ? "border-emerald-600 bg-emerald-50 shadow-sm"
                          : "border-gray-200 hover:border-emerald-300"
                      }`}
                    >
                      <p className="font-semibold text-emerald-700">{pkg.label}</p>
                      <p className="mt-2 text-gray-600">{pkg.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Agent name (client-facing)
                </span>
                <input
                  value={agentName}
                  onChange={(event) => {
                    setAgentName(event.target.value);
                    setAgentNameTouched(true);
                  }}
                  placeholder="Heritage Front Desk Host"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Offer name (sales deck headline)
                </span>
                <input
                  value={offerName}
                  onChange={(event) => {
                    setOfferName(event.target.value);
                    setOfferNameTouched(true);
                  }}
                  placeholder="Recall Retention Agent"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Setup fee (one-time)
                </span>
                <input
                  type="number"
                  min={0}
                  value={setupFee}
                  onChange={(event) => setSetupFee(Number(event.target.value) || 0)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Monthly retainer
                </span>
                <input
                  type="number"
                  min={0}
                  value={retainer}
                  onChange={(event) => setRetainer(Number(event.target.value) || 0)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">
                Owner notes (objections, legacy processes, names to reference)
              </span>
              <textarea
                value={ownerNotes}
                onChange={(event) => setOwnerNotes(event.target.value)}
                rows={3}
                placeholder="Mention Dr. Patterson, same-day dentures, and mailed reminder cards."
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleLaunch} size="lg">
                Generate Sales Kit
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTemplates(true)}
                className="flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Browse ready-made playbooks
              </Button>
            </div>
          </div>
        </div>

        <aside className="rounded-3xl bg-slate-900 px-6 py-8 text-slate-50 shadow-xl">
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">Playbook preview</p>
              <h2 className="mt-2 text-2xl font-semibold">{blueprint.offerName}</h2>
              <p className="mt-1 text-sm text-slate-300">{blueprint.tagline}</p>
              <p className="mt-3 text-sm font-semibold text-amber-300">
                {generatePriceCopy(blueprint.price)}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-200">Quick wins owners feel</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-300">
                {blueprint.quickWins.map((win) => (
                  <li key={win} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-amber-400" />
                    <span>{win}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-200">Deliverables in the box</p>
              <ul className="mt-2 grid grid-cols-1 gap-2 text-sm text-slate-300">
                {blueprint.deliverables.slice(0, 6).map((item) => (
                  <li key={item} className="rounded-lg bg-slate-800/60 px-3 py-2">
                    {item}
                  </li>
                ))}
                {blueprint.deliverables.length > 6 && (
                  <li className="text-xs text-slate-400">
                    +{blueprint.deliverables.length - 6} more deliverables
                  </li>
                )}
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-200">Analog-friendly proof points</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-300">
                {blueprint.talkingPoints.slice(0, 3).map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-200">Recommended integrations</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {blueprint.recommendedIntegrations.map((integration) => (
                  <span
                    key={integration}
                    className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200"
                  >
                    {integration}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-200">Phone script opener</p>
              <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-800/70 p-4 text-sm leading-relaxed text-slate-100">
                {blueprint.salesScripts.phone.split("\n\n")[0]}
              </pre>
            </div>
          </div>
        </aside>
      </div>

      {showTemplates && <TemplatesModal onClose={() => setShowTemplates(false)} />}
    </>
  );
}

