"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

type AgentResponse = {
  id: string;
  name: string;
  offerName: string;
  description: string | null;
  systemPrompt: string;
  blueprint: {
    industry?: { label?: string; tagline?: string };
  };
  quickWins: string[];
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function AgentSandboxPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [agent, setAgent] = useState<AgentResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoadingAgent, setIsLoadingAgent] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgent = async () => {
      if (!params?.id) return;
      setIsLoadingAgent(true);
      try {
        const response = await fetch(`/api/agents/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to load agent details");
        }
        const data = await response.json();
        setAgent(data);
        setMessages([]);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Unable to load agent");
      } finally {
        setIsLoadingAgent(false);
      }
    };

    fetchAgent();
  }, [params?.id]);

  const subtitle = useMemo(() => {
    if (!agent) return "";
    const industryLabel = agent.blueprint?.industry?.label ?? "Main Street";
    const tagline = agent.blueprint?.industry?.tagline;
    return tagline ? `${industryLabel} · ${tagline}` : industryLabel;
  }, [agent]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || !params?.id) return;

    const newMessage: ChatMessage = { role: "user", content: input.trim() };
    const historyBeforeSend = messages.filter((message) => message.content.trim().length > 0);
    const nextMessages = [...historyBeforeSend, newMessage];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/agents/${params.id}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Simulation failed");
      }

      const payload = (await response.json()) as { reply: string };
      setMessages([...nextMessages, { role: "assistant", content: payload.reply }]);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong while simulating the agent.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Sandbox</p>
            <h1 className="text-2xl font-bold text-gray-900">
              {isLoadingAgent ? "Loading agent..." : agent?.offerName ?? "Agent"}
            </h1>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/agents">
              <Button variant="ghost">Back to library</Button>
            </Link>
            <Button variant="outline" onClick={() => router.refresh()}>
              Refresh agent
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <section className="flex h-[70vh] flex-col rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              <div className="max-w-xl rounded-2xl bg-blue-50 px-4 py-3 text-sm leading-relaxed text-blue-900 shadow-sm">
                Hi there! I'm ready to role-play this agent. Ask me a question a prospect or customer might ask.
              </div>
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}-${message.content.slice(0, 10)}`}
                  className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    message.role === "assistant"
                      ? "bg-blue-50 text-blue-900"
                      : "ml-auto bg-gray-900 text-white"
                  }`}
                >
                  <p>{message.content}</p>
                </div>
              ))}
              {isSending && (
                <div className="max-w-xs rounded-2xl bg-blue-100 px-4 py-3 text-sm text-blue-800">
                  Thinking...
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
              <div className="flex gap-3">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  rows={2}
                  placeholder={isLoadingAgent ? "Loading agent..." : "Type a prospect question and press send"}
                  disabled={isLoadingAgent || isSending}
                  className="flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button type="submit" disabled={isLoadingAgent || isSending || !input.trim()}>
                  Send
                </Button>
              </div>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Agent positioning</h2>
              <p className="mt-2 text-sm text-gray-600">
                {agent?.description ?? "Use the sandbox to rehearse real conversations before you launch."}
              </p>
              {agent?.quickWins?.length ? (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Quick wins to emphasize</p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-700">
                    {agent.quickWins.slice(0, 3).map((win) => (
                      <li key={win}>• {win}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">Tips for a realistic test</h3>
              <ul className="mt-2 space-y-2 text-xs text-gray-600">
                <li>Role-play as a skeptical or time-pressed boomer business owner.</li>
                <li>Ask about scheduling, pricing objections, or analog requests (postcards, phone call backs).</li>
                <li>See how the agent handles escalation. Adjust the blueprint if it feels off.</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}


