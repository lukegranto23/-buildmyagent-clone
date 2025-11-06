"use client";

import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import {
  buildDefaultAgentName,
  generateBlueprint,
  generatePriceCopy,
  playbookTemplates,
} from "@/lib/boomerBlueprints";

export function TemplatesModal({ onClose }: { onClose: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const templatesWithBlueprint = useMemo(
    () =>
      playbookTemplates.map((template) => {
        const agentName = template.agentName ?? buildDefaultAgentName(template.industryId, template.roleId);
        const blueprint = generateBlueprint({
          industryId: template.industryId,
          roleId: template.roleId,
          toneId: template.toneId,
          supportIds: template.supportIds,
          agentName,
          offerName: template.offerName,
          price: template.price,
          ownerNotes: template.notes,
        });

        return { template, blueprint, agentName };
      }),
    []
  );

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(playbookTemplates.map((t) => t.category)))],
    []
  );

  const filteredTemplates = templatesWithBlueprint.filter(({ template }) =>
    selectedCategory === "all" ? true : template.category === selectedCategory
  );

  const handleSelectTemplate = (templateId: string) => {
    const match = templatesWithBlueprint.find(({ template }) => template.id === templateId);
    if (!match) return;

    const payload = {
      industryId: match.template.industryId,
      roleId: match.template.roleId,
      toneId: match.template.toneId,
      supportIds: match.template.supportIds,
      agentName: match.agentName,
      offerName: match.template.offerName,
      price: match.template.price,
      ownerNotes: match.template.notes ?? "",
      prefilledDescription: match.blueprint.description,
      prefilledSystemPrompt: match.blueprint.systemPrompt,
      prefilledSalesScripts: match.blueprint.salesScripts,
      prefilledIntegrations: match.blueprint.recommendedIntegrations,
    };

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("bma-agent-draft", JSON.stringify(payload));
      window.location.href = `/agents/create?template=${templateId}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Agent Templates</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <div className="flex gap-2 mb-6 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map(({ template, blueprint }) => (
              <div
                key={template.id}
                className="group flex h-full flex-col justify-between rounded-xl border border-gray-200 p-5 transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                      {template.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {generatePriceCopy(template.price)}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900">{template.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">{template.headline}</p>
                  <p className="mt-3 text-sm text-gray-500">{template.description}</p>
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Quick wins
                    </p>
                    <ul className="mt-1 space-y-1 text-sm text-gray-600">
                      {blueprint.quickWins.slice(0, 2).map((win) => (
                        <li key={win}>• {win}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <Button
                  className="mt-6 w-full"
                  onClick={() => handleSelectTemplate(template.id)}
                >
                  Load this playbook
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

