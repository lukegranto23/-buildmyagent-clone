// @ts-nocheck
"use client";

import "reactflow/dist/style.css";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  NodeChange,
  EdgeChange,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "reactflow";

import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

type WorkflowNodeData = {
  label: string;
  nodeType: string;
  description?: string;
  config?: Record<string, any>;
  data?: Record<string, any>;
};

type WorkflowNode = Node<WorkflowNodeData>;

type WorkflowEdge = Edge<{ condition?: string }>;

type WorkflowRecord = {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  agentId?: string | null;
  metadata?: unknown;
  activeVersionId?: string | null;
  nodes: Array<{
    id: string;
    type: string;
    label: string;
    position: { x: number; y: number };
    data?: Record<string, any>;
    config?: Record<string, any>;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    condition?: string | null;
  }>;
};

type NodeLibraryItem = {
  type: string;
  label: string;
  description: string;
  defaultConfig?: Record<string, any>;
};

type ExecutionLogEntry = {
  id: string;
  level: string;
  message: string;
  nodeId: string | null;
  data: unknown;
  createdAt: string;
};

type ExecutionSummary = {
  id: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  error: string | null;
  input: unknown;
  output: unknown;
};

type ExecutionDetail = ExecutionSummary & {
  logs: ExecutionLogEntry[];
};

type WorkflowVersionSummary = {
  id: string;
  versionNumber: number;
  name: string | null;
  description: string | null;
  notes: string | null;
  createdAt: string;
  isActive: boolean;
};

type WorkflowVersionDetail = {
  id: string;
  versionNumber: number;
  name: string | null;
  description: string | null;
  notes: string | null;
  createdAt: string;
  isActive: boolean;
  nodes: unknown[];
  edges: unknown[];
  metadata: unknown;
  current?: {
    nodes: unknown[];
    edges: unknown[];
    metadata: unknown;
    updatedAt: string;
  };
};

type PresenceParticipant = {
  sessionId: string;
  displayName: string | null;
  color: string | null;
  lastSeen: string;
};

const NODE_LIBRARY: NodeLibraryItem[] = [
  {
    type: "trigger",
    label: "Trigger",
    description: "Start the workflow when a channel event fires (voice, SMS, webhook).",
    defaultConfig: { channel: "voice", event: "inbound_call" },
  },
  {
    type: "condition",
    label: "Condition",
    description: "Branch the flow using a simple expression (e.g. last_result == 'booked').",
    defaultConfig: { condition: "{{trigger_result.status}} == 'booked'" },
  },
  {
    type: "http",
    label: "HTTP Request",
    description: "Send or receive data from external services via REST APIs.",
    defaultConfig: {
      url: "https://api.example.com/endpoint",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { message: "{{conversation.lastMessage}}" },
    },
  },
  {
    type: "transform",
    label: "Transform",
    description: "Map values into a new object for downstream nodes.",
    defaultConfig: {
      mapping: {
        fullName: "{{contact.first}} {{contact.last}}",
        lastMessage: "{{conversation.lastMessage}}",
      },
    },
  },
  {
    type: "email",
    label: "Email",
    description: "Send an email handoff or recap to a team member.",
    defaultConfig: {
      to: "owner@example.com",
      subject: "AI agent conversation summary",
      body: "Conversation transcript: {{conversation.summary}}",
    },
  },
  {
    type: "slack",
    label: "Slack",
    description: "Drop a note in Slack with the latest update or alert.",
    defaultConfig: {
      channel: "#ai-agent-updates",
      message: "{{agent.name}} booked an appointment for {{contact.name}}",
    },
  },
  {
    type: "delay",
    label: "Delay",
    description: "Pause the workflow for a set number of milliseconds.",
    defaultConfig: { duration: 60000 },
  },
  {
    type: "loop",
    label: "Loop",
    description: "Iterate over items (e.g. follow-up sequence) and run nested nodes.",
    defaultConfig: {
      items: ["{{appointment.followUps}}"],
      variable: "followUp",
    },
  },
];

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
];

const PRESENCE_COLORS = [
  "#2563eb",
  "#db2777",
  "#16a34a",
  "#a855f7",
  "#f97316",
  "#0ea5e9",
  "#facc15",
];

function WorkflowNodeCard({ data }: { data: WorkflowNodeData }) {
  return (
    <div className="rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-400">{data.nodeType}</p>
      <p className="text-sm font-semibold text-gray-900">{data.label}</p>
      {data.description && <p className="mt-1 text-xs text-gray-500">{data.description}</p>}
    </div>
  );
}

const nodeTypes = { workflowNode: WorkflowNodeCard };

function serializeNodes(nodes: WorkflowNode[]): WorkflowRecord["nodes"] {
  return nodes.map((node) => ({
    id: node.id,
    type: node.data?.nodeType ?? "action",
    label: node.data?.label ?? "Step",
    position: node.position,
    data: node.data?.data ?? {},
    config: node.data?.config ?? {},
  }));
}

function serializeEdges(edges: WorkflowEdge[]): WorkflowRecord["edges"] {
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    condition: edge.data?.condition ?? null,
  }));
}

function hydrateNodes(payload: WorkflowRecord["nodes"]): WorkflowNode[] {
  if (!Array.isArray(payload)) return [];
  return payload.map((node, index) => ({
    id: node.id ?? `node-${index}`,
    type: "workflowNode",
    position: node.position ?? { x: 150 + index * 40, y: 120 + index * 40 },
    data: {
      label: node.label ?? node.type,
      nodeType: node.type ?? "action",
      description:
        (node.data?.description as string | undefined) ??
        NODE_LIBRARY.find((item) => item.type === node.type)?.description,
      config: node.config ?? {},
      data: node.data ?? {},
    },
  }));
}

function hydrateEdges(payload: WorkflowRecord["edges"]): WorkflowEdge[] {
  if (!Array.isArray(payload)) return [];
  return payload.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle ?? undefined,
    targetHandle: edge.targetHandle ?? undefined,
    data: edge.condition ? { condition: edge.condition } : {},
  }));
}

export default function WorkflowBuilderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const workflowId = params?.id;

  const [workflow, setWorkflow] = useState<WorkflowRecord | null>(null);
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testPayload, setTestPayload] = useState<string>(JSON.stringify({ contact: { name: "Jane Doe" } }, null, 2));
  const [runResult, setRunResult] = useState<string>("");
  const [history, setHistory] = useState<ExecutionSummary[]>([]);
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<ExecutionDetail | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [versions, setVersions] = useState<WorkflowVersionSummary[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [versionDetail, setVersionDetail] = useState<WorkflowVersionDetail | null>(null);
  const [isVersionsLoading, setIsVersionsLoading] = useState(false);
  const [versionsError, setVersionsError] = useState<string | null>(null);
  const [isVersionDetailLoading, setIsVersionDetailLoading] = useState(false);
  const [isVersionSaving, setIsVersionSaving] = useState(false);
  const [versionActionId, setVersionActionId] = useState<string | null>(null);
  const [presence, setPresence] = useState<PresenceParticipant[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [presenceName, setPresenceName] = useState<string | null>(null);
  const [presenceColor, setPresenceColor] = useState<string | null>(null);
  const [isEditingPresence, setIsEditingPresence] = useState(false);
  const [pendingPresenceName, setPendingPresenceName] = useState("");
  const [pendingPresenceColor, setPendingPresenceColor] = useState<string>(() => PRESENCE_COLORS[0]);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const presenceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchWorkflow = useCallback(async () => {
    if (!workflowId) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/workflows/${workflowId}`);
      if (!response.ok) {
        throw new Error("Failed to load workflow");
      }
      const payload = (await response.json()) as WorkflowRecord;
      setWorkflow(payload);
      setNodes(hydrateNodes(payload.nodes));
      setEdges(hydrateEdges(payload.edges));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to load workflow");
    } finally {
      setIsLoading(false);
    }
  }, [workflowId]);

  // Initial data loading - moved to after function definitions

useEffect(() => {
  if (typeof window === "undefined" || !workflowId) return;

  const sessionKey = `workflow-presence-${workflowId}`;
  let localSession = window.localStorage.getItem(sessionKey);
  if (!localSession) {
    const generated = typeof window.crypto !== "undefined" && window.crypto.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).slice(2);
    localSession = generated;
    window.localStorage.setItem(sessionKey, generated);
  }
  setSessionId(localSession);

  let storedName = window.localStorage.getItem("workflow-presence-name");
  if (!storedName) {
    storedName = `Teammate ${Math.floor(Math.random() * 900) + 100}`;
    window.localStorage.setItem("workflow-presence-name", storedName);
  }
  setPresenceName(storedName);

  const colorKey = `workflow-presence-color-${localSession}`;
  let storedColor = window.localStorage.getItem(colorKey);
  if (!storedColor) {
    storedColor = PRESENCE_COLORS[Math.floor(Math.random() * PRESENCE_COLORS.length)];
    window.localStorage.setItem(colorKey, storedColor);
  }
  setPresenceColor(storedColor);
}, [workflowId]);

useEffect(() => {
  if (!workflowId || !sessionId) return;

  void sendHeartbeat();
  heartbeatRef.current = setInterval(() => {
    void sendHeartbeat();
  }, 20_000);

  const handleBeforeUnload = () => {
    try {
      const url = `/api/workflows/${workflowId}/presence?sessionId=${encodeURIComponent(sessionId)}`;
      if (navigator.sendBeacon) {
        const blob = new Blob(["{}"], { type: "application/json" });
        navigator.sendBeacon(url, blob);
      } else {
        void fetch(url, { method: "DELETE", keepalive: true });
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", handleBeforeUnload);
  }

  return () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }
    try {
      const url = `/api/workflows/${workflowId}/presence?sessionId=${encodeURIComponent(sessionId)}`;
      void fetch(url, { method: "DELETE", keepalive: true }).catch(() => undefined);
    } catch (error) {
      console.error(error);
    }
  };
}, [sendHeartbeat, sessionId, workflowId]);

useEffect(() => {
  if (!workflowId) return;

  void fetchPresence();
  presenceIntervalRef.current = setInterval(() => {
    void fetchPresence();
  }, 10_000);

  return () => {
    if (presenceIntervalRef.current) {
      clearInterval(presenceIntervalRef.current);
      presenceIntervalRef.current = null;
    }
  };
}, [fetchPresence, workflowId]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: `${connection.source}-${connection.target}-${Date.now()}`,
            data: {},
          },
          eds
        )
      ),
    []
  );

  const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId) ?? null, [nodes, selectedNodeId]);
  const selectedEdge = useMemo(() => edges.find((edge) => edge.id === selectedEdgeId) ?? null, [edges, selectedEdgeId]);

  const updateNodeData = (nodeId: string, updater: (data: WorkflowNodeData) => WorkflowNodeData) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, data: updater(node.data as WorkflowNodeData) } : node))
    );
  };

  const fetchExecutionDetail = useCallback(
    async (executionId: string) => {
      if (!workflowId) return;

      setSelectedExecutionId(executionId);
      setSelectedExecution(null);

      try {
        const response = await fetch(`/api/workflows/${workflowId}/executions/${executionId}/logs`);
        const body = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(body?.error ?? "Failed to load execution detail");
        }

        setSelectedExecution(body as ExecutionDetail);
      } catch (err) {
        console.error(err);
        window.alert(err instanceof Error ? err.message : "Unable to load execution detail");
      }
    },
    [workflowId]
  );

  const loadHistory = useCallback(
    async (options: { selectLatest?: boolean } = {}) => {
      if (!workflowId) return;

      setIsHistoryLoading(true);
      setHistoryError(null);

      try {
        const response = await fetch(`/api/workflows/${workflowId}/executions?limit=10`);
        const body = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(body?.error ?? "Failed to load execution history");
        }

        const executions = Array.isArray(body) ? (body as ExecutionSummary[]) : [];
        setHistory(executions);

        if (options.selectLatest && executions.length > 0) {
          await fetchExecutionDetail(executions[0].id);
        } else if (
          selectedExecutionId &&
          !executions.some((execution) => execution.id === selectedExecutionId)
        ) {
          setSelectedExecutionId(null);
          setSelectedExecution(null);
        }
      } catch (err) {
        console.error(err);
        setHistoryError(err instanceof Error ? err.message : "Unable to load execution history");
      } finally {
        setIsHistoryLoading(false);
      }
    },
    [fetchExecutionDetail, selectedExecutionId, workflowId]
  );

  const loadVersions = useCallback(async () => {
    if (!workflowId) return;

    setIsVersionsLoading(true);
    setVersionsError(null);

    try {
      const response = await fetch(`/api/workflows/${workflowId}/versions`);
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.error ?? "Failed to load versions");
      }

      const list = Array.isArray(body) ? (body as WorkflowVersionSummary[]) : [];
      setVersions(list);

      if (selectedVersionId && !list.some((version) => version.id === selectedVersionId)) {
        setSelectedVersionId(null);
        setVersionDetail(null);
      }
    } catch (err) {
      console.error(err);
      setVersionsError(err instanceof Error ? err.message : "Unable to load versions");
    } finally {
      setIsVersionsLoading(false);
    }
  }, [selectedVersionId, workflowId]);

  const fetchVersionDetail = useCallback(
    async (versionId: string) => {
      if (!workflowId) return;

      setSelectedVersionId(versionId);
      setVersionDetail(null);
      setIsVersionDetailLoading(true);

      try {
        const response = await fetch(`/api/workflows/${workflowId}/versions/${versionId}?includeCurrent=true`);
        const body = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(body?.error ?? "Failed to load version detail");
        }

        const detail = body?.version as WorkflowVersionDetail | undefined;
        if (!detail) {
          throw new Error("Version detail missing");
        }

        setVersionDetail({
          ...detail,
          current: body?.current,
        });
      } catch (err) {
        console.error(err);
        window.alert(err instanceof Error ? err.message : "Unable to load version detail");
      } finally {
        setIsVersionDetailLoading(false);
      }
    },
    [workflowId]
  );

  const handleCreateVersion = useCallback(async () => {
    if (!workflowId) return;
    setIsVersionSaving(true);
    try {
      const response = await fetch(`/api/workflows/${workflowId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activate: false }),
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.error ?? "Failed to create version");
      }

      await loadVersions();
      if (body?.id) {
        await fetchVersionDetail(body.id as string);
      }
    } catch (err) {
      console.error(err);
      window.alert(err instanceof Error ? err.message : "Unable to create version snapshot");
    } finally {
      setIsVersionSaving(false);
    }
  }, [fetchVersionDetail, loadVersions, workflowId]);

  const handleActivateVersion = useCallback(
    async (versionId: string) => {
      if (!workflowId) return;
      setVersionActionId(versionId);
      try {
        const response = await fetch(`/api/workflows/${workflowId}/versions/${versionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "activate" }),
        });

        const body = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(body?.error ?? "Failed to mark version active");
        }

        await loadVersions();
        if (selectedVersionId === versionId) {
          await fetchVersionDetail(versionId);
        }
        await fetchWorkflow();
      } catch (err) {
        console.error(err);
        window.alert(err instanceof Error ? err.message : "Unable to mark version active");
      } finally {
        setVersionActionId(null);
      }
    },
    [fetchVersionDetail, fetchWorkflow, loadVersions, selectedVersionId, workflowId]
  );

  const handleRestoreVersion = useCallback(
    async (versionId: string) => {
      if (!workflowId) return;
      setVersionActionId(versionId);
      try {
        const response = await fetch(`/api/workflows/${workflowId}/versions/${versionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "restore" }),
        });

        const body = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(body?.error ?? "Failed to restore version");
        }

        await fetchWorkflow();
        await loadVersions();
        await fetchVersionDetail(versionId);
        await loadHistory();
      } catch (err) {
        console.error(err);
        window.alert(err instanceof Error ? err.message : "Unable to restore version");
      } finally {
        setVersionActionId(null);
      }
    },
    [fetchVersionDetail, fetchWorkflow, loadHistory, loadVersions, workflowId]
  );

  const fetchPresence = useCallback(async () => {
    if (!workflowId) return;
    try {
      const response = await fetch(`/api/workflows/${workflowId}/presence`);
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.error ?? "Failed to load presence");
      }

      if (Array.isArray(body)) {
        setPresence(body as PresenceParticipant[]);
      }
    } catch (error) {
      console.error(error);
    }
  }, [workflowId]);

  const sendHeartbeat = useCallback(async () => {
    if (!workflowId || !sessionId) return;
    try {
      await fetch(`/api/workflows/${workflowId}/presence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          displayName: presenceName,
          color: presenceColor,
        }),
      });
    } catch (error) {
      console.error(error);
    }
  }, [presenceColor, presenceName, sessionId, workflowId]);

  const openPresenceEditor = useCallback(() => {
    setIsEditingPresence(true);
    setPendingPresenceName(presenceName ?? "");
    setPendingPresenceColor(presenceColor ?? PRESENCE_COLORS[0]);
  }, [presenceColor, presenceName]);

  const handlePresenceSave = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!workflowId || !sessionId) {
        setIsEditingPresence(false);
        return;
      }

      const trimmedName = pendingPresenceName.trim() || `Teammate ${Math.floor(Math.random() * 900) + 100}`;
      setPresenceName(trimmedName);
      setPresenceColor(pendingPresenceColor);
      window.localStorage.setItem("workflow-presence-name", trimmedName);
      window.localStorage.setItem(`workflow-presence-color-${sessionId}`, pendingPresenceColor);
      setIsEditingPresence(false);

      await sendHeartbeat();
      await fetchPresence();
    },
    [fetchPresence, pendingPresenceColor, pendingPresenceName, sendHeartbeat, sessionId, workflowId]
  );

  const handlePresenceCancel = useCallback(() => {
    setIsEditingPresence(false);
  }, []);

  const handleAddNode = (item: NodeLibraryItem) => {
    const id = `${item.type}-${Date.now()}`;
    const newNode: WorkflowNode = {
      id,
      type: "workflowNode",
      position: { x: 240, y: 100 + nodes.length * 60 },
      data: {
        label: item.label,
        nodeType: item.type,
        description: item.description,
        config: item.defaultConfig ? JSON.parse(JSON.stringify(item.defaultConfig)) : {},
        data: {},
      },
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(id);
  };

  const handleSave = async () => {
    if (!workflow || !workflowId) return;
    setIsSaving(true);
    try {
      const payload = {
        name: workflow.name,
        description: workflow.description,
        status: workflow.status,
        nodes: serializeNodes(nodes),
        edges: serializeEdges(edges),
      };

      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to save workflow");
      }

      const latest = (await response.json()) as WorkflowRecord;
      setWorkflow(latest);
      setNodes(hydrateNodes(latest.nodes));
      setEdges(hydrateEdges(latest.edges));
      window.alert("Workflow saved");
    } catch (err) {
      console.error(err);
      window.alert(err instanceof Error ? err.message : "Unable to save workflow");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunTest = async () => {
    if (!workflowId) return;
    let input: Record<string, any> = {};
    try {
      input = testPayload.trim() ? JSON.parse(testPayload) : {};
    } catch (error) {
      window.alert("Test payload must be valid JSON");
      return;
    }

      setIsRunning(true);
      setRunResult("");
      try {
        const response = await fetch(`/api/workflows/${workflowId}/execute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input }),
        });

        const body = await response.json();
        if (!response.ok) {
          throw new Error(body?.error ?? "Workflow execution failed");
        }

        setRunResult(JSON.stringify(body, null, 2));

        if (body?.executionId) {
          await fetchExecutionDetail(body.executionId as string);
        } else {
          setSelectedExecutionId(null);
          setSelectedExecution(null);
        }

        await loadHistory();
    } catch (err) {
      console.error(err);
      setRunResult(err instanceof Error ? err.message : "Failed to run workflow");
    } finally {
      setIsRunning(false);
    }
  };

  const handleExport = async () => {
    if (!workflowId || !workflow) return;
    try {
      const response = await fetch(`/api/workflows/${workflowId}/export`, {
        method: "GET",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to export workflow");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const name = workflow.name?.trim() ?? "workflow";
      const sanitized = name.replace(/[^a-z0-9-_]+/gi, "-") || "workflow";
      link.download = `${sanitized}-${workflowId}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      window.alert(error instanceof Error ? error.message : "Unable to export workflow");
    }
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== nodeId));
    setEdges((prev) => prev.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  };

  const handleDeleteEdge = (edgeId: string) => {
    setEdges((prev) => prev.filter((edge) => edge.id !== edgeId));
    if (selectedEdgeId === edgeId) {
      setSelectedEdgeId(null);
    }
  };

  const updateWorkflowMeta = (updates: Partial<WorkflowRecord>) => {
    setWorkflow((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const getExecutionStatusClass = (status: string) => {
    const normalized = status?.toLowerCase();
    if (normalized === "completed") return "bg-emerald-100 text-emerald-700";
    if (normalized === "failed" || normalized === "error") return "bg-red-100 text-red-700";
    if (normalized === "running" || normalized === "in-progress") return "bg-amber-100 text-amber-700";
    return "bg-gray-200 text-gray-700";
  };

  const getVersionBadgeClass = (isActive: boolean) =>
    isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-700";

  const formatDateTime = (value?: string | null) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleString("en-US", {
        dateStyle: "short",
        timeStyle: "short",
      });
    } catch (error) {
      return value;
    }
  };

  const formatJson = (value: unknown) => {
    if (value === undefined) return "undefined";
    try {
      return typeof value === "string" ? value : JSON.stringify(value, null, 2);
    } catch (error) {
      return String(value);
    }
  };

  const summarizeJson = (value: unknown) => {
    const text = formatJson(value);
    const normalized = typeof text === "string" ? text : String(text);
    return normalized.length > 160 ? `${normalized.slice(0, 157)}...` : normalized;
  };

  const selfPresence = useMemo(
    () => (sessionId ? presence.find((item) => item.sessionId === sessionId) ?? null : null),
    [presence, sessionId]
  );

  const otherPresence = useMemo(
    () => presence.filter((item) => item.sessionId !== sessionId),
    [presence, sessionId]
  );

  const formatPresenceName = (participant: PresenceParticipant) => {
    if (participant.sessionId === sessionId) return "You";
    return participant.displayName?.trim() || "Teammate";
  };

  const formatPresenceTooltip = (timestamp: string) => {
    try {
      return `Last active ${formatDistanceToNow(new Date(timestamp), { addSuffix: true })}`;
    } catch (error) {
      return "Active";
    }
  };

  if (!workflowId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-3xl bg-white px-6 py-4 text-sm text-gray-600 shadow">Workflow ID missing.</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-3xl bg-white px-6 py-4 text-sm text-gray-600 shadow">Loading builder…</div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-3xl bg-white px-6 py-4 text-sm text-red-600 shadow">{error ?? "Workflow not found"}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <header className="border-b bg-white">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push("/workflows")}>⟵ Back to workflows</Button>
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
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span>Active now:</span>
                {presence.length === 0 && <span className="text-gray-400">Just you</span>}
                {selfPresence && (
                  <span
                    title={formatPresenceTooltip(selfPresence.lastSeen)}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1"
                    style={{ borderColor: selfPresence.color ?? undefined }}
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: selfPresence.color ?? "#10b981" }}
                    />
                    {formatPresenceName(selfPresence)}
                  </span>
                )}
                {otherPresence.map((participant) => (
                  <span
                    key={participant.sessionId}
                    title={formatPresenceTooltip(participant.lastSeen)}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1"
                    style={{ borderColor: participant.color ?? undefined }}
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: participant.color ?? "#6366f1" }}
                    />
                    {formatPresenceName(participant)}
                  </span>
                ))}
                <Button variant="ghost" size="sm" onClick={openPresenceEditor} className="ml-2 px-2 py-0 text-xs">
                  Edit profile
                </Button>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
              <input
                value={workflow.name}
                onChange={(event) => updateWorkflowMeta({ name: event.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xl font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={workflow.status}
                onChange={(event) => updateWorkflowMeta({ status: event.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={workflow.description ?? ""}
              onChange={(event) => updateWorkflowMeta({ description: event.target.value })}
              placeholder="Describe what this automation handles."
              className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={() => void fetchWorkflow()}>
                Reset
              </Button>
              <Button variant="outline" onClick={() => void handleCreateVersion()} disabled={isVersionSaving}>
                {isVersionSaving ? "Saving snapshot..." : "Save snapshot"}
              </Button>
              <Button variant="outline" onClick={() => void handleExport()}>
                Export JSON
              </Button>
              <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button onClick={handleRunTest} disabled={isRunning}>
                {isRunning ? "Running..." : "Run test"}
              </Button>
            </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white p-4 lg:block">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Node library</p>
          <div className="mt-3 space-y-3">
            {NODE_LIBRARY.map((item) => (
              <button
                key={item.type}
                onClick={() => handleAddNode(item)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-left text-sm transition hover:border-blue-300 hover:bg-blue-50"
              >
                <p className="font-semibold text-gray-900">{item.label}</p>
                <p className="mt-1 text-xs text-gray-600">{item.description}</p>
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => {
              setSelectedNodeId(node.id);
              setSelectedEdgeId(null);
            }}
            onEdgeClick={(_, edge) => {
              setSelectedEdgeId(edge.id);
              setSelectedNodeId(null);
            }}
            onPaneClick={() => {
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
            }}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background variant="dots" gap={16} size={1} />
            <MiniMap pannable zoomable />
            <Controls />
          </ReactFlow>
        </main>

        <aside className="w-full max-w-md shrink-0 border-l border-gray-200 bg-white p-4">
          {selectedNode ? (
            <NodeInspector
              node={selectedNode}
              onUpdate={(updater) => updateNodeData(selectedNode.id, updater)}
              onDelete={() => handleDeleteNode(selectedNode.id)}
            />
          ) : selectedEdge ? (
            <EdgeInspector
              edge={selectedEdge}
              onUpdate={(updater) =>
                setEdges((prev) =>
                  prev.map((edge) => (edge.id === selectedEdge.id ? { ...edge, data: updater(edge.data ?? {}) } : edge))
                )
              }
              onDelete={() => handleDeleteEdge(selectedEdge.id)}
            />
            ) : (
              <div className="flex h-full flex-col">
                <div className="flex-1 space-y-5 overflow-y-auto pr-1">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Select a node</p>
                    <p className="mt-2 text-sm text-gray-600">
                      Click a node to configure prompts, HTTP requests, delays, and more. Add nodes from the library on the left.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
                    <div className="flex items-center justify-between text-sm">
                      <p className="font-semibold text-gray-700">Test payload</p>
                      <span className="text-xs text-gray-400">Used with “Run test”</span>
                    </div>
                    <textarea
                      value={testPayload}
                      onChange={(event) => setTestPayload(event.target.value)}
                      rows={8}
                      className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {runResult && (
                      <div className="mt-3">
                        <p className="font-semibold text-gray-700">Last response</p>
                        <pre className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700">
                          {runResult}
                        </pre>
                      </div>
                    )}
                  </div>

                  {isEditingPresence && (
                    <form
                      onSubmit={handlePresenceSave}
                      className="rounded-2xl border border-gray-200 bg-white p-4 text-xs text-gray-600 shadow-sm"
                    >
                      <p className="text-sm font-semibold text-gray-900">Edit your profile</p>
                      <label className="mt-3 flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Display name
                        <input
                          value={pendingPresenceName}
                          onChange={(event) => setPendingPresenceName(event.target.value)}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />
                      </label>
                      <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Indicator color</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {PRESENCE_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setPendingPresenceColor(color)}
                              className={`h-6 w-6 rounded-full border ${
                                pendingPresenceColor === color ? "border-gray-900 ring-2 ring-gray-300" : "border-transparent"
                              }`}
                              style={{ backgroundColor: color }}
                              aria-label={`Select color ${color}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" type="submit">
                          Save
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={handlePresenceCancel}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Snapshots</p>
                      <Button variant="ghost" size="sm" onClick={() => void loadVersions()} disabled={isVersionsLoading}>
                        {isVersionsLoading ? "Loading…" : "Refresh"}
                      </Button>
                    </div>
                    {versionsError && (
                      <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                        {versionsError}
                      </div>
                    )}
                    <div className="mt-3 space-y-2">
                      {isVersionsLoading
                        ? Array.from({ length: 2 }).map((_, index) => (
                            <div key={index} className="h-12 animate-pulse rounded-2xl border border-gray-200 bg-gray-100" />
                          ))
                        : versions.map((version) => (
                            <button
                              key={version.id}
                              onClick={() => void fetchVersionDetail(version.id)}
                              className={`w-full rounded-2xl border p-3 text-left transition ${
                                selectedVersionId === version.id
                                  ? "border-purple-500 bg-purple-50 shadow-sm"
                                  : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="font-semibold text-gray-900">v{version.versionNumber}</span>
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${getVersionBadgeClass(
                                      version.isActive
                                    )}`}
                                  >
                                    {version.isActive ? "Active" : "Snapshot"}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">{formatDateTime(version.createdAt)}</span>
                              </div>
                              {version.name && (
                                <p className="mt-1 text-xs font-semibold text-gray-700">{version.name}</p>
                              )}
                              {version.notes ? (
                                <p className="mt-1 text-xs text-gray-600">{version.notes}</p>
                              ) : version.description ? (
                                <p className="mt-1 text-xs text-gray-500">{version.description}</p>
                              ) : null}
                            </button>
                          ))}
                    </div>
                    {!isVersionsLoading && versions.length === 0 && (
                      <div className="mt-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-xs text-gray-500">
                        No snapshots yet. Capture a snapshot to freeze the current configuration.
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Recent runs</p>
                      <Button variant="ghost" size="sm" onClick={() => void loadHistory()} disabled={isHistoryLoading}>
                        {isHistoryLoading ? "Loading…" : "Refresh"}
                      </Button>
                    </div>
                    {historyError && (
                      <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                        {historyError}
                      </div>
                    )}
                    <div className="mt-3 space-y-2">
                      {isHistoryLoading
                        ? Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="h-12 animate-pulse rounded-2xl border border-gray-200 bg-gray-100" />
                          ))
                        : history.map((execution) => (
                              <button
                                key={execution.id}
                                onClick={() => void fetchExecutionDetail(execution.id)}
                              className={`w-full rounded-2xl border p-3 text-left transition ${
                                selectedExecutionId === execution.id
                                  ? "border-blue-500 bg-blue-50 shadow-sm"
                                  : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${getExecutionStatusClass(
                                    execution.status
                                  )}`}
                                >
                                  {execution.status}
                                </span>
                                <span className="text-xs text-gray-500">{formatDateTime(execution.startedAt)}</span>
                              </div>
                              {execution.error ? (
                                <p className="mt-2 text-xs text-red-600">Error: {execution.error}</p>
                              ) : (
                                <p className="mt-2 text-xs text-gray-600">
                                  {summarizeJson(execution.output) || "No output"}
                                </p>
                              )}
                            </button>
                          ))}
                    </div>
                    {!isHistoryLoading && history.length === 0 && (
                      <div className="mt-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-xs text-gray-500">
                        No executions yet. Run a test to see the workflow in action.
                      </div>
                    )}
                  </div>

                  {isVersionDetailLoading ? (
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                      <div className="mt-3 h-32 animate-pulse rounded-lg border border-gray-200 bg-white" />
                    </div>
                  ) : selectedVersionId && versionDetail ? (
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Version v{versionDetail.versionNumber}</p>
                          <p className="text-xs text-gray-500">Captured {formatDateTime(versionDetail.createdAt)}</p>
                          {versionDetail.notes ? (
                            <p className="mt-1 text-xs text-gray-600">{versionDetail.notes}</p>
                          ) : versionDetail.description ? (
                            <p className="mt-1 text-xs text-gray-500">{versionDetail.description}</p>
                          ) : null}
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${getVersionBadgeClass(versionDetail.isActive)}`}>
                          {versionDetail.isActive ? "Active" : "Snapshot"}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {!versionDetail.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void handleActivateVersion(versionDetail.id)}
                            disabled={versionActionId === versionDetail.id}
                          >
                            {versionActionId === versionDetail.id ? "Updating..." : "Mark active"}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => void handleRestoreVersion(versionDetail.id)}
                          disabled={versionActionId === versionDetail.id}
                        >
                          {versionActionId === versionDetail.id ? "Restoring..." : "Restore version"}
                        </Button>
                      </div>

                      <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Snapshot nodes</p>
                          <pre className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700">
                            {formatJson(versionDetail.nodes)}
                          </pre>
                        </div>
                        {versionDetail.current && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Current nodes</p>
                            <pre className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700">
                              {formatJson(versionDetail.current.nodes)}
                            </pre>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Snapshot edges</p>
                          <pre className="mt-2 max-h-32 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700">
                            {formatJson(versionDetail.edges)}
                          </pre>
                        </div>
                        {versionDetail.current && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Current edges</p>
                            <pre className="mt-2 max-h-32 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700">
                              {formatJson(versionDetail.current.edges)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {selectedExecution && (
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Execution detail</p>
                          <p className="text-xs text-gray-500">Started {formatDateTime(selectedExecution.startedAt)}</p>
                          <p className="text-xs text-gray-500">
                            Completed {formatDateTime(selectedExecution.completedAt)}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${getExecutionStatusClass(
                            selectedExecution.status
                          )}`}
                        >
                          {selectedExecution.status}
                        </span>
                      </div>

                      {selectedExecution.error && (
                        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                          {selectedExecution.error}
                        </div>
                      )}

                      <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Output</p>
                        <pre className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700">
                          {formatJson(selectedExecution.output)}
                        </pre>
                      </div>

                      <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Input</p>
                        <pre className="mt-2 max-h-32 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700">
                          {formatJson(selectedExecution.input)}
                        </pre>
                      </div>

                      <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Logs</p>
                        {selectedExecution.logs.length === 0 ? (
                          <p className="mt-2 text-xs text-gray-500">No log entries recorded.</p>
                        ) : (
                          <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                            {selectedExecution.logs.map((log) => (
                              <div
                                key={log.id}
                                className="rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-700"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-gray-900">{log.level.toUpperCase()}</span>
                                  <span className="text-[10px] text-gray-500">
                                    {formatDateTime(log.createdAt)}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs text-gray-700">{log.message}</p>
                                {log.nodeId && (
                                  <p className="mt-1 text-[10px] uppercase tracking-wide text-gray-400">
                                    Node: {log.nodeId}
                                  </p>
                                )}
                                {log.data && (
                                  <pre className="mt-2 max-h-32 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-2 text-[11px] text-gray-700">
                                    {formatJson(log.data)}
                                  </pre>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
        </aside>
      </div>
    </div>
  );
}

function NodeInspector({
  node,
  onUpdate,
  onDelete,
}: {
  node: WorkflowNode;
  onUpdate: (updater: (data: WorkflowNodeData) => WorkflowNodeData) => void;
  onDelete: () => void;
}) {
  const data = node.data ?? { label: node.type, nodeType: "action", config: {} };

  const handleFieldChange = (key: keyof WorkflowNodeData, value: any) => {
    onUpdate((prev) => ({ ...prev, [key]: value }));
  };

  const handleConfigChange = (key: string, value: any) => {
    onUpdate((prev) => ({
      ...prev,
      config: {
        ...(prev.config ?? {}),
        [key]: value,
      },
    }));
  };

  const handleConfigJsonChange = (value: string) => {
    try {
      const parsed = value.trim() ? JSON.parse(value) : {};
      onUpdate((prev) => ({ ...prev, config: parsed }));
    } catch (error) {
      window.alert("Config must be valid JSON");
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Node settings</p>
        <p className="mt-1 text-lg font-semibold text-gray-900">{data.label}</p>
        <p className="text-xs uppercase tracking-wide text-gray-400">{data.nodeType}</p>

        <label className="mt-4 flex flex-col gap-1 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Display label</span>
          <input
            value={data.label}
            onChange={(event) => handleFieldChange("label", event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="mt-3 flex flex-col gap-1 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Description</span>
          <textarea
            value={data.description ?? ""}
            onChange={(event) => handleFieldChange("description", event.target.value)}
            rows={2}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <NodeTypeSpecificConfig data={data} onConfigChange={handleConfigChange} onConfigJsonChange={handleConfigJsonChange} />
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={onDelete}
          className="rounded-full border border-red-400 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
        >
          Delete node
        </button>
      </div>
    </div>
  );
}

function NodeTypeSpecificConfig({
  data,
  onConfigChange,
  onConfigJsonChange,
}: {
  data: WorkflowNodeData;
  onConfigChange: (key: string, value: any) => void;
  onConfigJsonChange: (value: string) => void;
}) {
  const config = data.config ?? {};

  switch (data.nodeType) {
    case "trigger":
      return (
        <div className="mt-4 space-y-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Channel</span>
            <select
              value={config.channel ?? "voice"}
              onChange={(event) => onConfigChange("channel", event.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="voice">Voice</option>
              <option value="sms">SMS</option>
              <option value="webhook">Webhook</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Event</span>
            <input
              value={config.event ?? "inbound_call"}
              onChange={(event) => onConfigChange("event", event.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
        </div>
      );
    case "condition":
      return (
        <div className="mt-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Expression</span>
            <input
              value={config.condition ?? ""}
              onChange={(event) => onConfigChange("condition", event.target.value)}
              placeholder="{{context.value}} > 0"
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
        </div>
      );
    case "http":
      return (
        <div className="mt-4 space-y-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">URL</span>
            <input
              value={config.url ?? ""}
              onChange={(event) => onConfigChange("url", event.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Method</span>
            <select
              value={(config.method ?? "POST").toUpperCase()}
              onChange={(event) => onConfigChange("method", event.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Headers (JSON)</span>
            <textarea
              value={JSON.stringify(config.headers ?? {}, null, 2)}
              onChange={(event) => {
                try {
                  const parsed = event.target.value.trim() ? JSON.parse(event.target.value) : {};
                  onConfigChange("headers", parsed);
                } catch (error) {
                  window.alert("Headers must be valid JSON");
                }
              }}
              rows={4}
              className="rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Body (JSON)</span>
            <textarea
              value={JSON.stringify(config.body ?? {}, null, 2)}
              onChange={(event) => {
                try {
                  const parsed = event.target.value.trim() ? JSON.parse(event.target.value) : {};
                  onConfigChange("body", parsed);
                } catch (error) {
                  window.alert("Body must be valid JSON");
                }
              }}
              rows={6}
              className="rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs"
            />
          </label>
        </div>
      );
    case "email":
      return (
        <div className="mt-4 space-y-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">To</span>
            <input
              value={config.to ?? ""}
              onChange={(event) => onConfigChange("to", event.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Subject</span>
            <input
              value={config.subject ?? ""}
              onChange={(event) => onConfigChange("subject", event.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Body</span>
            <textarea
              value={config.body ?? ""}
              onChange={(event) => onConfigChange("body", event.target.value)}
              rows={5}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
      );
    case "slack":
      return (
        <div className="mt-4 space-y-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Channel</span>
            <input
              value={config.channel ?? ""}
              onChange={(event) => onConfigChange("channel", event.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Message</span>
            <textarea
              value={config.message ?? ""}
              onChange={(event) => onConfigChange("message", event.target.value)}
              rows={4}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
      );
    case "delay":
      return (
        <div className="mt-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Delay (ms)</span>
            <input
              type="number"
              min={0}
              value={config.duration ?? 1000}
              onChange={(event) => onConfigChange("duration", Number(event.target.value) || 0)}
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
        </div>
      );
    case "loop":
      return (
        <div className="mt-4 space-y-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Variable name</span>
            <input
              value={config.variable ?? "item"}
              onChange={(event) => onConfigChange("variable", event.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Items (JSON)</span>
            <textarea
              value={JSON.stringify(config.items ?? [], null, 2)}
              onChange={(event) => {
                try {
                  const parsed = event.target.value.trim() ? JSON.parse(event.target.value) : [];
                  onConfigChange("items", parsed);
                } catch (error) {
                  window.alert("Items must be valid JSON");
                }
              }}
              rows={4}
              className="rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs"
            />
          </label>
        </div>
      );
    case "transform":
      return (
        <div className="mt-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Mapping (JSON)</span>
            <textarea
              value={JSON.stringify(config.mapping ?? {}, null, 2)}
              onChange={(event) => {
                try {
                  const parsed = event.target.value.trim() ? JSON.parse(event.target.value) : {};
                  onConfigChange("mapping", parsed);
                } catch (error) {
                  window.alert("Mapping must be valid JSON");
                }
              }}
              rows={6}
              className="rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs"
            />
          </label>
        </div>
      );
    default:
      return (
        <div className="mt-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Config (JSON)</span>
            <textarea
              defaultValue={JSON.stringify(config ?? {}, null, 2)}
              onBlur={(event) => onConfigJsonChange(event.target.value)}
              rows={8}
              className="rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs"
            />
          </label>
        </div>
      );
  }
}

function EdgeInspector({
  edge,
  onUpdate,
  onDelete,
}: {
  edge: WorkflowEdge;
  onUpdate: (updater: (data: { condition?: string }) => { condition?: string }) => void;
  onDelete: () => void;
}) {
  const data = edge.data ?? {};
  return (
    <div className="flex h-full flex-col">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Edge condition</p>
        <p className="mt-1 text-sm text-gray-600">
          Optional expression to decide whether this path should run. Leave blank to always follow this edge.
        </p>
        <label className="mt-4 flex flex-col gap-1 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Condition</span>
          <input
            value={data.condition ?? ""}
            onChange={(event) => onUpdate(() => ({ condition: event.target.value }))}
            placeholder="{{context.status}} == 'needs_followup'"
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={onDelete}
          className="rounded-full border border-red-400 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
        >
          Delete connection
        </button>
      </div>
    </div>
  );
}

