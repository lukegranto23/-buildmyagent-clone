import { prisma } from "@/lib/prisma";

export type WorkflowNode = {
  id: string;
  type: string; // trigger, action, condition, loop, etc.
  label: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  config?: Record<string, unknown>;
};

export type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  condition?: string; // For conditional edges
};

export type WorkflowData = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

export type ExecutionContext = {
  workflowId: string;
  executionId: string;
  input: Record<string, unknown>;
  variables: Record<string, unknown>;
  nodeResults: Map<string, unknown>;
};

async function logExecution(
  executionId: string,
  level: "info" | "warning" | "error",
  message: string,
  nodeId?: string,
  data?: unknown
) {
  await prisma.workflowExecutionLog.create({
    data: {
      executionId,
      nodeId,
      level,
      message,
      data: data ? JSON.stringify(data) : null,
    },
  });
}

async function executeNode(
  node: WorkflowNode,
  context: ExecutionContext
): Promise<unknown> {
  await logExecution(context.executionId, "info", `Executing node: ${node.label}`, node.id);

  switch (node.type) {
    case "trigger":
      return await executeTrigger(node, context);
    case "http":
      return await executeHttp(node, context);
    case "condition":
      return await executeCondition(node, context);
    case "transform":
      return await executeTransform(node, context);
    case "database":
      return await executeDatabase(node, context);
    case "email":
      return await executeEmail(node, context);
    case "slack":
      return await executeSlack(node, context);
    case "webhook":
      return await executeWebhook(node, context);
    case "delay":
      return await executeDelay(node, context);
    case "loop":
      return await executeLoop(node, context);
    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}

async function executeTrigger(node: WorkflowNode, context: ExecutionContext): Promise<unknown> {
  return context.input;
}

async function executeHttp(node: WorkflowNode, context: ExecutionContext): Promise<unknown> {
  const { url, method = "GET", headers = {}, body } = node.config || {};
  const resolvedUrl = resolveTemplate(url as string, context.variables);
  const resolvedHeaders = Object.fromEntries(
    Object.entries(headers as Record<string, string>).map(([k, v]) => [k, resolveTemplate(v, context.variables)])
  );

  const response = await fetch(resolvedUrl, {
    method: method as string,
    headers: resolvedHeaders,
    body: body ? JSON.stringify(resolveTemplate(body as string, context.variables)) : undefined,
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = { text: await response.text() };
  }
  return data;
}

async function executeCondition(node: WorkflowNode, context: ExecutionContext): Promise<boolean> {
  const { condition } = node.config || {};
  if (!condition) return true;

  try {
    const result = evaluateCondition(condition as string, context.variables);
    return result;
  } catch (error) {
    await logExecution(context.executionId, "error", `Condition evaluation failed: ${error}`, node.id);
    return false;
  }
}

async function executeTransform(node: WorkflowNode, context: ExecutionContext): Promise<unknown> {
  const { mapping } = node.config || {};
  if (!mapping) return context.variables;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(mapping as Record<string, string>)) {
    result[key] = resolveTemplate(value, context.variables);
  }
  return result;
}

async function executeDatabase(node: WorkflowNode, context: ExecutionContext): Promise<unknown> {
  const { query, type = "select" } = node.config || {};
  if (!query) return null;

  const resolvedQuery = resolveTemplate(query as string, context.variables);

  // For now, we'll use Prisma directly
  // In production, you'd want a more flexible query builder
  if (type === "select") {
    // This is a simplified example - you'd need proper SQL parsing
    return { rows: [] };
  }
  return null;
}

async function executeEmail(node: WorkflowNode, context: ExecutionContext): Promise<unknown> {
  const { to, subject, body, html } = node.config || {};
  
  if (!to || !subject || (!body && !html)) {
    await logExecution(context.executionId, "error", "Email node missing required fields (to, subject, body/html)", node.id);
    throw new Error("Email node missing required fields");
  }

  try {
    const { sendEmail } = await import("@/lib/integrations/email");
    const resolvedTo = resolveTemplate(to as string, context.variables);
    const resolvedSubject = resolveTemplate(subject as string, context.variables);
    const resolvedBody = body ? resolveTemplate(body as string, context.variables) : undefined;
    const resolvedHtml = html ? resolveTemplate(html as string, context.variables) : undefined;

    const result = await sendEmail(resolvedTo, resolvedSubject, resolvedHtml || resolvedBody || "", resolvedBody);
    
    if (result.success) {
      await logExecution(context.executionId, "info", `Email sent to ${resolvedTo}`, node.id);
      return { success: true, to: resolvedTo, subject: resolvedSubject, messageId: result.messageId };
    } else {
      await logExecution(context.executionId, "error", `Failed to send email: ${result.error}`, node.id);
      throw new Error(result.error || "Failed to send email");
    }
  } catch (error) {
    await logExecution(context.executionId, "error", `Email execution failed: ${error}`, node.id);
    throw error;
  }
}

async function executeSlack(node: WorkflowNode, context: ExecutionContext): Promise<unknown> {
  const { channel, message, userId, subAccountId } = node.config || {};
  
  if (!channel || !message) {
    await logExecution(context.executionId, "error", "Slack node missing required fields (channel, message)", node.id);
    throw new Error("Slack node missing required fields");
  }

  const resolvedChannel = resolveTemplate(channel as string, context.variables);
  const resolvedMessage = resolveTemplate(message as string, context.variables);
  const resolvedUserId = userId ? resolveTemplate(userId as string, context.variables) : context.workflowId;

  try {
    const { sendSlackMessage } = await import("@/lib/integrations/slack");
    const resolvedSubAccountId = subAccountId ? resolveTemplate(subAccountId as string, context.variables) : undefined;
    
    const result = await sendSlackMessage(resolvedUserId, resolvedChannel, resolvedMessage, resolvedSubAccountId);
    
    if (result.success) {
      await logExecution(context.executionId, "info", `Slack message sent to ${resolvedChannel}`, node.id);
      return { success: true, channel: resolvedChannel, message: resolvedMessage };
    } else {
      await logExecution(context.executionId, "error", `Failed to send Slack message: ${result.error}`, node.id);
      throw new Error(result.error || "Failed to send Slack message");
    }
  } catch (error) {
    await logExecution(context.executionId, "error", `Slack execution failed: ${error}`, node.id);
    throw error;
  }
}

async function executeWebhook(node: WorkflowNode, context: ExecutionContext): Promise<unknown> {
  const { url, method = "POST", headers = {}, body } = node.config || {};
  return await executeHttp(node, context);
}

async function executeDelay(node: WorkflowNode, context: ExecutionContext): Promise<unknown> {
  const { duration } = node.config || {};
  const ms = typeof duration === "number" ? duration : 1000;
  await new Promise((resolve) => setTimeout(resolve, ms));
  return { delayed: ms };
}

async function executeLoop(node: WorkflowNode, context: ExecutionContext): Promise<unknown> {
  const { items, variable } = node.config || {};
  const itemsArray = Array.isArray(items) ? items : [];
  const results: unknown[] = [];

  for (const item of itemsArray) {
    const loopContext = {
      ...context,
      variables: { ...context.variables, [variable as string]: item },
    };
    // In a full implementation, you'd execute child nodes here
    results.push(item);
  }

  return { results, count: results.length };
}

function resolveTemplate(template: string, variables: Record<string, unknown>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    const value = variables[key.trim()];
    return value !== undefined ? String(value) : "";
  });
}

function evaluateCondition(condition: string, variables: Record<string, unknown>): boolean {
  // Simple condition evaluator - in production, use a proper expression parser
  try {
    const resolved = resolveTemplate(condition, variables);
    // For now, just check if it's truthy
    return Boolean(resolved);
  } catch {
    return false;
  }
}

export async function executeWorkflow(
  workflowId: string,
  input: Record<string, unknown> = {}
): Promise<{ executionId: string; output: unknown }> {
  const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
  if (!workflow) {
    throw new Error(`Workflow ${workflowId} not found`);
  }

  const execution = await prisma.workflowExecution.create({
    data: {
      workflowId,
      status: "running",
      input: JSON.stringify(input),
    },
  });

  try {
    const nodes: WorkflowNode[] = JSON.parse(workflow.nodes || "[]");
    const edges: WorkflowEdge[] = JSON.parse(workflow.edges || "[]");

    const context: ExecutionContext = {
      workflowId,
      executionId: execution.id,
      input,
      variables: { ...input },
      nodeResults: new Map(),
    };

    // Find trigger node (entry point)
    const triggerNode = nodes.find((n) => n.type === "trigger");
    if (!triggerNode) {
      throw new Error("No trigger node found");
    }

    // Execute workflow nodes in order
    const executed = new Set<string>();
    const queue: WorkflowNode[] = [triggerNode];
    let output: unknown = input;

    while (queue.length > 0) {
      const node = queue.shift()!;
      if (executed.has(node.id)) continue;

      try {
        const result = await executeNode(node, context);
        context.nodeResults.set(node.id, result);
        context.variables = { ...context.variables, [`${node.id}_result`]: result };
        executed.add(node.id);

        // Find next nodes via edges
        const nextEdges = edges.filter((e) => e.source === node.id);
        for (const edge of nextEdges) {
          if (edge.condition) {
            const conditionMet = evaluateCondition(edge.condition, context.variables);
            if (!conditionMet) continue;
          }

          const nextNode = nodes.find((n) => n.id === edge.target);
          if (nextNode && !executed.has(nextNode.id)) {
            queue.push(nextNode);
          }
        }

        output = result;
      } catch (error) {
        await logExecution(
          context.executionId,
          "error",
          `Node execution failed: ${error instanceof Error ? error.message : String(error)}`,
          node.id
        );
        throw error;
      }
    }

    await prisma.workflowExecution.update({
      where: { id: execution.id },
      data: {
        status: "completed",
        output: JSON.stringify(output),
        completedAt: new Date(),
      },
    });

    return { executionId: execution.id, output };
  } catch (error) {
    await prisma.workflowExecution.update({
      where: { id: execution.id },
      data: {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        completedAt: new Date(),
      },
    });
    throw error;
  }
}

