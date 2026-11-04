import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Calendar, Check, ExternalLink, Eye, EyeOff, Loader2, Lock, RotateCcw, Sparkles, Ticket, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import barberImage from "../../assets/barber.png";
import { CarouselCard, Tag } from "../../chatgpt/widgets/primitives";
import { WixLogo, WixMark } from "../../chatgpt/WixMark";
import { ALL_PROVIDERS, BOOKING_PROVIDERS, BUSINESS_CATEGORIES, EVENT_PROVIDERS, type Provider } from "../../data/catalog";
import { cn } from "../../lib/cn";
import { ProviderDot } from "../sections";
import { SAMPLE_BUSINESS, SYNCED_EVENTS, SYNCED_SERVICES, useOnboardingState } from "../store";

type StepId = "account" | "business" | "listings" | "bookings" | "events" | "review" | "live";

const STEP_META: Record<StepId, { title: string; short: string }> = {
  account: { title: "Create your Wix account", short: "Account" },
  business: { title: "Tell us about your business", short: "Business" },
  listings: { title: "What do you want to list?", short: "Listings" },
  bookings: { title: "Connect your bookings tool", short: "Bookings" },
  events: { title: "Connect your events tool", short: "Events" },
  review: { title: "Review your ChatGPT listing", short: "Review" },
  live: { title: "You're live", short: "Live" },
};

/* ------------------------------------------------------------------ frame */

function BrowserFrame({ url, onClose, children }: { url: string; onClose?: () => void; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
      <div className="flex h-11 items-center gap-3 border-b border-black/8 bg-[#f3f3f3] px-3">
        <span className="flex gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </span>
        <div className="flex h-7 flex-1 items-center gap-2 rounded-md bg-white px-3 text-xs text-black/60">
          <Lock className="size-3" /> {url}
        </div>
        {onClose ? (
          <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 hover:bg-black/5">
            <X className="size-4" />
          </button>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

/* --------------------------------------------------------------- sign up */

function SignUp({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState<null | "google" | "email">(null);

  const go = (kind: "google" | "email") => {
    setBusy(kind);
    setTimeout(onDone, 1400);
  };

  return (
    <BrowserFrame url="users.wix.com/signin/signup?redirectTo=chatgpt-listing">
      <div className="mx-auto flex min-h-full max-w-sm flex-col justify-center px-6 py-12">
        <WixLogo className="h-8 w-auto text-wix-ink" />
        <h2 className="mt-10 text-3xl font-bold tracking-tight">Sign up</h2>
        <p className="mt-1 text-sm text-black/60">
          Already have a Wix account?{" "}
          <button type="button" className="font-semibold text-wix hover:underline" onClick={() => go("email")}>
            Log in
          </button>
        </p>
        <button type="button" onClick={() => go("google")} disabled={!!busy} className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-full border border-black/15 text-sm font-semibold hover:border-black/40 disabled:opacity-60">
          {busy === "google" ? <Loader2 className="size-4 animate-spin" /> : <GoogleG />}
          Continue with Google
        </button>
        <div className="my-6 flex items-center gap-3 text-xs text-black/40">
          <span className="h-px flex-1 bg-black/10" /> or <span className="h-px flex-1 bg-black/10" />
        </div>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            go("email");
          }}
        >
          <input className="field" type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
          <div className="relative">
            <input className="field pr-12" type={show ? "text" : "password"} required minLength={8} placeholder="Password (8+ characters)" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label="Toggle password" className="absolute top-1/2 right-3 -translate-y-1/2 text-black/50">
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <button type="submit" disabled={!!busy} className="btn-wix h-12 w-full">
            {busy === "email" ? <Loader2 className="size-4 animate-spin" /> : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-xs leading-5 text-black/45">By signing up you agree to the Wix Terms of Use and Privacy Policy. This is a demo. Nothing is sent anywhere.</p>
      </div>
    </BrowserFrame>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.2v3.1C3.2 21.3 7.3 24 12 24z" />
      <path fill="#FBBC05" d="M5.3 14.3c-.5-1.5-.5-3.1 0-4.6V6.6H1.2a12 12 0 0 0 0 10.8l4.1-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.3 0 3.2 2.7 1.2 6.6l4.1 3.1c.9-2.9 3.6-4.9 6.7-4.9z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ OAuth */

function OAuthConsent({ provider, businessName, onAllow, onCancel }: { provider: Provider; businessName: string; onAllow: () => void; onCancel: () => void }) {
  const [busy, setBusy] = useState(false);
  const scopes =
    provider.kind === "bookings"
      ? ["Read your services, staff and prices", "Read availability and existing bookings", "Create and update bookings made in ChatGPT"]
      : ["Read your upcoming events and ticket types", "Read remaining capacity in real time", "Create ticket orders and RSVPs made in ChatGPT"];
  return (
    <BrowserFrame url={`accounts.${provider.domain}/oauth/authorize?client_id=wix-chatgpt&scope=${provider.kind}.read+${provider.kind}.write`} onClose={onCancel}>
      <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-12">
        <div className="flex items-center justify-center gap-3">
          <ProviderDot p={provider} size={52} className="rounded-2xl text-lg" />
          <span className="text-black/30">⟷</span>
          <WixMark size={52} className="rounded-2xl" />
        </div>
        <h2 className="mt-8 text-center text-2xl font-bold tracking-tight">Wix wants to access your {provider.name} account</h2>
        <p className="mt-2 text-center text-sm text-black/60">
          for <span className="font-semibold text-black">{businessName || "your business"}</span>
        </p>
        <ul className="mt-8 space-y-3 rounded-2xl border border-black/10 p-5 text-sm">
          {scopes.map((s) => (
            <li key={s} className="flex items-start gap-3">
              <Check className="mt-0.5 size-4 shrink-0 text-wix" /> {s}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-5 text-black/45">You can revoke this access from your {provider.name} settings at any time. Wix never sees your {provider.name} password.</p>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              setTimeout(onAllow, 1200);
            }}
            className="btn-primary flex-1"
            style={{ background: provider.color }}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : "Allow"}
          </button>
        </div>
      </div>
    </BrowserFrame>
  );
}

function SyncProgress({ provider, onDone }: { provider: Provider; onDone: () => void }) {
  const lines =
    provider.kind === "bookings"
      ? [`Connected to ${provider.name}`, `Imported ${SYNCED_SERVICES.length} services and 3 staff members`, "Read availability for the next 60 days", "Listing ready for ChatGPT"]
      : [`Connected to ${provider.name}`, `Imported ${SYNCED_EVENTS.length} upcoming events`, "Read ticket types and remaining capacity", "Listing ready for ChatGPT"];
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= lines.length) {
      const t = setTimeout(onDone, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setN(n + 1), 650);
    return () => clearTimeout(t);
  }, [n, lines.length, onDone]);
  return (
    <div className="mx-auto max-w-md py-10">
      <div className="flex items-center gap-3">
        <ProviderDot p={provider} size={44} className="rounded-2xl" />
        <div>
          <div className="font-semibold">Syncing from {provider.name}</div>
          <div className="text-sm text-black/55">This usually takes a few seconds.</div>
        </div>
      </div>
      <ul className="mt-8 space-y-3">
        {lines.map((l, i) => (
          <li key={l} className={cn("flex items-center gap-3 text-sm transition", i < n ? "text-black" : i === n ? "text-black/70" : "text-black/30")}>
            {i < n ? <Check className="size-4 text-wix" /> : i === n ? <Loader2 className="size-4 animate-spin" /> : <span className="size-4 rounded-full border border-black/20" />}
            {l}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProviderGrid({ items, selected, onSelect }: { items: Provider[]; selected?: string; onSelect: (id: string) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => (
        <button key={p.id} type="button" onClick={() => onSelect(p.id)} className={cn("flex items-center gap-3 rounded-2xl border p-4 text-left transition", selected === p.id ? "border-wix ring-2 ring-wix/20" : "border-black/10 hover:border-black/30")}>
          <ProviderDot p={p} size={40} className="rounded-xl" />
          <span className="min-w-0">
            <span className="block truncate font-semibold">{p.name}</span>
            <span className="block truncate text-xs text-black/55">{p.native ? "Built into Wix · instant" : p.blurb}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------- the flow */

export function OnboardingFlow({ onClose }: { onClose: () => void }) {
  const { state, update, reset } = useOnboardingState();
  const [step, setStep] = useState<StepId>(state.publishedAt ? "live" : "account");
  const [oauth, setOauth] = useState<Provider | null>(null);
  const [syncing, setSyncing] = useState<Provider | null>(null);

  const steps = useMemo<StepId[]>(() => {
    const s: StepId[] = ["account", "business", "listings"];
    if (state.listings.bookings) s.push("bookings");
    if (state.listings.events) s.push("events");
    s.push("review", "live");
    return s;
  }, [state.listings]);

  const idx = steps.indexOf(step);
  const next = () => setStep(steps[Math.min(idx + 1, steps.length - 1)]);
  const back = () => setStep(steps[Math.max(idx - 1, 0)]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !oauth && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, oauth]);

  const b = state.business;
  const businessValid = b.name.trim() && b.category && b.city.trim();

  const chooseProvider = (p: Provider) => {
    const key = p.kind === "bookings" ? "bookingProvider" : "eventProvider";
    update({ [key]: p.id });
    if (p.native) setSyncing(p);
    else setOauth(p);
  };

  const content = () => {
    switch (step) {
      case "account":
        return (
          <div className="h-[640px] max-h-[75vh]">
            <SignUp onDone={next} />
          </div>
        );

      case "business":
        return (
          <div className="max-w-2xl">
            <button type="button" onClick={() => update({ business: SAMPLE_BUSINESS })} className="mb-6 inline-flex items-center gap-2 rounded-full bg-wix/10 px-3 py-1.5 text-xs font-semibold text-wix hover:bg-wix/15">
              <Sparkles className="size-3.5" /> Fill with example: Oren's Barber Shop
            </button>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium">Business name</span>
                <input className="field" value={b.name} onChange={(e) => update({ business: { ...b, name: e.target.value } })} placeholder="e.g. Oren's Barber Shop" />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-medium">Category</span>
                <select className="field" value={b.category} onChange={(e) => update({ business: { ...b, category: e.target.value, subcategory: "" } })}>
                  <option value="">Select…</option>
                  {Object.keys(BUSINESS_CATEGORIES).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-medium">Type</span>
                <select className="field" value={b.subcategory} disabled={!b.category} onChange={(e) => update({ business: { ...b, subcategory: e.target.value } })}>
                  <option value="">{b.category ? "Select…" : "Pick a category first"}</option>
                  {(BUSINESS_CATEGORIES[b.category] ?? []).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-medium">City or address</span>
                <input className="field" value={b.city} onChange={(e) => update({ business: { ...b, city: e.target.value } })} placeholder="Tel Aviv" />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-medium">Phone</span>
                <input className="field" value={b.phone} onChange={(e) => update({ business: { ...b, phone: e.target.value } })} placeholder="+972 …" />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1.5 flex items-center justify-between text-sm font-medium">
                  Short description
                  <button type="button" onClick={() => update({ business: { ...b, description: `${b.name || "We"} offer ${b.subcategory ? b.subcategory.toLowerCase() : "services"} in ${b.city || "your city"}. Book online, walk-ins welcome.` } })} className="inline-flex items-center gap-1 text-xs font-semibold text-wix hover:underline">
                    <Sparkles className="size-3" /> Write it for me
                  </button>
                </span>
                <textarea className="field min-h-24" value={b.description} onChange={(e) => update({ business: { ...b, description: e.target.value } })} placeholder="What should ChatGPT tell people about you?" />
              </label>
            </div>
          </div>
        );

      case "listings":
        return (
          <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
            {[
              { key: "bookings" as const, icon: Calendar, title: "Bookings", body: "Appointments, classes and services with live availability. ChatGPT books into your calendar.", eg: "“Book me a haircut tomorrow afternoon”" },
              { key: "events" as const, icon: Ticket, title: "Events", body: "Shows, workshops, markets and meetups. ChatGPT sells tickets or takes RSVPs.", eg: "“What's happening this weekend?”" },
            ].map(({ key, icon: Icon, title, body, eg }) => {
              const on = state.listings[key];
              return (
                <button key={key} type="button" onClick={() => update({ listings: { ...state.listings, [key]: !on } })} aria-pressed={on} className={cn("rounded-3xl border p-6 text-left transition", on ? "border-wix ring-2 ring-wix/20" : "border-black/10 hover:border-black/30")}>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-wix/10 text-wix">
                      <Icon className="size-5" />
                    </span>
                    <span className={cn("inline-flex size-6 items-center justify-center rounded-full border", on ? "border-wix bg-wix text-white" : "border-black/20")}>{on ? <Check className="size-4" /> : null}</span>
                  </div>
                  <h3 className="mt-5 text-xl font-bold">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-black/65">{body}</p>
                  <p className="mt-3 text-xs text-black/45">{eg}</p>
                </button>
              );
            })}
          </div>
        );

      case "bookings":
      case "events": {
        const kind = step;
        const items = kind === "bookings" ? BOOKING_PROVIDERS : EVENT_PROVIDERS;
        const selected = kind === "bookings" ? state.bookingProvider : state.eventProvider;
        if (syncing && syncing.kind === kind) {
          return (
            <SyncProgress
              provider={syncing}
              onDone={() => {
                setSyncing(null);
                next();
              }}
            />
          );
        }
        return (
          <div className="max-w-3xl">
            <p className="mb-6 text-black/65">
              {kind === "bookings" ? "Where do you manage appointments today? We'll import services, staff and availability and keep them in sync." : "Where do you publish events today? We'll import upcoming events, ticket types and remaining capacity."}
            </p>
            <ProviderGrid items={items} selected={selected} onSelect={(id) => chooseProvider(items.find((p) => p.id === id)!)} />
            <button type="button" onClick={next} className="mt-6 text-sm font-semibold text-black/55 hover:text-black">
              Skip for now
            </button>
          </div>
        );
      }

      case "review": {
        const bp = ALL_PROVIDERS.find((p) => p.id === state.bookingProvider);
        const ep = ALL_PROVIDERS.find((p) => p.id === state.eventProvider);
        const toggle = (list: "hiddenServiceIds" | "hiddenEventIds", id: string) =>
          update((s) => ({ ...s, [list]: s[list].includes(id) ? s[list].filter((x) => x !== id) : [...s[list], id] }));
        return (
          <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
            <div className="space-y-8">
              {state.listings.bookings && (
                <section>
                  <h3 className="flex items-center gap-2 text-lg font-bold">
                    Services {bp ? <span className="inline-flex items-center gap-1.5 rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-black/60"><ProviderDot p={bp} size={14} className="rounded text-[8px]" /> from {bp.name}</span> : null}
                  </h3>
                  <ul className="mt-3 divide-y divide-black/8 rounded-2xl border border-black/10">
                    {SYNCED_SERVICES.map((s) => {
                      const hidden = state.hiddenServiceIds.includes(s.id);
                      return (
                        <li key={s.id} className={cn("flex items-center gap-4 px-4 py-3 text-sm", hidden && "opacity-45")}>
                          <span className="flex-1 font-medium">{s.name}</span>
                          <span className="text-black/55">{s.minutes} min</span>
                          <span className="w-14 text-right tabular-nums">₪{s.price}</span>
                          <Switch on={!hidden} onToggle={() => toggle("hiddenServiceIds", s.id)} />
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
              {state.listings.events && (
                <section>
                  <h3 className="flex items-center gap-2 text-lg font-bold">
                    Upcoming events {ep ? <span className="inline-flex items-center gap-1.5 rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-black/60"><ProviderDot p={ep} size={14} className="rounded text-[8px]" /> from {ep.name}</span> : null}
                  </h3>
                  <ul className="mt-3 divide-y divide-black/8 rounded-2xl border border-black/10">
                    {SYNCED_EVENTS.map((e) => {
                      const hidden = state.hiddenEventIds.includes(e.id);
                      return (
                        <li key={e.id} className={cn("flex items-center gap-4 px-4 py-3 text-sm", hidden && "opacity-45")}>
                          <span className="flex-1">
                            <span className="block font-medium">{e.name}</span>
                            <span className="block text-xs text-black/55">
                              {new Date(`${e.date}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {e.time} · {e.tickets}
                            </span>
                          </span>
                          <Switch on={!hidden} onToggle={() => toggle("hiddenEventIds", e.id)} />
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
            </div>
            <aside>
              <h3 className="text-sm font-semibold text-black/60">How you'll appear in ChatGPT</h3>
              <div data-theme="light" className="mt-3" style={{ fontFamily: "var(--font-sans)" }}>
                <CarouselCard image={barberImage} alt={b.name} title={b.name || "Your business"} badge={<Tag tone="success">New on Wix</Tag>} lines={["★ New · " + (b.city || "Your city"), b.subcategory || b.category || "Services", `${SYNCED_SERVICES.length - state.hiddenServiceIds.length} services · next: Today 15:30`]} cta="Book" onCta={() => {}} />
              </div>
              <p className="mt-3 text-xs leading-5 text-black/50">ChatGPT adds the Wix name and logo above the card. Ratings appear after your first reviews.</p>
            </aside>
          </div>
        );
      }

      case "live":
        return (
          <div className="max-w-xl">
            <span className="inline-flex size-14 items-center justify-center rounded-full bg-wix/10 text-wix">
              <Check className="size-7" />
            </span>
            <h3 className="mt-6 text-3xl font-bold tracking-tight">{b.name || "Your business"} is live in ChatGPT.</h3>
            <p className="mt-3 leading-7 text-black/65">
              Your {[state.listings.bookings && "services", state.listings.events && "events"].filter(Boolean).join(" and ")} sync every few minutes. Try asking ChatGPT the way a customer would.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={`/chatgpt?prompt=${encodeURIComponent(state.listings.bookings ? `Book me a haircut in ${b.city || "Tel Aviv"} tomorrow afternoon` : `What's happening in ${b.city || "Tel Aviv"} this weekend?`)}`} className="btn-primary">
                Try it in ChatGPT <ExternalLink className="size-4" />
              </Link>
              <Link to="/dashboard" className="btn-secondary">
                Go to dashboard
              </Link>
            </div>
            <button
              type="button"
              onClick={() => {
                reset();
                setStep("account");
              }}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-black/55 hover:text-black"
            >
              <RotateCcw className="size-4" /> Start over with a fresh business
            </button>
          </div>
        );
    }
  };

  const footer = () => {
    if (step === "account" || step === "live" || syncing) return null;
    const canNext = step === "business" ? !!businessValid : step === "listings" ? state.listings.bookings || state.listings.events : step === "review" ? true : false;
    return (
      <div className="flex items-center justify-between border-t border-black/8 px-8 py-4">
        <button type="button" onClick={back} className="inline-flex items-center gap-1.5 text-sm font-semibold text-black/60 hover:text-black">
          <ArrowLeft className="size-4" /> Back
        </button>
        {step === "review" ? (
          <button
            type="button"
            onClick={() => {
              update({ publishedAt: Date.now() });
              next();
            }}
            className="btn-wix"
          >
            Publish to ChatGPT <ArrowRight className="size-4" />
          </button>
        ) : step === "bookings" || step === "events" ? null : (
          <button type="button" disabled={!canNext} onClick={next} className="btn-primary">
            Continue <ArrowRight className="size-4" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="lp fixed inset-0 z-50 flex items-stretch bg-black/40 p-0 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label="Get listed in ChatGPT">
      <div className="mx-auto flex w-full max-w-6xl overflow-hidden bg-white shadow-2xl sm:rounded-3xl">
        {/* rail */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-black/8 bg-[#fafafa] p-6 md:flex">
          <WixLogo className="h-6 w-auto text-wix-ink" />
          <p className="mt-1 text-xs font-medium text-black/50">Get listed in ChatGPT</p>
          <ol className="mt-8 space-y-1">
            {steps.map((s, i) => {
              const done = i < idx;
              const current = i === idx;
              return (
                <li key={s} className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm", current && "bg-white font-semibold shadow-sm")}>
                  <span className={cn("inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold", done ? "bg-wix text-white" : current ? "bg-wix-ink text-white" : "bg-black/8 text-black/50")}>{done ? <Check className="size-3.5" /> : i + 1}</span>
                  <span className={cn(!current && !done && "text-black/50")}>{STEP_META[s].short}</span>
                </li>
              );
            })}
          </ol>
          <p className="mt-auto text-xs leading-5 text-black/45">About 3 minutes. You can leave and come back; progress is saved.</p>
        </aside>

        {/* body */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-4 px-8 pt-7 pb-5">
            <div>
              <p className="text-xs font-semibold text-black/45">
                Step {idx + 1} of {steps.length}
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">{STEP_META[step].title}</h2>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-black/5">
              <X className="size-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-8">
            <AnimatePresence mode="wait">
              <motion.div key={`${step}-${syncing?.id ?? ""}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                {content()}
              </motion.div>
            </AnimatePresence>
          </div>
          {footer()}
        </div>
      </div>

      {oauth ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 sm:p-10">
          <div className="h-[640px] max-h-[85vh] w-full max-w-2xl">
            <OAuthConsent
              provider={oauth}
              businessName={b.name}
              onCancel={() => setOauth(null)}
              onAllow={() => {
                const p = oauth;
                setOauth(null);
                setSyncing(p);
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function Switch({ on, onToggle, label }: { on: boolean; onToggle: () => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onToggle} className={cn("relative h-6 w-10 shrink-0 rounded-full transition", on ? "bg-wix" : "bg-black/20")}>
      <span className={cn("absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition", on && "translate-x-4")} />
    </button>
  );
}
