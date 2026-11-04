import { ChevronDown, Share, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import { cn } from "../lib/cn";
import { useTheme } from "../lib/useTheme";
import { Composer } from "./Composer";
import { STARTER_PROMPTS, useConversation } from "./engine/useConversation";
import { MessageList } from "./Messages";
import { Sidebar } from "./Sidebar";
import { EventFullscreen } from "./widgets/EventWidgets";
import { SuggestionChips } from "./widgets/SuggestionChips";

export function ChatGPTPage() {
  const chat = useConversation();
  const { theme, toggle } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [params, setParams] = useSearchParams();
  const prefill = params.get("prompt") ?? undefined;

  useEffect(() => {
    document.title = "ChatGPT";
  }, []);

  // Landing page deep link: /chatgpt?prompt=... autoplays the prompt.
  useEffect(() => {
    if (!prefill) return;
    const t = setTimeout(() => {
      chat.send(prefill);
      setParams({}, { replace: true });
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill]);

  const empty = chat.messages.length === 0;
  const lastAssistantText = [...chat.messages].reverse().find((m) => m.role === "assistant" && m.text)?.text;

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-surface text-[color:var(--color-text)]">
      <div className="hidden md:flex">
        <Sidebar
          conversations={chat.conversations}
          activeId={chat.activeId}
          collapsed={collapsed}
          theme={theme}
          onToggleTheme={toggle}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          onNewChat={chat.newChat}
          onSelect={chat.switchChat}
        />
      </div>

      <main className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between px-3">
          <button type="button" className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-lg font-medium text-secondary hover:bg-surface-secondary">
            ChatGPT <span className="text-tertiary">5.2</span>
            <ChevronDown className="size-4 text-tertiary" />
          </button>
          <div className="flex items-center gap-1">
            <button type="button" className="hidden h-9 items-center gap-1.5 rounded-full border border-default px-3 text-sm hover:bg-surface-secondary sm:inline-flex">
              <Share className="size-4" /> Share
            </button>
            <button type="button" aria-label="Customize" className="inline-flex size-9 items-center justify-center rounded-full hover:bg-surface-secondary">
              <SlidersHorizontal className="size-4" />
            </button>
            <span className="ml-1 inline-flex size-8 items-center justify-center rounded-full bg-[#7c3aed] text-xs font-semibold text-white">A</span>
          </div>
        </header>

        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4 pb-24">
            <h1 className="mb-7 text-center text-[28px] font-medium tracking-tight">What's on your mind today?</h1>
            <div className="w-full max-w-3xl">
              <Composer onSend={chat.send} disabled={chat.busy} connected={chat.connected} autoFocus size="lg" initialValue={prefill} />
            </div>
            <div className="mt-5 w-full max-w-3xl">
              <SuggestionChips large chips={STARTER_PROMPTS.map((p) => p.text)} onPick={chat.send} />
            </div>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <MessageList messages={chat.messages} busy={chat.busy} onAct={chat.act} />
            </div>
            <div className={cn("shrink-0 px-4 pb-3")}>
              <div className="mx-auto max-w-3xl">
                <Composer onSend={chat.send} disabled={chat.busy} connected={chat.connected} autoFocus />
                <p className="mt-2 text-center text-xs text-tertiary">ChatGPT can make mistakes. Check important info.</p>
              </div>
            </div>
          </>
        )}

        {chat.fullscreenEvent ? <EventFullscreen eventId={chat.fullscreenEvent} onAct={chat.act} onClose={chat.closeFullscreen} lastAssistantText={lastAssistantText} /> : null}
      </main>
    </div>
  );
}
