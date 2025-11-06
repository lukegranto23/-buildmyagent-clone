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
  const { model, action, where, data, include } = node.config || {};
  if (!model || !action) {
    throw new Error("Database node requires 'model' and 'action'");
  }

  const { prisma } = await import("@/lib/prisma");
  const prismaModel = (prisma as Record<string, unknown>)[model as string] as {
    findMany: (args: unknown) => Promise<unknown[]>;
    findUnique: (args: unknown) => Promise<unknown>;
    create: (args: unknown) => Promise<unknown>;
    update: (args: unknown) => Promise<unknown>;
    delete: (args: unknown) => Promise<unknown>;
  };

  if (!prismaModel) {
    throw new Error(`Model ${model} not found`);
  }

  try {
    switch (action) {
      case "findMany": {
        const resolvedWhere = where ? JSON.parse(resolveTemplate(JSON.stringify(where), context.variables)) : undefined;
        const resolvedInclude = include ? JSON.parse(resolveTemplate(JSON.stringify(include), context.variables)) : undefined;
        const result = await prismaModel.findMany({ where: resolvedWhere, include: resolvedInclude });
        return { rows: result };
      }
      case "findUnique": {
        const resolvedWhere = where ? JSON.parse(resolveTemplate(JSON.stringify(where), context.variables)) : undefined;
        if (!resolvedWhere) throw new Error("findUnique requires 'where'");
        const result = await prismaModel.findUnique({ where: resolvedWhere });
        return { row: result };
      }
      case "create": {
        const resolvedData = data ? JSON.parse(resolveTemplate(JSON.stringify(data), context.variables)) : undefined;
        if (!resolvedData) throw new Error("create requires 'data'");
        const result = await prismaModel.create({ data: resolvedData });
        return { row: result };
      }
      case "update": {
        const resolvedWhere = where ? JSON.parse(resolveTemplate(JSON.stringify(where), context.variables)) : undefined;
        const resolvedData = data ? JSON.parse(resolveTemplate(JSON.stringify(data), context.variables)) : undefined;
        if (!resolvedWhere || !resolvedData) throw new Error("update requires 'where' and 'data'");
        const result = await prismaModel.update({ where: resolvedWhere, data: resolvedData });
        return { row: result };
      }
      case "delete": {
        const resolvedWhere = where ? JSON.parse(resolveTemplate(JSON.stringify(where), context.variables)) : undefined;
        if (!resolvedWhere) throw new Error("delete requires 'where'");
        const result = await prismaModel.delete({ where: resolvedWhere });
        return { row: result };
      }
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    await logExecution(
      context.executionId,
      "error",
      `Database operation failed: ${error instanceof Error ? error.message : String(error)}`,
      node.id
    );
    throw error;
  }
}

async function executeEmail(node: WorkflowNode, context: ExecutionContext): Promise<unknown> {
  const { to, subject, body, from } = node.config || {};
  if (!to || !subject) {
    throw new Error("Email node requires 'to' and 'subject'");
  }

  const resolvedTo = resolveTemplate(to as string, context.variables);
  const resolvedSubject = resolveTemplate(subject as string, context.variables);
  const resolvedBody = body ? resolveTemplate(body as string, context.variables) : "";

  try {
    const { sendEmail } = await import("@/lib/email");
    const result = await sendEmail({
      to: resolvedTo,
      subject: resolvedSubject,
      html: resolvedBody,
      from: from ? resolveTemplate(from as string, context.variables) : undefined,
    });

    await logExecution(context.executionId, "info", `Email sent to ${resolvedTo}`, node.id, result);
    return { success: true, to: resolvedTo, subject: resolvedSubject, messageId: result.messageId };
  } catch (error) {
    await logExecution(
      context.executionId,
      "error",
      `Email send failed: ${error instanceof Error ? error.message : String(error)}`,
      node.id
    );
    throw error;
  }
}

async function executeSlack(node: WorkflowNode, context: ExecutionContext): Promise<unknown> {
  const { webhookUrl, token, channel, message, blocks } = node.config || {};
  if (!message && !blocks) {
    throw new Error("Slack node requires 'message' or 'blocks'");
  }

  const resolvedMessage = message ? resolveTemplate(message as string, context.variables) : undefined;
  const resolvedChannel = channel ? resolveTemplate(channel as string, context.variables) : undefined;

  try {
    const { sendSlackMessage, sendSlackMessageWithToken } = await import("@/lib/slack");

    let result;
    if (webhookUrl) {
      const resolvedWebhook = resolveTemplate(webhookUrl as string, context.variables);
      result = await sendSlackMessage({
        webhookUrl: resolvedWebhook,
        channel: resolvedChannel,
        text: resolvedMessage,
        blocks: blocks as unknown[],
      });
    } else if (token && resolvedChannel) {
      const resolvedToken = resolveTemplate(token as string, context.variables);
      result = await sendSlackMessageWithToken({
        token: resolvedToken,
        channel: resolvedChannel,
        text: resolvedMessage,
        blocks: blocks as unknown[],
      });
    } else {
      throw new Error("Slack node requires either 'webhookUrl' or 'token' + 'channel'");
    }

    await logExecution(
      context.executionId,
      "info",
      `Slack message sent to ${resolvedChannel || "channel"}`,
      node.id,
      result
    );
    return { success: true, channel: resolvedChannel, message: resolvedMessage, ts: result.ts };
  } catch (error) {
    await logExecution(
      context.executionId,
      "error",
      `Slack send failed: ${error instanceof Error ? error.message : String(error)}`,
      node.id
    );
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

