import { Check, Copy, ExternalLink, Globe, Lock, Settings } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";

import { BEST_DOMAIN, DOMAIN_SUGGESTIONS, domainStatus, type DomainStatus, SITE } from "../../data/site";
import { cn } from "../../lib/cn";
import type { DomainState, WidgetAction } from "../engine/types";
import { WixMark } from "../WixMark";
import { Frame, inputClass } from "./primitives";

/* Small pill for domain states. Semantic colours only; Wix blue stays on the primary action. */
export function StatusTag({ status }: { status: DomainStatus | "pending" | "connected" | "free" }) {
  const map: Record<typeof status, [string, string]> = {
    AVAILABLE: ["Available", "bg-success-soft text-success"],
    PREMIUM: ["Premium", "bg-warning-soft text-warning"],
    REGISTERED: ["Taken", "bg-danger-soft text-danger"],
    pending: ["Setting up…", "bg-surface-tertiary text-secondary"],
    connected: ["Connected", "bg-success-soft text-success"],
    free: ["Free Wix address", "bg-surface-tertiary text-secondary"],
  };
  const [label, cls] = map[status];
  return <span className={cn("inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap", cls)}>{label}</span>;
}

/** Wix-blue primary, used only for the one action that leads to Wix. */
export function WixButton({ children, onClick, className, size = "md", type = "button" }: { children: ReactNode; onClick?: () => void; className?: string; size?: "sm" | "md"; type?: "button" | "submit" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-wix font-semibold text-white transition hover:bg-wix-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-wix focus-visible:ring-offset-2",
        size === "sm" ? "h-7 px-3 text-xs" : "h-9 px-4 text-sm",
        className,
      )}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, className, type = "button" }: { children: ReactNode; onClick?: () => void; className?: string; type?: "button" | "submit" }) {
  return (
    <button type={type} onClick={onClick} className={cn("inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-default bg-surface px-3.5 text-sm font-medium transition hover:bg-surface-secondary", className)}>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------ build progress */

export function SiteBuildingCard({ phase, note, onAct }: { phase: "planning" | "building" | "done"; note?: string; onAct: (a: WidgetAction) => void }) {
  if (phase === "done") {
    return (
      <div className="flex items-center gap-2 text-sm text-secondary">
        <span>Opened Wix site</span>
        <button type="button" onClick={() => onAct({ type: "site-pane", open: true })} className="inline-flex items-center gap-1 rounded-md px-1 underline decoration-dotted underline-offset-4 hover:text-[color:var(--color-text)]">
          Open app in tab <ExternalLink className="size-3.5" />
        </button>
      </div>
    );
  }
  return (
    <Frame className="max-w-[560px]">
      <div className="flex flex-col items-center gap-4 px-6 py-8 text-center">
        <div className="relative h-28 w-44 overflow-hidden rounded-xl border border-default bg-surface-secondary">
          <div className="absolute inset-x-3 top-3 h-2 rounded bg-surface-tertiary" />
          <div className="absolute inset-x-3 top-8 h-10 animate-pulse rounded bg-[#1b1611]" />
          <div className="absolute top-20 left-3 h-2 w-16 rounded bg-surface-tertiary" />
          <div className="absolute top-20 right-3 h-5 w-12 rounded bg-wix/80" />
        </div>
        <div>
          <p className="text-base font-semibold">{phase === "planning" ? "Planning your site…" : "Building your site…"}</p>
          <p className="mt-1 text-sm text-secondary">{note ?? "This may take a few minutes."}</p>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------ closing message */

export function SiteLiveMessage({ domain, onAct }: { domain: DomainState; onAct: (a: WidgetAction) => void }) {
  const liveUrl = `https://${domain.stage === "connected" && domain.domain ? domain.domain : SITE.freeUrl}`;
  return (
    <div className="flex flex-col gap-3 text-[15px] leading-7">
      <div>
        <StatusTag status="connected" />
      </div>
      <p>Your new Tel Aviv bar website is live! 🍻</p>
      <h3 className="text-lg font-semibold leading-6">{SITE.name}</h3>
      <p>I created a dark, atmospheric design inspired by Tel Aviv nightlife, with warm amber accents, bold typography, and a beer-first identity.</p>
      <div className="flex flex-col gap-1.5">
        <a href={liveUrl} target="_blank" rel="noreferrer" className="inline-flex w-max items-center gap-2 font-medium underline underline-offset-4">
          <Globe className="size-4" /> View your live website <ExternalLink className="size-3.5" />
        </a>
        <a href={SITE.dashboardUrl} target="_blank" rel="noreferrer" className="inline-flex w-max items-center gap-2 font-medium underline underline-offset-4">
          <Settings className="size-4" /> Open Wix Dashboard <ExternalLink className="size-3.5" />
        </a>
      </div>

      {/* ChatGPT draws the app label above an inline widget. */}
      <div className="flex items-center gap-1.5 text-sm font-medium">
        <WixMark size={18} />
        <span>Wix</span>
      </div>
      <DomainCard domain={domain} onAct={onAct} />

      <h4 className="text-base font-semibold leading-6">What's included</h4>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <b>42 Draft Beers:</b> Beer-style showcase with four categories.
        </li>
        <li>
          <b>Wine &amp; Food:</b> Dedicated sections for wine, snacks, meals, and sharing plates.
        </li>
        <li>
          <b>Billiards:</b> Highlights your two pool tables.
        </li>
        <li>
          <b>Live Sports:</b> Football, basketball, and other sports screenings.
        </li>
        <li>
          <b>Find Us:</b> Lilienblum Street location and directions.
        </li>
      </ul>
      <p>
        The site is published as a custom-coded Wix website. Menu items, prices, game times and your exact address still need to be added. I used <i>{SITE.name}</i> as a provisional name inspired by your 42 taps.
      </p>
      <p>
        <b>Next improvement I'd prioritize:</b> Add real photographs of your bar, beer taps, billiards area, and food.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------ domain card */

export function DomainCard({ domain, onAct }: { domain: DomainState; onAct: (a: WidgetAction) => void }) {
  return (
    <Frame className="max-w-[560px]">
      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[15px] font-semibold">Your site's address</h3>
          <span className="ml-auto">
            <StatusTag status={domain.stage === "idle" ? "free" : domain.stage} />
          </span>
        </div>
        <DomainPicker domain={domain} onAct={onAct} />
      </div>
    </Frame>
  );
}

function DomainRow({ domain, status, onAct }: { domain: string; status: DomainStatus; onAct: (a: WidgetAction) => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface-secondary">
      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{domain}</span>
      <StatusTag status={status} />
      {status === "REGISTERED" ? (
        <GhostButton className="h-7 px-3 text-xs opacity-50">Taken</GhostButton>
      ) : (
        <WixButton size="sm" onClick={() => onAct({ type: "get-domain", domain })}>
          Get
        </WixButton>
      )}
    </div>
  );
}

/** Shared body of the chat card and the pane drawer. */
export function DomainPicker({ domain, all, onAct }: { domain: DomainState; all?: boolean; onAct: (a: WidgetAction) => void }) {
  const [showAll, setShowAll] = useState(!!all);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<{ domain: string; status: DomainStatus } | null>(null);
  const [copied, setCopied] = useState(false);

  if (domain.stage === "pending") {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-default bg-surface-secondary px-3 py-2.5">
          <StatusTag status="pending" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{domain.domain}</p>
            <p className="text-xs text-secondary">
              {domain.own ? "Connecting your domain to" : "Registered on Wix. Connecting to"} {SITE.name}; usually minutes, up to 48 hours everywhere.
            </p>
          </div>
          <GhostButton onClick={() => onAct({ type: "check-domain-status" })}>Check status</GhostButton>
        </div>
      </div>
    );
  }
  if (domain.stage === "connected") {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-default bg-success-soft px-3 py-2.5">
          <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-success text-white">
            <Check className="size-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{domain.domain}</p>
            <p className="text-xs text-secondary">Points to {SITE.name}. DNS can take up to 48 hours; the free address keeps working until then.</p>
          </div>
        </div>
        <a href={SITE.dashboardUrl} target="_blank" rel="noreferrer" className="inline-flex w-max items-center gap-1 text-sm underline underline-offset-4">
          Manage in Wix dashboard <ExternalLink className="size-3.5" />
        </a>
      </div>
    );
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SITE.freeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard blocked: leave the text selectable */
    }
  };
  const check = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setResult(domainStatus(query));
  };
  const list = showAll ? DOMAIN_SUGGESTIONS : DOMAIN_SUGGESTIONS.slice(0, 3);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-xl border border-default bg-surface-secondary py-2 pr-2 pl-3">
        <Lock className="size-3.5 shrink-0 text-tertiary" />
        <code className="min-w-0 flex-1 truncate font-mono text-xs text-secondary" title={SITE.freeUrl}>
          {SITE.freeUrl}
        </code>
        <GhostButton onClick={copy} className="h-7 px-2.5 text-xs">
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          <span className="ml-1">{copied ? "Copied" : "Copy"}</span>
        </GhostButton>
      </div>
      <p className="text-sm text-secondary">A custom domain is easier to say, share and find. Available now:</p>
      <div className="-mx-2 flex flex-col">
        {list.map((s) => (
          <DomainRow key={s.domain} domain={s.domain} status={s.status} onAct={onAct} />
        ))}
      </div>
      <form onSubmit={check} className="flex gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try another name, e.g. lilienblumbar.com" className={inputClass} aria-label="Domain to check" />
        <GhostButton type="submit" className="h-10">
          Check
        </GhostButton>
      </form>
      {result ? (
        <div className="-mx-2 -mt-1">
          <DomainRow domain={result.domain} status={result.status} onAct={onAct} />
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-secondary">
        {!showAll ? (
          <button type="button" onClick={() => setShowAll(true)} className="underline underline-offset-4 hover:text-[color:var(--color-text)]">
            Show more names
          </button>
        ) : null}
        <button type="button" onClick={() => onAct({ type: "connect-own-domain" })} className="underline underline-offset-4 hover:text-[color:var(--color-text)]">
          I already own a domain
        </button>
        <span className="ml-auto text-tertiary">Purchase completes on Wix</span>
      </div>
    </div>
  );
}

export { BEST_DOMAIN };
