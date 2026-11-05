import {
  ChevronDown,
  Share,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import { cn } from "../lib/cn";
import { Tour } from "../lib/Tour";
import { useTheme } from "../lib/useTheme";
import { Composer } from "./Composer";
import { DomainHandoff } from "./DomainHandoff";
import { STARTER_PROMPTS, useConversation } from "./engine/useConversation";
import { MessageList } from "./Messages";
import { Sidebar } from "./Sidebar";
import { SitePane } from "./SitePane";
import { EventFullscreen } from "./widgets/EventWidgets";
import { MenuFullscreen } from "./widgets/RestaurantWidgets";
import { SuggestionChips } from "./widgets/SuggestionChips";

export function ChatGPTPage() {
  const chat = useConversation();
  const { theme, toggle } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [params, setParams] = useSearchParams();
  const prefill = params.get("prompt") ?? undefined;
  // Shown on every visit; the deep-link variant points at the examples toggle instead of the chips.
  const [tour, setTour] = useState(true);
  const [tourMode] = useState<"empty" | "deeplink">(() =>
    params.get("prompt") ? "deeplink" : "empty",
  );

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
  const lastAssistantText = [...chat.messages]
    .reverse()
    .find((m) => m.role === "assistant" && m.text)?.text;

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

      <main className="relative flex min-w-0 flex-1">
        <div
          className={cn(
            "relative flex min-w-0 flex-1 flex-col",
            chat.sitePane.open && chat.sitePane.full && "hidden",
          )}
        >
          <header className="flex h-14 shrink-0 items-center justify-between px-3">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-lg font-medium text-secondary hover:bg-surface-secondary"
            >
              ChatGPT <span className="text-tertiary">5.2</span>
              <ChevronDown className="size-4 text-tertiary" />
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="hidden h-9 items-center gap-1.5 rounded-full border border-default px-3 text-sm hover:bg-surface-secondary sm:inline-flex"
              >
                <Share className="size-4" /> Share
              </button>
              <button
                type="button"
                aria-label="Customize"
                className="inline-flex size-9 items-center justify-center rounded-full hover:bg-surface-secondary"
              >
                <SlidersHorizontal className="size-4" />
              </button>
              <span className="ml-1 inline-flex size-8 items-center justify-center rounded-full bg-[#7c3aed] text-xs font-semibold text-white">
                A
              </span>
            </div>
          </header>

          {empty ? (
            <div className="flex flex-1 flex-col items-center justify-center px-4 pb-24">
              <h1 className="mb-7 text-center text-[28px] font-medium tracking-tight">
                What's on your mind today?
              </h1>
              <div className="w-full max-w-3xl">
                <Composer
                  onSend={chat.send}
                  disabled={chat.busy}
                  connected={chat.connected}
                  autoFocus
                  size="lg"
                  initialValue={prefill}
                />
              </div>
              <div className="mt-5 w-full max-w-3xl" data-tour="prompts">
                <p className="mb-3 text-center text-xs text-tertiary">
                  Try an example, or type your own. Wix is connected as an app,
                  so ChatGPT can build a site, book, reserve and buy tickets for
                  you.
                </p>
                <SuggestionChips
                  large
                  chips={STARTER_PROMPTS.map((p) => p.text)}
                  onPick={chat.send}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <MessageList
                  messages={chat.messages}
                  busy={chat.busy}
                  onAct={chat.act}
                  domain={chat.domain}
                />
              </div>
              <div className={cn("shrink-0 px-4 pb-3")}>
                <div className="mx-auto max-w-3xl">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowExamples((v) => !v)}
                      aria-expanded={showExamples}
                      data-tour="examples-toggle"
                      className="inline-flex items-center gap-1.5 rounded-full border border-default px-3 py-1.5 text-xs font-medium text-secondary transition hover:bg-surface-secondary hover:text-[color:var(--color-text)]"
                    >
                      {showExamples ? (
                        <X className="size-3.5" />
                      ) : (
                        <Sparkles className="size-3.5" />
                      )}
                      {showExamples
                        ? "Hide example prompts"
                        : "Show example prompts"}
                    </button>
                    {showExamples ? (
                      <SuggestionChips
                        chips={STARTER_PROMPTS.map((p) => p.text)}
                        onPick={(t) => {
                          setShowExamples(false);
                          chat.send(t);
                        }}
                      />
                    ) : null}
                  </div>
                  <Composer
                    onSend={chat.send}
                    disabled={chat.busy}
                    connected={chat.connected}
                    autoFocus
                  />
                  <p className="mt-2 text-center text-xs text-tertiary">
                    ChatGPT can make mistakes. Check important info.
                  </p>
                </div>
              </div>
            </>
          )}

          {chat.fullscreenEvent ? (
            <EventFullscreen
              eventId={chat.fullscreenEvent}
              onAct={chat.act}
              onClose={chat.closeFullscreen}
              lastAssistantText={lastAssistantText}
            />
          ) : null}
          {chat.fullscreenMenu ? (
            <MenuFullscreen
              restaurantId={chat.fullscreenMenu}
              onClose={chat.closeFullscreen}
              lastAssistantText={lastAssistantText}
            />
          ) : null}
          {tour ? (
            <Tour
              onFinish={() => setTour(false)}
              steps={
                tourMode === "empty"
                  ? [
                      {
                        target: '[data-tour="prompts"]',
                        title: "Start with an example prompt",
                        body: "Each one plays a full flow: a website build that ends with a custom-domain offer, a haircut booking, concert tickets through checkout, or a dinner reservation. Wix is connected as an app, so ChatGPT works through it. You can also type your own and mention @Wix.",
                        cta: "Got it",
                        placement: "top",
                      },
                    ]
                  : [
                      {
                        target: '[data-tour="examples-toggle"]',
                        title: "More to try after this one",
                        body: "This prompt came from the landing page and is playing out now. When it's done, open the example prompts here for tickets, reservations and more.",
                        cta: "Got it",
                        placement: "top",
                      },
                    ]
              }
            />
          ) : null}
        </div>
        {chat.sitePane.open ? (
          <SitePane
            full={chat.sitePane.full}
            domain={chat.domain}
            onAct={chat.act}
          />
        ) : null}
        <DomainHandoff handoff={chat.handoff} onAct={chat.act} />
      </main>
    </div>
  );
}
