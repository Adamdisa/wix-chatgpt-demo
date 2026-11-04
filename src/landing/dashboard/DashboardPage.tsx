import { ArrowUpRight, Bell, Bot, Calendar, ChevronDown, ExternalLink, Home, LayoutGrid, MessageSquareText, RefreshCw, Search, Settings, Ticket, Users } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link } from "react-router";

import { WixLogo } from "../../chatgpt/WixMark";
import { ALL_PROVIDERS } from "../../data/catalog";
import { cn } from "../../lib/cn";
import { useForceLight } from "../../lib/useTheme";
import { Switch } from "../onboarding/OnboardingFlow";
import { ProviderDot } from "../sections";
import { SAMPLE_BUSINESS, SYNCED_EVENTS, SYNCED_SERVICES, useOnboardingState } from "../store";

export function DashboardPage() {
  useForceLight();
  const { state, update, reset } = useOnboardingState();
  const business = state.business.name ? state.business : SAMPLE_BUSINESS;
  const bp = ALL_PROVIDERS.find((p) => p.id === state.bookingProvider) ?? ALL_PROVIDERS[0];
  const ep = ALL_PROVIDERS.find((p) => p.id === state.eventProvider) ?? ALL_PROVIDERS.find((p) => p.id === "wix-events")!;
  const live = !!state.publishedAt;

  useEffect(() => {
    document.title = `${business.name} · AI Integrations · Wix`;
  }, [business.name]);

  const stats = useMemo(
    () => [
      { label: "Shown in ChatGPT answers", value: live ? "1,284" : "—", delta: "+38% vs last week" },
      { label: "Bookings from ChatGPT", value: live ? "46" : "—", delta: "₪5,120 revenue" },
      { label: "Tickets sold from ChatGPT", value: live ? "112" : "—", delta: "3 events" },
      { label: "Top question", value: live ? "“haircut near Florentin”" : "—", delta: "212 asks" },
    ],
    [live],
  );

  const nav = [
    { icon: Home, label: "Home" },
    { icon: Calendar, label: "Bookings" },
    { icon: Ticket, label: "Events" },
    { icon: Users, label: "Customers" },
    { icon: Bot, label: "AI Integrations", active: true },
    { icon: LayoutGrid, label: "Apps" },
    { icon: Settings, label: "Settings" },
  ];

  const toggle = (list: "hiddenServiceIds" | "hiddenEventIds", id: string) => update((s) => ({ ...s, [list]: s[list].includes(id) ? s[list].filter((x) => x !== id) : [...s[list], id] }));

  return (
    <div className="lp flex min-h-dvh bg-[#f5f6f8]">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-black/8 bg-white p-4 lg:flex">
        <div className="flex items-center justify-between px-2 py-2">
          <WixLogo className="h-5 w-auto text-wix-ink" />
        </div>
        <button type="button" className="mt-4 flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-left text-sm">
          <span className="size-6 rounded-md bg-wix-ink" />
          <span className="min-w-0 flex-1 truncate font-semibold">{business.name}</span>
          <ChevronDown className="size-4 text-black/50" />
        </button>
        <nav className="mt-4 space-y-0.5">
          {nav.map(({ icon: Icon, label, active }) => (
            <button key={label} type="button" className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm", active ? "bg-wix/10 font-semibold text-wix" : "text-black/70 hover:bg-black/5")}>
              <Icon className="size-4" /> {label}
            </button>
          ))}
        </nav>
        <Link to="/" className="mt-auto text-xs text-black/45 hover:text-black">
          ← Back to landing page
        </Link>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center gap-4 border-b border-black/8 bg-white px-6">
          <div className="flex h-10 flex-1 items-center gap-2 rounded-xl bg-[#f5f6f8] px-3 text-sm text-black/45 sm:max-w-md">
            <Search className="size-4" /> Search tools, apps, help & more…
          </div>
          <button type="button" aria-label="Notifications" className="rounded-full p-2 hover:bg-black/5">
            <Bell className="size-5" />
          </button>
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#7c3aed] text-xs font-semibold text-white">A</span>
        </header>

        <main className="mx-auto max-w-6xl space-y-6 p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-black/45">AI Integrations</p>
              <h1 className="text-3xl font-bold tracking-tight">Wix in ChatGPT</h1>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => { reset(); try { localStorage.removeItem("wix-chatgpt-connected"); } catch { /* ignore */ } }} className="btn-secondary !px-4 !py-2 !text-sm">
                Reset demo
              </button>
              <Link to={`/chatgpt?prompt=${encodeURIComponent(`Book me a haircut in ${business.city} tomorrow afternoon`)}`} className="btn-primary !px-4 !py-2 !text-sm">
                Open in ChatGPT <ExternalLink className="size-4" />
              </Link>
            </div>
          </div>

          {/* status */}
          <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-3xl border border-black/8 bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn("size-2.5 rounded-full", live ? "bg-emerald-500" : "bg-amber-400")} />
                    <h2 className="text-lg font-bold">{live ? "Live in ChatGPT" : "Not published yet"}</h2>
                  </div>
                  <p className="mt-1 text-sm text-black/60">
                    {live ? `Published ${new Date(state.publishedAt!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}. Last sync 2 minutes ago.` : "Finish setup on the landing page to publish your listing."}
                  </p>
                </div>
                <Switch on={live} onToggle={() => update({ publishedAt: live ? undefined : Date.now() })} label="Listing visibility" />
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  { p: bp, title: "Bookings source", meta: `${SYNCED_SERVICES.length - state.hiddenServiceIds.length} of ${SYNCED_SERVICES.length} services visible` },
                  { p: ep, title: "Events source", meta: `${SYNCED_EVENTS.length - state.hiddenEventIds.length} of ${SYNCED_EVENTS.length} events visible` },
                ].map(({ p, title, meta }) => (
                  <div key={title} className="flex items-center gap-3 rounded-2xl border border-black/8 p-4">
                    <ProviderDot p={p} size={40} className="rounded-xl" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-black/45">{title}</div>
                      <div className="truncate font-semibold">{p.name}</div>
                      <div className="text-xs text-black/55">{meta}</div>
                    </div>
                    <button type="button" aria-label="Sync now" className="rounded-full p-2 hover:bg-black/5">
                      <RefreshCw className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-3xl border border-black/8 bg-white p-5">
                  <div className="text-xs font-semibold text-black/45">{s.label}</div>
                  <div className="mt-2 truncate text-2xl font-bold tracking-tight">{s.value}</div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                    <ArrowUpRight className="size-3" /> {s.delta}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* synced items */}
          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-black/8 bg-white">
              <div className="flex items-center justify-between px-6 py-4">
                <h2 className="font-bold">Services shown in ChatGPT</h2>
                <span className="text-xs text-black/50">from {bp.name}</span>
              </div>
              <ul className="divide-y divide-black/8 border-t border-black/8">
                {SYNCED_SERVICES.map((s) => {
                  const hidden = state.hiddenServiceIds.includes(s.id);
                  return (
                    <li key={s.id} className={cn("flex items-center gap-4 px-6 py-3 text-sm", hidden && "opacity-45")}>
                      <span className="flex-1 font-medium">{s.name}</span>
                      <span className="text-black/55">{s.minutes} min</span>
                      <span className="w-14 text-right tabular-nums">₪{s.price}</span>
                      <Switch on={!hidden} onToggle={() => toggle("hiddenServiceIds", s.id)} label={`Show ${s.name}`} />
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="rounded-3xl border border-black/8 bg-white">
              <div className="flex items-center justify-between px-6 py-4">
                <h2 className="font-bold">Events shown in ChatGPT</h2>
                <span className="text-xs text-black/50">from {ep.name}</span>
              </div>
              <ul className="divide-y divide-black/8 border-t border-black/8">
                {SYNCED_EVENTS.map((e) => {
                  const hidden = state.hiddenEventIds.includes(e.id);
                  return (
                    <li key={e.id} className={cn("flex items-center gap-4 px-6 py-3 text-sm", hidden && "opacity-45")}>
                      <span className="flex-1">
                        <span className="block font-medium">{e.name}</span>
                        <span className="block text-xs text-black/55">
                          {new Date(`${e.date}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {e.time} · {e.tickets}
                        </span>
                      </span>
                      <Switch on={!hidden} onToggle={() => toggle("hiddenEventIds", e.id)} label={`Show ${e.name}`} />
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          {/* recent */}
          <section className="rounded-3xl border border-black/8 bg-white">
            <div className="flex items-center gap-2 px-6 py-4">
              <MessageSquareText className="size-4 text-black/50" />
              <h2 className="font-bold">Recent activity from ChatGPT</h2>
            </div>
            <ul className="divide-y divide-black/8 border-t border-black/8 text-sm">
              {[
                ["Today 14:12", "Booking", "Haircut + beard · Dana · Tomorrow 15:30", "₪120"],
                ["Today 11:40", "Tickets", "Beard care workshop · 2 × seat", "₪120"],
                ["Yesterday", "Booking", "Kids haircut · Any · Fri 10:30", "₪70"],
                ["Yesterday", "RSVP", "Late-night cuts & vinyl · 1 spot", "Free"],
              ].map(([when, kind, what, amount]) => (
                <li key={what} className="grid grid-cols-[110px_90px_1fr_auto] items-center gap-4 px-6 py-3">
                  <span className="text-black/50">{when}</span>
                  <span className="inline-flex w-fit rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium">{kind}</span>
                  <span className="truncate">{what}</span>
                  <span className="tabular-nums">{amount}</span>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
