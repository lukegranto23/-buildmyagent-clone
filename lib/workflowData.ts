import { MarkerType } from "reactflow";

export type WorkflowModule = {
  id: string;
  category: "Triggers" | "AI" | "Integrations" | "Utilities";
  title: string;
  subtitle: string;
  description: string;
  variant: "trigger" | "ai" | "action" | "integration" | "utility";
  checklist?: string[];
  metrics?: Array<{ label: string; value: string }>;
  inputs: number;
  outputs: number;
  defaults: Record<string, string | number | boolean>;
  fields: Array<{
    id: string;
    label: string;
    type: "text" | "textarea" | "select" | "toggle" | "number";
    placeholder?: string;
    helper?: string;
    options?: Array<{ label: string; value: string }>;
    min?: number;
    max?: number;
    step?: number;
  }>;
};

export const workflowModules: WorkflowModule[] = [
  {
    id: "trigger-inbound-call",
    category: "Triggers",
    title: "Inbound Phone Call",
    subtitle: "Twilio Voice",
    description: "Starts when a customer calls your published DID.",
    variant: "trigger",
    inputs: 0,
    outputs: 1,
    checklist: [
      "Verify phone number is provisioned",
      "Call whisper configured",
      "Fallback routing set",
    ],
    defaults: {
      phoneNumber: "+1 555-320-1098",
      whisper: "You're speaking with the Heritage Concierge",
    },
    metrics: [
      { label: "Live", value: "Yes" },
      { label: "AHT", value: "2m 12s" },
    ],
    fields: [
      {
        id: "phoneNumber",
        label: "Forwarding number",
        type: "text",
        placeholder: "+1 (___) ___-____",
        helper: "Number customers dial to reach the agent.",
      },
      {
        id: "whisper",
        label: "Call whisper",
        type: "textarea",
        placeholder: "What the agent hears before connecting",
      },
    ],
  },
  {
    id: "ai-main-agent",
    category: "AI",
    title: "Main Street Concierge",
    subtitle: "OpenAI GPT-4o",
    description: "Handles scheduling, objections, and analog-friendly follow up.",
    variant: "ai",
    inputs: 1,
    outputs: 2,
    checklist: [
      "Prompt grounded in industry blueprint",
      "Owner escalation phrases configured",
      "CRM logging reviewed",
    ],
    defaults: {
      temperature: 0.6,
      escalationNumber: "+1 555-989-4455",
      persona: "Neighborly and confident",
    },
    metrics: [
      { label: "Confidence", value: "High" },
      { label: "Fallbacks", value: "3%" },
    ],
    fields: [
      {
        id: "persona",
        label: "Voice profile",
        type: "select",
        options: [
          { label: "Warm & Neighborly", value: "warm" },
          { label: "Confident Dispatcher", value: "confident" },
          { label: "High-Energy Promoter", value: "energetic" },
        ],
        helper: "Choose how the agent sounds on calls.",
      },
      {
        id: "temperature",
        label: "Creativity",
        type: "number",
        min: 0,
        max: 1,
        step: 0.1,
        helper: "Lower stays on-script, higher improvises more.",
      },
      {
        id: "escalationNumber",
        label: "Escalation number",
        type: "text",
        placeholder: "+1 555-____",
        helper: "Direct line when the agent needs a human to step in.",
      },
    ],
  },
  {
    id: "integration-calendar",
    category: "Integrations",
    title: "Calendar Bridge",
    subtitle: "Google Calendar",
    description: "Finds availability and books confirmed appointments.",
    variant: "integration",
    inputs: 1,
    outputs: 1,
    defaults: {
      calendarId: "heritage-dental/front-desk",
      bufferMinutes: 10,
      notifyOwner: true,
    },
    metrics: [{ label: "Synced", value: "Every 5m" }],
    fields: [
      {
        id: "calendarId",
        label: "Calendar ID",
        type: "text",
        placeholder: "Practice calendar resource",
      },
      {
        id: "bufferMinutes",
        label: "Buffer between appointments (min)",
        type: "number",
        min: 0,
        max: 60,
        step: 5,
      },
      {
        id: "notifyOwner",
        label: "Send owner summary",
        type: "toggle",
        helper: "Text the owner after each booking",
      },
    ],
  },
  {
    id: "action-recap",
    category: "Utilities",
    title: "Analog Recap",
    subtitle: "Printed follow-up",
    description: "Queues a mailed recap or handwritten note.",
    variant: "utility",
    inputs: 1,
    outputs: 0,
    defaults: {
      template: "Recall retention appointment",
      fulfillmentWindow: "Next day",
    },
    fields: [
      {
        id: "template",
        label: "Template",
        type: "select",
        options: [
          { label: "Dental recall letter", value: "recall" },
          { label: "HVAC tune-up postcard", value: "hvac" },
          { label: "Financial review packet", value: "financial" },
        ],
      },
      {
        id: "fulfillmentWindow",
        label: "Fulfillment window",
        type: "text",
        placeholder: "ex: Next-day USPS drop",
      },
    ],
  },
  {
    id: "integration-crm",
    category: "Integrations",
    title: "CRM Sync",
    subtitle: "HubSpot / Redtail",
    description: "Logs every outcome to the CRM with owner-ready notes.",
    variant: "integration",
    inputs: 1,
    outputs: 1,
    defaults: {
      targetPipeline: "Heritage Pipeline",
      syncNotes: true,
    },
    fields: [
      {
        id: "targetPipeline",
        label: "Target pipeline",
        type: "text",
        placeholder: "ex: Heritage - Inbound",
      },
      {
        id: "syncNotes",
        label: "Attach AI notes",
        type: "toggle",
        helper: "Adds recap to CRM timeline",
      },
    ],
  },
  {
    id: "action-sms-followup",
    category: "Utilities",
    title: "SMS Nurture",
    subtitle: "Twilio SMS",
    description: "Schedules friendly SMS reminders after each interaction.",
    variant: "action",
    inputs: 1,
    outputs: 1,
    defaults: {
      cadence: "24h", // hours
      script: "Hi {{first_name}}, just checking in about {{appointment}}",
    },
    fields: [
      {
        id: "cadence",
        label: "Follow-up delay",
        type: "select",
        options: [
          { label: "After 15 minutes", value: "0.25h" },
          { label: "After 2 hours", value: "2h" },
          { label: "Next day", value: "24h" },
        ],
      },
      {
        id: "script",
        label: "SMS script",
        type: "textarea",
        placeholder: "Hi {{first_name}}, just checking in...",
      },
    ],
  },
];

export type WorkflowTemplateNode = {
  id: string;
  moduleId: string;
  x: number;
  y: number;
  status?: string;
  config?: Record<string, string>;
};

export type WorkflowTemplateEdge = {
  id: string;
  source: string;
  target: string;
  label: string;
  color: string;
};

export type WorkflowTemplate = {
  id: string;
  name: string;
  category: string;
  headline: string;
  difficulty: "Starter" | "Advanced" | "Intermediate";
  summary: string;
  heroStat: string;
  tags: string[];
  timeline: string[];
  metrics: Array<{ label: string; value: string }>;
  nodes: WorkflowTemplateNode[];
  edges: WorkflowTemplateEdge[];
};

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "dental-recall",
    name: "Dental Hygiene Recall",
    category: "Dental",
    headline: "Rescue cancellations and rebook hygiene chairs in under five minutes",
    difficulty: "Starter",
    summary: "Answers inbound calls, collects recall details, books calendar slots, and mails analog recap packets for skeptical patients.",
    heroStat: "30% more hygiene seats filled",
    tags: ["Dental", "Inbound", "Appointments"],
    timeline: [
      "Answer call with neighborhood warmth",
      "Check calendar availability and confirm booking",
      "Queue printed recap and review request",
    ],
    metrics: [
      { label: "Avg Handle", value: "2m 20s" },
      { label: "Bookings", value: "+18%/wk" },
    ],
    nodes: [
      { id: "trigger", moduleId: "trigger-inbound-call", x: 40, y: 160, status: "configured" },
      { id: "ai", moduleId: "ai-main-agent", x: 340, y: 120, status: "running" },
      {
        id: "calendar",
        moduleId: "integration-calendar",
        x: 640,
        y: 80,
        status: "configured",
        config: { bufferMinutes: "5", notifyOwner: "true" },
      },
      {
        id: "recap",
        moduleId: "action-recap",
        x: 640,
        y: 220,
        status: "draft",
        config: { template: "recall", fulfillmentWindow: "Same day" },
      },
    ],
    edges: [
      { id: "e1", source: "trigger", target: "ai", label: "Live call", color: "#0ea5e9" },
      { id: "e2", source: "ai", target: "calendar", label: "Confirmed visit", color: "#10b981" },
      { id: "e3", source: "ai", target: "recap", label: "Mailer request", color: "#6366f1" },
    ],
  },
  {
    id: "home-services-estimate",
    name: "Home Services Estimate Saver",
    category: "Home Services",
    headline: "Speed-to-lead follow up that revives unsold estimates",
    difficulty: "Intermediate",
    summary: "Calls web form leads inside 60 seconds, logs notes back to the CRM, and kicks off SMS nudges when owners are busy in the field.",
    heroStat: "40% more estimates closed",
    tags: ["HVAC", "Follow-up", "CRM"],
    timeline: [
      "Trigger from web form submission",
      "Warm the lead with social proof and financing options",
      "Log summary to CRM and schedule SMS reminders",
    ],
    metrics: [
      { label: "Speed-to-lead", value: "45s" },
      { label: "Close Rate", value: "+22%" },
    ],
    nodes: [
      { id: "trigger", moduleId: "trigger-inbound-call", x: 40, y: 140, status: "draft", config: { whisper: "Warm the new lead" } },
      { id: "ai", moduleId: "ai-main-agent", x: 320, y: 120, status: "configured", config: { persona: "confident" } },
      {
        id: "crm",
        moduleId: "integration-crm",
        x: 620,
        y: 80,
        status: "configured",
        config: { targetPipeline: "ComfortGuard - Inbound" },
      },
      {
        id: "sms",
        moduleId: "action-sms-followup",
        x: 620,
        y: 220,
        status: "draft",
        config: { cadence: "2h" },
      },
    ],
    edges: [
      { id: "e1", source: "trigger", target: "ai", label: "Lead intake", color: "#fb923c" },
      { id: "e2", source: "ai", target: "crm", label: "Owner summary", color: "#6366f1" },
      { id: "e3", source: "ai", target: "sms", label: "Scheduling nudges", color: "#0ea5e9" },
    ],
  },
  {
    id: "senior-care-concierge",
    name: "Senior Care Family Concierge",
    category: "Senior Care",
    headline: "Weekly family touchpoints from inquiry to move-in",
    difficulty: "Advanced",
    summary: "Guides families through tours, logs every promise, and ensures analog packets are mailed to build trust.",
    heroStat: "95% family satisfaction",
    tags: ["Senior Care", "Tours", "Analog"],
    timeline: [
      "Capture inbound or referral phone inquiries",
      "Route qualified families into weekly follow-up cadence",
      "Mail packets and sync updates to the community CRM",
    ],
    metrics: [
      { label: "Tours Booked", value: "+12%" },
      { label: "Follow-up", value: "100%" },
    ],
    nodes: [
      { id: "trigger", moduleId: "trigger-inbound-call", x: 30, y: 160, status: "configured" },
      { id: "ai", moduleId: "ai-main-agent", x: 320, y: 120, status: "configured", config: { persona: "warm" } },
      {
        id: "calendar",
        moduleId: "integration-calendar",
        x: 610,
        y: 80,
        status: "configured",
        config: { bufferMinutes: "15", notifyOwner: "true" },
      },
      {
        id: "crm",
        moduleId: "integration-crm",
        x: 610,
        y: 200,
        status: "configured",
      },
      {
        id: "recap",
        moduleId: "action-recap",
        x: 610,
        y: 320,
        status: "draft",
        config: { template: "financial", fulfillmentWindow: "Next day" },
      },
    ],
    edges: [
      { id: "e1", source: "trigger", target: "ai", label: "Inquiry call", color: "#0ea5e9" },
      { id: "e2", source: "ai", target: "calendar", label: "Schedule tour", color: "#10b981" },
      { id: "e3", source: "ai", target: "crm", label: "Log notes", color: "#6366f1" },
      { id: "e4", source: "ai", target: "recap", label: "Mail packet", color: "#f97316" },
    ],
  },
];

export type WorkflowTemplateSummary = Pick<WorkflowTemplate, "id" | "name" | "headline" | "category" | "difficulty" | "heroStat" | "tags" | "summary" | "metrics" | "timeline">;

export function getWorkflowTemplate(templateId: string) {
  return workflowTemplates.find((template) => template.id === templateId);
}

export function createNodeId(templateId: string, nodeId: string) {
  return `${templateId}-${nodeId}`;
}

export function buildNodesFromTemplate(template: WorkflowTemplate, moduleMap: Map<string, WorkflowModule>) {
  return template.nodes.map((node) => {
    const module = moduleMap.get(node.moduleId);
    const defaults = module?.fields.reduce((acc, field) => {
      const value = module?.defaults[field.id];
      acc[field.id] = value === undefined ? "" : String(value);
      return acc;
    }, {} as Record<string, string>) ?? {};

    return {
      id: createNodeId(template.id, node.id),
      type: "workflowNode" as const,
      position: { x: node.x, y: node.y },
      data: {
        moduleId: node.moduleId,
        title: module?.title ?? "Module",
        subtitle: module?.subtitle,
        description: module?.description,
        variant: module?.variant ?? "utility",
        status: node.status ?? "draft",
        inputs: module?.inputs ?? 1,
        outputs: module?.outputs ?? 1,
        checklist: module?.checklist,
        metrics: module?.metrics,
        config: {
          ...defaults,
          ...(node.config ?? {}),
        },
      },
    };
  });
}

export function buildEdgesFromTemplate(template: WorkflowTemplate, moduleMap: Map<string, WorkflowModule>) {
  void moduleMap; // moduleMap reserved for future enrichment

  return template.edges.map((edge) => ({
    id: `${template.id}-${edge.id}`,
    source: createNodeId(template.id, edge.source),
    target: createNodeId(template.id, edge.target),
    type: "smoothstep" as const,
    label: edge.label,
    markerEnd: { type: MarkerType.ArrowClosed, color: edge.color },
    style: { stroke: edge.color, strokeWidth: 2 },
    animated: true,
  }));
}

