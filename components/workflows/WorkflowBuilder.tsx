"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  type Connection,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from "reactflow";

import { WorkflowNode, type WorkflowNodeProps } from "./WorkflowNode";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import {
  buildEdgesFromTemplate,
  buildNodesFromTemplate,
  getWorkflowTemplate,
  workflowModules,
  workflowTemplates,
} from "@/lib/workflowData";
import type { WorkflowModule } from "@/lib/workflowData";

import {
  Bot,
  PhoneCall,
  Zap,
  MessageCircleCode,
  Layers,
  Copy,
  Trash2,
  Play,
  Save,
  PanelRightOpen,
  PanelLeftOpen,
  Loader2,
} from "lucide-react";

type FieldDefinition = (typeof workflowModules)[number]["fields"][number];

type BuilderNodeData = WorkflowNodeProps["data"] & {
  moduleId: string;
  config?: Record<string, string>;
};

type WorkflowBuilderProps = {
  templateId?: string | null;
};

const WORKFLOW_MODULE_MAP = new Map(workflowModules.map((module) => [module.id, module]));

function buildDefaultGraph() {
  const template = workflowTemplates[0];
  if (!template) {
    return {
      nodes: [] as Node<BuilderNodeData>[],
      edges: [] as Edge[],
      templateId: null as string | null,
    };
  }

  return {
    nodes: buildNodesFromTemplate(template, WORKFLOW_MODULE_MAP) as Node<BuilderNodeData>[],
    edges: buildEdgesFromTemplate(template, WORKFLOW_MODULE_MAP) as Edge[],
    templateId: template.id,
  };
}

const DEFAULT_GRAPH = buildDefaultGraph();
const nodeTypes = { workflowNode: WorkflowNode };

export function WorkflowBuilder({ templateId }: WorkflowBuilderProps = {}) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<BuilderNodeData>>(DEFAULT_GRAPH.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(DEFAULT_GRAPH.edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    DEFAULT_GRAPH.nodes[1]?.id ?? DEFAULT_GRAPH.nodes[0]?.id ?? null
  );
  const [search, setSearch] = useState("");
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId),
    [nodes, selectedNodeId]
  );

  useEffect(() => {
    if (!templateId) return;
    const template = getWorkflowTemplate(templateId);
    if (!template) return;

    const templateNodes = buildNodesFromTemplate(template, WORKFLOW_MODULE_MAP) as Node<BuilderNodeData>[];
    const templateEdges = buildEdgesFromTemplate(template, WORKFLOW_MODULE_MAP) as Edge[];

    setNodes(templateNodes);
    setEdges(templateEdges);
    setSelectedNodeId(templateNodes[0]?.id ?? null);
  }, [templateId, setEdges, setNodes]);

  const filteredModules = useMemo(() => {
    if (!search.trim()) return workflowModules;
    return workflowModules.filter((module) => {
      const haystack = `${module.title} ${module.subtitle} ${module.description}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [search]);

  const handleConnect = useCallback(
    (connection: Edge | Connection) => {
      setEdges((prev) => addEdge({ ...connection, animated: true, type: "smoothstep" }, prev));
    },
    [setEdges]
  );

  const handleNodeClick = useCallback((_: unknown, node: Node<BuilderNodeData>) => {
    setSelectedNodeId(node.id);
  }, []);

  const handleAddModule = useCallback(
    (module: WorkflowModule) => {
      const id = `${module.id}-${Date.now()}`;
      const defaultConfig = module.fields.reduce((acc, field) => {
        const value = module.defaults[field.id];
        acc[field.id] = value === undefined ? "" : String(value);
        return acc;
      }, {} as Record<string, string>);

      const newNode: Node<BuilderNodeData> = {
        id,
        type: "workflowNode",
        position: { x: 320, y: 160 + Math.random() * 160 },
        data: {
          moduleId: module.id,
          title: module.title,
          subtitle: module.subtitle,
          description: module.description,
          variant: module.variant,
          status: "draft",
          inputs: module.inputs,
          outputs: module.outputs,
          checklist: module.checklist,
          metrics: module.metrics,
          config: defaultConfig,
        },
      };

      setNodes((prev) => [...prev, newNode]);
      setSelectedNodeId(id);
    },
    [setNodes]
  );

  const handleUpdateConfig = useCallback(
    (fieldId: string, value: string) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === selectedNodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  status: "configured",
                  config: {
                    ...(node.data.config ?? {}),
                    [fieldId]: value,
                  },
                },
              }
            : node
        )
      );
    },
    [selectedNodeId, setNodes]
  );

  const handleDuplicate = useCallback(() => {
    if (!selectedNode) return;
    const newId = `${selectedNode.data.moduleId}-copy-${Date.now()}`;
    setNodes((prev) => [
      ...prev,
      {
        ...selectedNode,
        id: newId,
        position: {
          x: selectedNode.position.x + 40,
          y: selectedNode.position.y + 40,
        },
        data: {
          ...selectedNode.data,
          status: "draft",
        },
      },
    ]);
    setSelectedNodeId(newId);
  }, [selectedNode, setNodes]);

  const handleDeleteNode = useCallback(() => {
    if (!selectedNode) return;
    setNodes((prev) => prev.filter((node) => node.id !== selectedNode.id));
    setEdges((prev) => prev.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
    setSelectedNodeId(null);
  }, [selectedNode, setEdges, setNodes]);

  const handleSimulateRun = useCallback(() => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      alert("Simulation complete. Capture metrics once the runtime is live.");
    }, 1200);
  }, []);

  const renderField = useCallback(
    (field: FieldDefinition, value: string) => {
      switch (field.type) {
        case "textarea":
          return (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              <textarea
                id={field.id}
                value={value}
                placeholder={field.placeholder}
                onChange={(event) => handleUpdateConfig(field.id, event.target.value)}
                className="h-24 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {field.helper && <p className="text-xs text-gray-500">{field.helper}</p>}
            </div>
          );
        case "select":
          return (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              <select
                id={field.id}
                value={value}
                onChange={(event) => handleUpdateConfig(field.id, event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {field.helper && <p className="text-xs text-gray-500">{field.helper}</p>}
            </div>
          );
        case "toggle":
          return (
            <div key={field.id} className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 px-4 py-3">
              <div>
                <Label htmlFor={field.id} className="text-sm font-medium text-gray-700">
                  {field.label}
                </Label>
                {field.helper && <p className="text-xs text-gray-500">{field.helper}</p>}
              </div>
              <Switch
                id={field.id}
                checked={value === "true"}
                onCheckedChange={(checked) => handleUpdateConfig(field.id, String(checked))}
              />
            </div>
          );
        case "number":
          return (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              <div className="rounded-2xl border border-gray-200 px-4 py-3">
                <Slider
                  id={field.id}
                  min={field.min ?? 0}
                  max={field.max ?? 1}
                  step={field.step ?? 1}
                  value={[Number(value)]}
                  onValueChange={([next]) => handleUpdateConfig(field.id, String(next))}
                />
                <p className="mt-2 text-right text-xs font-semibold text-blue-600">{value}</p>
              </div>
              {field.helper && <p className="text-xs text-gray-500">{field.helper}</p>}
            </div>
          );
        default:
          return (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              <Input
                id={field.id}
                value={value}
                placeholder={field.placeholder}
                onChange={(event) => handleUpdateConfig(field.id, event.target.value)}
              />
              {field.helper && <p className="text-xs text-gray-500">{field.helper}</p>}
            </div>
          );
      }
    },
    [handleUpdateConfig]
  );

  return (
    <div className="rounded-3xl border border-gray-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Workflow designer</p>
          <h2 className="text-lg font-semibold text-gray-900">Blueprint how your agent operates in the real world</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsLeftPanelOpen((prev) => !prev)}>
            {isLeftPanelOpen ? <PanelLeftOpen className="mr-1 h-4 w-4" /> : <PanelRightOpen className="mr-1 h-4 w-4" />}Library
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsRightPanelOpen((prev) => !prev)}>
            {isRightPanelOpen ? <PanelRightOpen className="mr-1 h-4 w-4" /> : <PanelLeftOpen className="mr-1 h-4 w-4" />}Inspector
          </Button>
          <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={!selectedNode}>
            <Copy className="mr-1 h-4 w-4" />Duplicate
          </Button>
          <Button variant="outline" size="sm" onClick={handleDeleteNode} disabled={!selectedNode}>
            <Trash2 className="mr-1 h-4 w-4" />Remove
          </Button>
          <Button size="sm" onClick={handleSimulateRun} disabled={isSimulating}>
            {isSimulating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}Run dry test
          </Button>
          <Button size="sm" variant="outline">
            <Save className="mr-1 h-4 w-4" />Save draft
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)_360px]">
        {isLeftPanelOpen ? (
          <aside className="hidden border-r border-gray-200 p-5 lg:block">
            <div className="rounded-2xl bg-gray-50 p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <p className="text-sm font-semibold text-gray-900">Drag steps onto the canvas</p>
              </div>
              <p className="mt-2 text-xs text-gray-600">
                Mix triggers, AI logic, and analog follow-up. Each step comes with boomer-friendly defaults.
              </p>
            </div>

            <div className="mt-4">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search modules"
              />
            </div>

            <Tabs defaultValue="Triggers" className="mt-4">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="Triggers">Triggers</TabsTrigger>
                <TabsTrigger value="AI">AI</TabsTrigger>
                <TabsTrigger value="Integrations">Integrations</TabsTrigger>
                <TabsTrigger value="Utilities">Utilities</TabsTrigger>
              </TabsList>

              {(["Triggers", "AI", "Integrations", "Utilities"] as const).map((category) => (
                <TabsContent key={category} value={category} className="space-y-3 pt-4">
                  {filteredModules
                    .filter((module) => module.category === category)
                    .map((module) => (
                      <button
                        key={module.id}
                        onClick={() => handleAddModule(module)}
                        className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left transition hover:border-blue-400 hover:shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1 rounded-full bg-blue-50 p-2 text-blue-600">
                            {module.category === "Triggers" && <PhoneCall className="h-4 w-4" />}
                            {module.category === "AI" && <Bot className="h-4 w-4" />}
                            {module.category === "Integrations" && <MessageCircleCode className="h-4 w-4" />}
                            {module.category === "Utilities" && <Layers className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{module.title}</p>
                            <p className="text-xs text-gray-500">{module.subtitle}</p>
                            <p className="mt-2 text-xs text-gray-600">{module.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  {filteredModules.filter((module) => module.category === category).length === 0 && (
                    <p className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-xs text-gray-500">
                      No modules match your search yet.
                    </p>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </aside>
        ) : null}

        <section className="relative min-h-[540px] bg-slate-950/95">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onNodeClick={handleNodeClick}
            fitView
            className="rounded-none text-sm"
            nodeTypes={nodeTypes}
          >
            <Background color="#1e293b" gap={24} variant="dots" />
            <MiniMap pannable zoomable className="!bg-slate-800/80 !text-slate-300" />
            <Controls className="border border-slate-700 !bg-slate-900/80 text-white" />
          </ReactFlow>

          <div className="pointer-events-none absolute inset-x-6 bottom-4 flex items-center justify-between text-xs text-slate-300">
            <span>Drag to re-order. Connect steps to route calls, texts, or mailers.</span>
            <span>Tip: double-click any step to jump into templates.</span>
          </div>
        </section>

        {isRightPanelOpen ? (
          <aside className="hidden border-l border-gray-200 p-6 lg:block">
            {selectedNode ? (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Configuration</p>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedNode.data.subtitle ?? selectedNode.data.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{selectedNode.data.description}</p>
                </div>

                <div className="space-y-4">
                  {selectedNode.data.moduleId && WORKFLOW_MODULE_MAP.has(selectedNode.data.moduleId) ? (
                    WORKFLOW_MODULE_MAP.get(selectedNode.data.moduleId)!
                      .fields.map((field) => renderField(field, selectedNode.data.config?.[field.id] ?? ""))
                  ) : (
                    <p className="rounded-2xl bg-gray-100 p-4 text-sm text-gray-600">
                      Select a module to begin configuring it.
                    </p>
                  )}
                </div>

                {selectedNode.data.checklist?.length ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Launch checklist</p>
                    <ul className="mt-2 space-y-2">
                      {selectedNode.data.checklist.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 rounded-2xl border border-gray-200 px-3 py-2 text-sm text-gray-700"
                        >
                          <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            ✓
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {selectedNode.data.metrics?.length ? (
                  <div className="rounded-2xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Live metrics</p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {selectedNode.data.metrics.map((metric) => (
                        <div key={metric.label} className="rounded-xl bg-gray-50 px-3 py-2">
                          <p className="text-[11px] uppercase tracking-wide text-gray-500">{metric.label}</p>
                          <p className="text-sm font-semibold text-gray-900">{metric.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                <p className="text-sm font-semibold text-gray-900">Select a step to configure it</p>
                <p className="mt-2 text-xs text-gray-500">
                  Add more steps from the library. Everything here saves into your agent blueprint.
                </p>
              </div>
            )}
          </aside>
        ) : null}
      </div>
    </div>
  );
}

