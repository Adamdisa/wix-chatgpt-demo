import { ArrowRight, Calendar, Check, ChevronDown, Globe, Link2, MessageSquareText, Sparkles, Ticket, Zap } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { BOOKING_PROVIDERS, EVENT_PROVIDERS, type Provider } from "../data/catalog";
import { WixLogo } from "../chatgpt/WixMark";
import { cn } from "../lib/cn";
import { ChatPreview } from "./ChatPreview";

export function ProviderDot({ p, size = 36, className }: { p: Provider; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white", className)} style={{ width: size, height: size, background: p.color }} aria-hidden>
      {p.initials}
    </span>
  );
}

export function Header({ onStart }: { onStart: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2">
          <WixLogo className="h-6 w-auto" />
          <span className="hidden text-sm font-medium text-black/50 sm:inline">for ChatGPT</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-black/70 md:flex">
          <a href="#how" className="hover:text-black">How it works</a>
          <a href="#integrations" className="hover:text-black">Integrations</a>
          <a href="#faq" className="hover:text-black">FAQ</a>
          <Link to="/chatgpt" data-tour="live-demo" className="hover:text-black">Live demo</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="hidden text-sm font-medium text-black/70 hover:text-black sm:inline">Log in</Link>
          <button type="button" onClick={onStart} className="btn-primary !px-5 !py-2.5 !text-sm">
            Get listed free
          </button>
        </div>
      </div>
    </header>
  );
}

export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] bg-[radial-gradient(60%_60%_at_70%_10%,rgba(17,109,255,0.10),transparent_70%)]" />
      <div className="mx-auto grid max-w-7xl items-start gap-12 px-5 pt-16 pb-20 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:pt-24">
        <div className="min-w-0 lg:mt-16">
          <p className="eyebrow mb-5">Wix × ChatGPT</p>
          <h1 className="display text-5xl leading-[1.02] font-extrabold tracking-tight text-wix-ink sm:text-6xl lg:text-[68px]">
            Get booked <span className="text-wix">in ChatGPT.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-black/65">
            People already ask ChatGPT for a barber, a table, something to do this weekend. List your services and events once with Wix and show up with live availability and one-tap booking. Keep the tools you use today. No website required.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button type="button" onClick={onStart} data-tour="get-listed" className="btn-primary">
              Get listed free <ArrowRight className="size-4" />
            </button>
            <Link to="/chatgpt" data-tour="try-demo" className="btn-secondary">
              Try the ChatGPT demo
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-black/60">
            {["About 3 minutes to set up", "Syncs with 17 booking & events tools", "Free while in beta"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check className="size-4 text-wix" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="float-y min-w-0 lg:pl-6">
          <ChatPreview />
        </div>
      </div>
    </section>
  );
}

export function LogoStrip() {
  const names = [...BOOKING_PROVIDERS, ...EVENT_PROVIDERS].filter((p) => !p.native);
  return (
    <section className="border-y border-black/5 bg-[#fafafa]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <p className="eyebrow mb-5 text-center">Syncs with the tools you already use</p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {names.map((p) => (
            <span key={p.id} className="inline-flex items-center gap-2 text-sm font-semibold text-black/55">
              <ProviderDot p={p} size={22} className="rounded-md text-[10px]" />
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks({ onStart }: { onStart: () => void }) {
  const steps = [
    { n: "01", icon: Sparkles, title: "Tell Wix about your business", body: "Name, category, city and a line about what you do. We draft the rest with AI and you edit." },
    { n: "02", icon: Link2, title: "Connect bookings and events", body: "Pick your scheduling tool and your ticketing or events tool. OAuth once, then everything syncs: services, prices, availability, upcoming events." },
    { n: "03", icon: MessageSquareText, title: "Show up in ChatGPT", body: "When someone nearby asks for what you offer, ChatGPT answers with your live slots or tickets and books through Wix. You get the booking where you already manage it." },
  ];
  return (
    <section id="how" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="max-w-2xl">
        <p className="eyebrow mb-4">How it works</p>
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Three steps. Keep your tools.</h2>
      </div>
      <ol className="mt-14 grid gap-6 md:grid-cols-3">
        {steps.map(({ n, icon: Icon, title, body }) => (
          <li key={n} className="rounded-3xl border border-black/8 bg-white p-7">
            <div className="flex items-center justify-between">
              <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-wix/10 text-wix">
                <Icon className="size-5" />
              </span>
              <span className="display text-sm font-bold text-black/30">{n}</span>
            </div>
            <h3 className="mt-6 text-xl font-bold">{title}</h3>
            <p className="mt-2 leading-7 text-black/65">{body}</p>
          </li>
        ))}
      </ol>
      <div className="mt-10">
        <button type="button" onClick={onStart} className="btn-primary">
          Start setup <ArrowRight className="size-4" />
        </button>
      </div>
    </section>
  );
}

export function ListingTypes() {
  const [tab, setTab] = useState<"barber" | "events">("barber");
  return (
    <section className="bg-wix-ink text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2">
        <div className="min-w-0">
          <p className="eyebrow mb-4 !text-white/50">Two kinds of listings</p>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Bookings and events, side by side.</h2>
          <p className="mt-5 max-w-lg text-lg leading-8 text-white/70">Appointments and classes come from your scheduling tool. Shows, workshops and markets come from your events tool. ChatGPT shows whichever fits the question.</p>
          <div className="mt-8 grid gap-3">
            {[
              { id: "barber" as const, icon: Calendar, title: "Bookings", body: "Services, staff, durations and live slots. ChatGPT books straight into your calendar." },
              { id: "events" as const, icon: Ticket, title: "Events", body: "Dates, venues, ticket tiers and remaining seats. ChatGPT sells tickets or takes RSVPs, synced back to your events platform." },
            ].map(({ id, icon: Icon, title, body }) => (
              <button key={id} type="button" onClick={() => setTab(id)} className={cn("flex items-start gap-4 rounded-2xl border p-5 text-left transition", tab === id ? "border-white/40 bg-white/10" : "border-white/10 hover:border-white/25")}>
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="block text-lg font-semibold">{title}</span>
                  <span className="mt-1 block text-sm leading-6 text-white/65">{body}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="min-w-0"><ChatPreview scene={tab} autoplay={false} compact /></div>
      </div>
    </section>
  );
}

export function Benefits() {
  const items = [
    { icon: Globe, title: "No website required", body: "A Wix account and your existing tools are enough. Add a site later if you want one." },
    { icon: Zap, title: "Live, not a directory", body: "ChatGPT reads your real availability and remaining tickets at the moment someone asks." },
    { icon: Check, title: "You stay in control", body: "Choose which services and events are visible. Pause the listing any time from your Wix dashboard." },
    { icon: MessageSquareText, title: "Bookings land where you work", body: "Every booking or ticket sale is written back to the tool it came from. No double entry." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-3xl bg-[#f6f6f6] p-7">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-white text-wix-ink shadow-sm">
              <Icon className="size-5" />
            </span>
            <h3 className="mt-5 text-lg font-bold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-black/65">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Integrations({ onStart }: { onStart: () => void }) {
  const Group = ({ title, body, items }: { title: string; body: string; items: Provider[] }) => (
    <div className="rounded-3xl border border-black/8 p-7">
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-1 text-sm text-black/60">{body}</p>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((p) => (
          <li key={p.id} className="flex items-center gap-3 rounded-2xl border border-black/8 px-3 py-2.5">
            <ProviderDot p={p} size={30} className="rounded-lg text-xs" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{p.name}</span>
              {p.native ? <span className="block text-[11px] text-wix">Built in</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <section id="integrations" className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
      <div className="max-w-2xl">
        <p className="eyebrow mb-4">Integrations</p>
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Connect what you already use.</h2>
        <p className="mt-4 text-lg leading-8 text-black/65">One OAuth connection per tool. Wix keeps services, availability, events and tickets in sync and writes bookings back.</p>
      </div>
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Group title="Bookings & scheduling" body="Services, staff, durations, prices and live availability." items={BOOKING_PROVIDERS} />
        <Group title="Events & ticketing" body="Upcoming events, ticket tiers, remaining capacity and RSVPs." items={EVENT_PROVIDERS} />
      </div>
      <p className="mt-6 text-sm text-black/50">
        Missing your tool?{" "}
        <button type="button" onClick={onStart} className="font-semibold text-wix hover:underline">
          Use Wix Bookings and Wix Events
        </button>{" "}
        instead, included with your account.
      </p>
    </section>
  );
}

export function FAQ() {
  const qs = [
    { q: "Do I need a Wix website?", a: "No. You need a free Wix account so there's a place to manage your listing, but the listing itself lives in ChatGPT. You can add a site later." },
    { q: "How does ChatGPT decide when to show me?", a: "ChatGPT uses the Wix app when a request matches what you offer and where you are, for example 'haircut near Florentin tomorrow' or 'jazz in Tel Aviv this weekend'. People can also call the app directly with @Wix." },
    { q: "What happens when someone books?", a: "ChatGPT confirms the details with the customer, then Wix writes the booking or ticket order to your connected tool. You get the same notification you'd get for any other booking." },
    { q: "Does it cost anything?", a: "Listing is free during the beta. Payments for tickets run through your connected events platform or Wix Payments with their normal fees." },
    { q: "Can I hide some services or events?", a: "Yes. Every synced item has a visibility toggle in your Wix dashboard, and changes reach ChatGPT within a few minutes." },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 pb-24 sm:px-8">
      <h2 className="text-4xl font-bold tracking-tight">Questions</h2>
      <ul className="mt-8 divide-y divide-black/8 border-y border-black/8">
        {qs.map((item, i) => (
          <li key={item.q}>
            <button type="button" onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 py-5 text-left text-lg font-semibold">
              {item.q}
              <ChevronDown className={cn("size-5 shrink-0 transition", open === i && "rotate-180")} />
            </button>
            {open === i && <p className="pb-5 leading-7 text-black/65">{item.a}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function FinalCta({ onStart }: { onStart: () => void }) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
      <div className="relative overflow-hidden rounded-[32px] bg-wix px-8 py-16 text-white sm:px-16">
        <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-white/10" />
        <h2 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">Be the answer the next time someone asks.</h2>
        <p className="mt-4 max-w-xl text-lg text-white/80">Set up takes about three minutes. Your first listing can be live in ChatGPT today.</p>
        <button type="button" onClick={onStart} className="btn-secondary mt-8 !border-transparent">
          Get listed free <ArrowRight className="size-4" />
        </button>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-black/8">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-10 text-sm text-black/55 sm:flex-row sm:items-center sm:px-8">
        <div className="flex items-center gap-3">
          <WixLogo className="h-5 w-auto text-wix-ink" />
          <span>© {new Date().getFullYear()} Wix.com Ltd. Concept demo, not a live product.</span>
        </div>
        <div className="flex gap-6">
          <a href="#how" className="hover:text-black">How it works</a>
          <a href="#integrations" className="hover:text-black">Integrations</a>
          <Link to="/chatgpt" className="hover:text-black">Demo</Link>
          <Link to="/dashboard" className="hover:text-black">Dashboard</Link>
        </div>
      </div>
    </footer>
  );
}
