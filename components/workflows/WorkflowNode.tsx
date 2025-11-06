"use client";

import { memo, type ReactNode } from "react";
import { Handle, Position } from "reactflow";
import { clsx } from "clsx";
import {
  Bot,
  Bolt,
  PhoneIncoming,
  MessageCircle,
  Database,
  Webhook,
  Workflow,
} from "lucide-react";

type WorkflowNodeData = {
  title: string;
  subtitle?: string;
  description?: string;
  status?: string;
  variant?: "trigger" | "ai" | "action" | "integration" | "utility";
  inputs?: number;
  outputs?: number;
  moduleId?: string;
  config?: Record<string, string>;
  checklist?: string[];
  metrics?: Array<{ label: string; value: string }>;
};

const variantIconMap: Record<Required<WorkflowNodeData["variant"]>, ReactNode> = {
  trigger: <PhoneIncoming className="h-4 w-4" strokeWidth={2.5} />,
  ai: <Bot className="h-4 w-4" strokeWidth={2.5} />,
  action: <Bolt className="h-4 w-4" strokeWidth={2.5} />,
  integration: <Webhook className="h-4 w-4" strokeWidth={2.5} />,
  utility: <Workflow className="h-4 w-4" strokeWidth={2.5} />,
};

const statusPillMap: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  configured: "bg-emerald-100 text-emerald-700",
  running: "bg-indigo-100 text-indigo-700",
  error: "bg-rose-100 text-rose-700",
};

const variantThemeMap: Record<Required<WorkflowNodeData["variant"]>, {
  border: string;
  header: string;
  glow: string;
}> = {
  trigger: {
    border: "border-amber-200",
    header: "bg-amber-50 text-amber-700",
    glow: "shadow-[0_0_0_1px_rgba(251,191,36,0.35)]",
  },
  ai: {
    border: "border-sky-200",
    header: "bg-sky-50 text-sky-700",
    glow: "shadow-[0_0_0_1px_rgba(56,189,248,0.35)]",
  },
  action: {
    border: "border-emerald-200",
    header: "bg-emerald-50 text-emerald-700",
    glow: "shadow-[0_0_0_1px_rgba(16,185,129,0.35)]",
  },
  integration: {
    border: "border-indigo-200",
    header: "bg-indigo-50 text-indigo-700",
    glow: "shadow-[0_0_0_1px_rgba(129,140,248,0.35)]",
  },
  utility: {
    border: "border-slate-200",
    header: "bg-slate-100 text-slate-700",
    glow: "shadow-[0_0_0_1px_rgba(148,163,184,0.35)]",
  },
};

function getStatusPillClass(status?: string) {
  if (!status) return "bg-slate-100 text-slate-600";
  const key = status.toLowerCase();
  return statusPillMap[key] ?? "bg-slate-100 text-slate-600";
}

export type WorkflowNodeProps = {
  id: string;
  data: WorkflowNodeData;
};

function WorkflowNodeComponent({ data }: WorkflowNodeProps) {
  const variant = data.variant ?? "utility";
  const theme = variantThemeMap[variant];
  const inputs = data.inputs ?? 1;
  const outputs = data.outputs ?? 1;

  return (
    <div
      className={clsx(
        "group rounded-2xl border bg-white shadow-sm transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-xl",
        theme.border,
        theme.glow
      )}
    >
      <div
        className={clsx(
          "flex items-center justify-between rounded-t-2xl px-4 py-2 text-xs font-semibold uppercase tracking-wide",
          theme.header
        )}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-slate-800 shadow-sm">
            {variantIconMap[variant]}
          </span>
          <span>{data.title}</span>
        </div>
        {data.status && (
          <span className={clsx("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", getStatusPillClass(data.status))}>
            {data.status}
          </span>
        )}
      </div>

      <div className="space-y-2 px-4 py-3 text-xs text-slate-600">
        {data.subtitle && <p className="text-sm font-semibold text-slate-900">{data.subtitle}</p>}
        {data.description && <p>{data.description}</p>}
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <Database className="h-3.5 w-3.5" />
            <span>{inputs} input{inputs === 1 ? "" : "s"}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>{outputs} output{outputs === 1 ? "" : "s"}</span>
          </div>
        </div>
        {data.metrics?.length ? (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
            {data.metrics.map((metric) => (
              <span key={`${metric.label}-${metric.value}`} className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                {metric.label}: {metric.value}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {inputs > 0 && <Handle type="target" position={Position.Left} className="!bg-slate-400" />}
      {outputs > 0 && <Handle type="source" position={Position.Right} className="!bg-slate-400" />}
    </div>
  );
}

export const WorkflowNode = memo(WorkflowNodeComponent);

