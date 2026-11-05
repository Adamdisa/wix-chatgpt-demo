import { ExternalLink, Lock, Maximize2, Minimize2, RefreshCw, X } from "lucide-react";
import { useState } from "react";

import { BEST_DOMAIN, SITE } from "../data/site";
import { cn } from "../lib/cn";
import type { DomainState, WidgetAction } from "./engine/types";
import { DomainPicker, StatusTag, WixButton } from "./widgets/SiteWidgets";
import { WixMark } from "./WixMark";

/**
 * ChatGPT's app viewer beside the thread ("Wix site" tab, full view, close) with our widget inside:
 * an address bar in the header, the live site below. Mirrors what chatgpt.com showed on 2026-11-05.
 */
export function SitePane({ full, domain, onAct }: { full: boolean; domain: DomainState; onAct: (a: WidgetAction) => void }) {
  const [drawer, setDrawer] = useState(false);
  const [toast, setToast] = useState(true);
  const onFree = domain.stage === "idle" || !domain.domain;
  const url = onFree ? SITE.freeUrl : domain.domain!;

  const iconBtn = "inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-secondary hover:bg-surface-secondary";

  return (
    <aside className={cn("fixed inset-0 z-30 flex flex-col bg-surface lg:static lg:z-auto lg:border-l lg:border-default", full ? "lg:flex-1" : "lg:w-[58%] lg:shrink-0")} aria-label="Wix site">
      {/* ChatGPT viewer chrome */}
      <div className="flex h-14 shrink-0 items-center gap-2 px-3">
        <span className="inline-flex items-center gap-2 rounded-xl bg-surface-secondary px-3 py-1.5 text-sm font-medium">
          <WixMark size={18} /> Wix site
        </span>
        <span className="flex-1" />
        <button type="button" aria-label={full ? "Exit full view" : "Enter full view"} onClick={() => onAct({ type: "site-pane", open: true, full: !full })} className={cn(iconBtn, "hidden lg:inline-flex")}>
          {full ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
        </button>
        <button type="button" aria-label="Close viewer" onClick={() => onAct({ type: "site-pane", open: false })} className={iconBtn}>
          <X className="size-4" />
        </button>
      </div>

      {/* Wix widget header: the address bar */}
      <div className="flex shrink-0 items-center gap-2 border-y border-default px-3 py-2">
        <div className="flex h-9 min-w-0 flex-1 items-center gap-1 rounded-full border border-default bg-surface-secondary pr-1 pl-3 transition focus-within:border-strong hover:border-strong">
          <Lock className="size-3.5 shrink-0 text-tertiary" />
          <button type="button" onClick={() => setDrawer(true)} title="Site address" className={cn("min-w-0 flex-1 truncate text-left font-mono text-[13px]", onFree ? "text-secondary" : "")}>
            {url}
          </button>
          {domain.stage === "connected" ? (
            <StatusTag status="connected" />
          ) : domain.stage === "pending" ? (
            <StatusTag status="pending" />
          ) : (
            <WixButton size="sm" onClick={() => onAct({ type: "get-domain", domain: BEST_DOMAIN })}>
              Get {BEST_DOMAIN}
            </WixButton>
          )}
        </div>
        <a href={SITE.dashboardUrl} target="_blank" rel="noreferrer" className="hidden h-9 shrink-0 items-center rounded-full bg-wix px-4 text-sm font-semibold text-white hover:bg-wix-hover sm:inline-flex">
          Open dashboard
        </a>
        <button type="button" aria-label="Refresh" className={iconBtn}>
          <RefreshCw className="size-4" />
        </button>
        <a aria-label="Open in new tab" href={`https://${url}`} target="_blank" rel="noreferrer" className={iconBtn}>
          <ExternalLink className="size-4" />
        </a>
      </div>

      {/* the live site */}
      <div className="relative min-h-0 flex-1 overflow-hidden bg-[#0e0c0a]">
        <img src={SITE.preview} alt={`${SITE.name} live site`} className="size-full object-cover object-top" />
        {drawer ? (
          <>
            <button type="button" aria-label="Close site address" onClick={() => setDrawer(false)} className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-x-0 top-0 max-h-full overflow-y-auto rounded-b-2xl border-b border-default bg-surface p-4 shadow-2xl">
              <div className="mb-3 flex items-center gap-2">
                <WixMark size={18} />
                <h3 className="flex-1 text-[15px] font-semibold">Site address</h3>
                <button type="button" aria-label="Close" onClick={() => setDrawer(false)} className={iconBtn}>
                  <X className="size-4" />
                </button>
              </div>
              <DomainPicker
                domain={domain}
                all
                onAct={(a) => {
                  if (a.type === "get-domain" || a.type === "connect-own-domain") setDrawer(false);
                  onAct(a);
                }}
              />
            </div>
          </>
        ) : null}
        {toast ? (
          <div className="absolute right-4 bottom-4 flex max-w-[calc(100%-2rem)] items-center gap-3 rounded-xl border border-default bg-surface px-3 py-2 text-sm shadow-lg">
            <span>
              Built on <b>WIX</b> Headless
            </span>
            <button type="button" aria-label="Dismiss" onClick={() => setToast(false)} className="text-secondary">
              <X className="size-3.5" />
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
