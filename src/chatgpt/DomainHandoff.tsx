import { ExternalLink } from "lucide-react";
import { useState } from "react";

import { SITE } from "../data/site";
import type { Handoff, WidgetAction } from "./engine/types";
import { Button } from "./widgets/primitives";

/**
 * Purchase never happens inside ChatGPT. This shows ChatGPT's "leaving" dialog, then a mock of
 * the Wix tab that opens (checkout or connect-your-domain), then the return to the chat.
 */
export function DomainHandoff({ handoff, onAct }: { handoff: Handoff; onAct: (a: WidgetAction) => void }) {
  const [own, setOwn] = useState("lilienblumbar.co.il");
  if (!handoff) return null;
  const { step, domain, connect } = handoff;

  if (step === "leave") {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-label="Continue on Wix">
        <div className="widget-frame w-full max-w-[440px] p-5">
          <h3 className="text-base font-semibold">{connect ? "Connect your domain on Wix" : "Continue on Wix"}</h3>
          <p className="mt-1.5 text-sm text-secondary">
            {connect ? (
              <>
                Wix opens in a new tab so you can connect a domain you already own to {SITE.name}. Your site and this chat stay here.
              </>
            ) : (
              <>
                Wix opens in a new tab to complete the purchase of <b>{domain}</b> for {SITE.name}. Your site and this chat stay here.
              </>
            )}
          </p>
          <p className="mt-2 text-xs text-tertiary">Demo: a mock of the Wix page follows. Nothing is purchased.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button color="secondary" variant="outline" onClick={() => onAct({ type: "handoff", step: "cancel" })}>
              Cancel
            </Button>
            <Button color="primary" onClick={() => onAct({ type: "handoff", step: "open" })}>
              Open Wix <ExternalLink className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const path = connect ? "connect" : `checkout?domain=${domain}`;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="Wix (new tab)">
      <div className="flex h-full max-h-[640px] w-full max-w-[900px] flex-col overflow-hidden rounded-2xl bg-[#f0f2f5] text-[#161616] shadow-2xl" style={{ colorScheme: "light" }}>
        <div className="flex items-center gap-3 bg-[#dfe3ea] px-3 py-2 text-xs text-[#444]">
          <span className="rounded-lg bg-white px-3 py-1.5 font-semibold text-[#161616]">WIX · {connect ? "Connect a domain" : "Domains"}</span>
          <span className="truncate">ChatGPT — Create bar website</span>
          <span className="ml-auto whitespace-nowrap">mock browser tab</span>
        </div>
        <div className="bg-[#dfe3ea] px-3 pb-2">
          <div className="truncate rounded-full bg-white px-4 py-1.5 font-mono text-xs text-[#444]">www.wix.com/domains/{path}&amp;site={SITE.name.replace(/\s/g, "").toLowerCase()}&amp;utm_source=chatgpt.com</div>
        </div>
        <div className="flex items-center gap-2 border-b border-[#dfe3ea] bg-white px-6 py-2.5 text-lg font-extrabold">
          WIX <span className="text-sm font-normal text-[#555]">· {SITE.name}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === "wix" && connect ? (
            <>
              <h2 className="text-2xl font-semibold tracking-tight">Connect a domain you already own</h2>
              <div className="mt-4 flex max-w-[560px] flex-col gap-3 rounded-xl border border-[#dfe3ea] bg-white p-4">
                <label className="flex flex-col gap-1.5 text-sm text-[#555]">
                  Your domain
                  <input value={own} onChange={(e) => setOwn(e.target.value)} className="h-10 rounded-lg border border-[#c9cfd8] bg-white px-3 text-sm text-[#161616] outline-none focus:border-[#116dff]" />
                </label>
                <Row k="Connect to" v={SITE.name} />
                <Row k="Method" v="Point name servers to Wix (guided)" />
                <Actions onCancel={() => onAct({ type: "handoff", step: "cancel" })} onOk={() => onAct({ type: "handoff", step: "complete", ownDomain: own.trim() })} ok="Connect (mock)" />
              </div>
            </>
          ) : step === "wix" ? (
            <>
              <h2 className="text-2xl font-semibold tracking-tight">Register {domain}</h2>
              <div className="mt-4 flex max-w-[560px] flex-col gap-3 rounded-xl border border-[#dfe3ea] bg-white p-4">
                <Row k="Domain" v={domain} />
                <Row k="Connect to" v={SITE.name} />
                <Row k="Term" v="1 year, auto-renew" />
                <Row k="Privacy protection" v="Included" />
                <Row k="Price" v="shown here on Wix, never in ChatGPT" />
                <Actions onCancel={() => onAct({ type: "handoff", step: "cancel" })} onOk={() => onAct({ type: "handoff", step: "complete" })} ok="Complete purchase (mock)" />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold tracking-tight">{connect ? "Domain connecting" : `You own ${domain}`}</h2>
              <div className="mt-4 flex max-w-[560px] flex-col gap-3 rounded-xl border border-[#dfe3ea] bg-white p-4">
                <Row k={domain} v={connect ? "Connecting" : "Registered"} strong />
                <p className="text-xs text-[#777]">It can take up to 48 hours for the domain to work everywhere. Your site keeps working on its free address until then.</p>
                <div className="flex justify-end">
                  <button type="button" onClick={() => onAct({ type: "handoff", step: "back" })} className="inline-flex h-10 items-center rounded-full bg-[#116dff] px-5 text-sm font-semibold text-white hover:bg-[#0d5ce0]">
                    Back to ChatGPT →
                  </button>
                </div>
              </div>
            </>
          )}
          <p className="mt-4 text-xs text-[#777]">Mock of the Wix page that opens in a new tab. Nothing is purchased.</p>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className={strong ? "font-semibold" : ""}>{k}</span>
      <span className={strong ? "font-semibold text-[#2f8a5a]" : "text-[#555]"}>{v}</span>
    </div>
  );
}

function Actions({ onCancel, onOk, ok }: { onCancel: () => void; onOk: () => void; ok: string }) {
  return (
    <div className="flex justify-end gap-2 pt-1">
      <button type="button" onClick={onCancel} className="inline-flex h-10 items-center rounded-full border border-[#c9cfd8] bg-white px-4 text-sm font-semibold hover:bg-[#f6f7f9]">
        Cancel
      </button>
      <button type="button" onClick={onOk} className="inline-flex h-10 items-center rounded-full bg-[#116dff] px-5 text-sm font-semibold text-white hover:bg-[#0d5ce0]">
        {ok}
      </button>
    </div>
  );
}
