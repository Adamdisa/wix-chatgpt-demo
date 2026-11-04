import { ArrowRight, MessageSquareText, Store, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { STARTER_PROMPTS } from "../chatgpt/engine/useConversation";

const KEY = "wix-chatgpt-guide-dismissed";

function readDismissed() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/** Short orientation for people opening the prototype cold: what it is and where to click. */
export function DemoGuide({ onStart }: { onStart: () => void }) {
  const [dismissed, setDismissed] = useState(readDismissed);
  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <section aria-label="How to use this demo" className="mx-auto max-w-7xl px-5 pt-6 sm:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-wix-ink p-6 text-white sm:p-7">
        <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-wix/40 blur-3xl" />
        <button type="button" onClick={dismiss} aria-label="Dismiss guide" className="absolute top-4 right-4 rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white">
          <X className="size-4" />
        </button>
        <p className="eyebrow !text-white/55">Interactive prototype</p>
        <h2 className="mt-2 max-w-2xl text-xl font-bold tracking-tight sm:text-2xl">
          This demo has two sides: the business that gets listed, and the person booking in ChatGPT.
        </h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Store className="size-4 text-wix" /> 1 · Business side
            </div>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Click <strong className="text-white">Get listed free</strong> to onboard a barber shop: sign up, connect a bookings tool like Calendly and an events tool like Eventbrite, review what synced, publish. Then open the dashboard to toggle what shows in ChatGPT.
            </p>
            <button type="button" onClick={onStart} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white underline-offset-4 hover:underline">
              Start onboarding <ArrowRight className="size-4" />
            </button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MessageSquareText className="size-4 text-wix" /> 2 · ChatGPT side
            </div>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Click <strong className="text-white">Live demo</strong> to open a mock ChatGPT with Wix connected as an app. Ask it to book, reserve or buy tickets. Try one of these:
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {STARTER_PROMPTS.map((p) => (
                <Link
                  key={p.text}
                  to={`/chatgpt?prompt=${encodeURIComponent(p.text)}`}
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white hover:text-wix-ink"
                >
                  “{p.text}”
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
