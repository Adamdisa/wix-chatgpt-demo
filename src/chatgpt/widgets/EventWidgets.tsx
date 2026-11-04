import { CalendarPlus, Check, Clock, CreditCard, Mail, MapPin, Maximize2, Ticket, Wallet, X } from "lucide-react";
import { useState } from "react";

import { EVENTS } from "../../data/catalog";
import { cn, formatMoney, longDate, shortDate } from "../../lib/cn";
import { downloadIcs } from "../../lib/ics";
import type { WidgetAction } from "../engine/types";
import { WixMark } from "../WixMark";
import { FakeQr } from "./FakeQr";
import { Button, Carousel, CarouselCard, Chip, Frame, Meta, Stepper, Tag } from "./primitives";

const dateLabel = (iso: string) => {
  const d = new Date(`${iso}T12:00:00`);
  return `${d.toLocaleDateString("en-US", { weekday: "short" })}, ${shortDate(d)}`;
};

export function EventsCarousel({ ids, onAct }: { ids: string[]; onAct: (a: WidgetAction) => void }) {
  const items = EVENTS.filter((e) => ids.includes(e.id)).slice(0, 8);
  return (
    <Carousel ariaLabel="Events in Tel Aviv">
      {items.map((e) => {
        const scarce = e.tiers.some((t) => t.left > 0 && t.left < 20);
        return (
          <CarouselCard
            key={e.id}
            image={e.image}
            alt={e.title}
            title={e.title}
            badge={scarce ? <Tag tone="warning">Few left</Tag> : e.fromPrice === 0 ? <Tag tone="success">Free</Tag> : undefined}
            lines={[`${dateLabel(e.date)} · ${e.time}`, e.venue, e.fromPrice === 0 ? "Free entry" : `From ${formatMoney(e.fromPrice, e.currency)}`]}
            cta="Tickets"
            onCta={() => onAct({ type: "select-event", eventId: e.id })}
          />
        );
      })}
    </Carousel>
  );
}

/** Compact inline card with an Expand control; the rich picker lives in fullscreen. */
export function EventDetailCard({ eventId, onAct }: { eventId: string; onAct: (a: WidgetAction) => void }) {
  const e = EVENTS.find((x) => x.id === eventId)!;
  return (
    <Frame className="max-w-[520px]">
      <div className="flex gap-3 p-4">
        <img src={e.image} alt="" className="size-20 shrink-0 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 text-base font-semibold">{e.title}</h3>
          <Meta icon={<Clock />}>
            {longDate(new Date(`${e.date}T12:00:00`))} · {e.time}
          </Meta>
          <Meta icon={<MapPin />}>{e.venue}</Meta>
          <div className="mt-1 text-sm">
            {e.fromPrice === 0 ? "Free entry" : `From ${formatMoney(e.fromPrice, e.currency)}`} <span className="text-tertiary">· {e.tiers.length} ticket types</span>
          </div>
        </div>
        <button type="button" onClick={() => onAct({ type: "open-fullscreen", eventId: e.id })} aria-label="Expand" className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-secondary hover:bg-surface-secondary">
          <Maximize2 className="size-4" />
        </button>
      </div>
      <div className="flex gap-2 border-t border-subtle p-3">
        <Button color="primary" block onClick={() => onAct({ type: "open-fullscreen", eventId: e.id })}>
          <Ticket className="size-4" /> Choose tickets
        </Button>
      </div>
    </Frame>
  );
}

/** Fullscreen display mode: event detail with tiers, sections and quantity. */
export function EventFullscreen({ eventId, onAct, onClose, lastAssistantText }: { eventId: string; onAct: (a: WidgetAction) => void; onClose: () => void; lastAssistantText?: string }) {
  const e = EVENTS.find((x) => x.id === eventId)!;
  const [tierId, setTierId] = useState(e.tiers.find((t) => t.left > 0)!.id);
  const [section, setSection] = useState(e.sections?.[0]);
  const [qty, setQty] = useState(2);
  const tier = e.tiers.find((t) => t.id === tierId)!;
  const total = tier.price * qty;

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-surface">
      <header className="flex h-14 items-center gap-3 border-b border-subtle px-4">
        <WixMark size={24} />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">Wix</div>
          <div className="truncate text-xs text-secondary">{e.title}</div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="inline-flex size-9 items-center justify-center rounded-full hover:bg-surface-secondary">
          <X className="size-5" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid max-w-5xl gap-8 p-4 md:grid-cols-[1.1fr_0.9fr] md:p-8">
          <section>
            <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl bg-surface-tertiary">
              <img src={e.image} alt={e.title} className="size-full object-cover" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight">{e.title}</h1>
            <p className="mt-1 text-sm text-secondary">
              {e.organizer} · listed on Wix, synced from {e.source}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-default p-3">
                <Meta icon={<Clock />}>When</Meta>
                <div className="mt-1 text-sm font-medium">
                  {longDate(new Date(`${e.date}T12:00:00`))}, {e.time}
                </div>
              </div>
              <div className="rounded-xl border border-default p-3">
                <Meta icon={<MapPin />}>Where</Meta>
                <div className="mt-1 text-sm font-medium">{e.venue}</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6">{e.blurb}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {e.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </section>

          <aside className="md:sticky md:top-0 md:self-start">
            <div className="rounded-2xl border border-default p-4">
              <h2 className="text-sm font-semibold">Tickets</h2>
              <div className="mt-3 space-y-2" role="radiogroup" aria-label="Ticket type">
                {e.tiers.map((t) => {
                  const selected = t.id === tierId;
                  const soldOut = t.left === 0;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={soldOut}
                      onClick={() => setTierId(t.id)}
                      className={cn("flex w-full items-center gap-3 rounded-xl border p-3 text-left transition disabled:opacity-40", selected ? "border-strong bg-surface-secondary" : "border-default hover:bg-surface-secondary")}
                    >
                      <span className={cn("inline-flex size-4 shrink-0 items-center justify-center rounded-full border", selected ? "border-[5px] border-[color:var(--color-text)]" : "border-strong")} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{t.name}</span>
                        <span className="block text-xs text-secondary">{t.perks ?? (t.left < 20 ? `${t.left} left` : "Available")}</span>
                      </span>
                      <span className="text-sm font-medium tabular-nums">{t.price === 0 ? "Free" : formatMoney(t.price, e.currency)}</span>
                    </button>
                  );
                })}
              </div>

              {e.sections && (
                <div className="mt-4">
                  <h3 className="mb-2 text-xs font-medium text-secondary">Section</h3>
                  <div className="flex flex-wrap gap-2">
                    {e.sections.map((s) => (
                      <Chip key={s} selected={s === section} onClick={() => setSection(s)}>
                        {s}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium">Quantity</span>
                <Stepper value={qty} min={1} max={Math.min(8, Math.max(tier.left, 1))} onChange={setQty} label="Quantity" />
              </div>

              <div className="mt-4 flex items-end justify-between border-t border-subtle pt-3">
                <div>
                  <div className="text-xs text-secondary">
                    {qty} × {tier.name}
                  </div>
                  <div className="text-xl font-semibold">{total === 0 ? "Free" : formatMoney(total, e.currency)}</div>
                </div>
                <Button color="primary" size="lg" onClick={() => onAct({ type: "checkout", eventId: e.id, tierId, qty, section })}>
                  Continue to checkout
                </Button>
              </div>
            </div>
            <p className="mt-2 px-1 text-xs text-tertiary">Tickets are held for 10 minutes once you continue. Resale and refunds follow the organizer's policy.</p>
          </aside>
        </div>
      </div>

      {/* Chat sheet snippet + system composer stay visible in fullscreen. */}
      <footer className="border-t border-subtle bg-surface px-4 py-3">
        <div className="mx-auto max-w-3xl">
          {lastAssistantText ? (
            <button type="button" onClick={onClose} className="mb-2 flex w-full items-center gap-2 rounded-xl bg-surface-secondary px-3 py-2 text-left text-sm text-secondary hover:bg-surface-tertiary">
              <span className="size-2 shrink-0 rounded-full bg-[color:var(--color-text)]" />
              <span className="truncate">{lastAssistantText}</span>
            </button>
          ) : null}
          <div className="flex h-12 items-center rounded-full border border-default bg-surface px-4 text-sm text-tertiary">Ask anything about this event…</div>
        </div>
      </footer>
    </div>
  );
}

export function CheckoutCard({ eventId, tierId, qty, section, onAct, disabled }: { eventId: string; tierId: string; qty: number; section?: string; onAct: (a: WidgetAction) => void; disabled?: boolean }) {
  const e = EVENTS.find((x) => x.id === eventId)!;
  const tier = e.tiers.find((t) => t.id === tierId)!;
  const [method, setMethod] = useState<"Apple Pay" | "Visa •••• 4242">("Apple Pay");
  const [paid, setPaid] = useState(false);
  const subtotal = tier.price * qty;
  const fee = Math.round(subtotal * 0.05);
  const total = subtotal + fee;
  const locked = disabled || paid;

  return (
    <Frame className="max-w-[520px]">
      <div className="flex gap-3 p-4">
        <img src={e.image} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 text-base font-semibold">{e.title}</h3>
          <p className="text-sm text-secondary">
            {dateLabel(e.date)} · {e.time} · {e.venue}
          </p>
          <p className="mt-0.5 text-sm">
            {qty} × {tier.name}
            {section && section !== tier.name ? ` · ${section}` : ""}
          </p>
        </div>
      </div>
      <dl className="grid grid-cols-[1fr_auto] gap-y-1.5 border-t border-subtle px-4 py-3 text-sm">
        <dt className="text-secondary">Tickets</dt>
        <dd className="tabular-nums">{formatMoney(subtotal, e.currency)}</dd>
        <dt className="text-secondary">Service fee</dt>
        <dd className="tabular-nums">{formatMoney(fee, e.currency)}</dd>
        <dt className="font-semibold">Total</dt>
        <dd className="font-semibold tabular-nums">{formatMoney(total, e.currency)}</dd>
      </dl>
      <div className="space-y-3 border-t border-subtle px-4 py-3">
        <Meta icon={<Mail />}>Mobile tickets to adam@example.com</Meta>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Payment method">
          {(["Apple Pay", "Visa •••• 4242"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={method === m}
              disabled={locked}
              onClick={() => setMethod(m)}
              className={cn("flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition", method === m ? "border-strong bg-surface-secondary" : "border-default hover:bg-surface-secondary")}
            >
              {m === "Apple Pay" ? <Wallet className="size-4" /> : <CreditCard className="size-4" />}
              {m}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 border-t border-subtle p-3">
        <Button color="secondary" variant="outline" disabled={locked} onClick={() => onAct({ type: "open-fullscreen", eventId: e.id })}>
          Edit
        </Button>
        <Button
          color="primary"
          className="min-w-0 flex-1"
          disabled={locked}
          onClick={() => {
            setPaid(true);
            onAct({ type: "pay", eventId: e.id, tierId, qty, section, method });
          }}
        >
          {paid ? "Paid" : `Pay ${formatMoney(total, e.currency)} with ${method === "Apple Pay" ? "Apple Pay" : "card"}`}
        </Button>
      </div>
    </Frame>
  );
}

export function TicketsCard({ eventId, tierId, qty, orderId, section }: { eventId: string; tierId: string; qty: number; orderId: string; section?: string }) {
  const e = EVENTS.find((x) => x.id === eventId)!;
  const tier = e.tiers.find((t) => t.id === tierId)!;
  return (
    <Frame className="max-w-[560px]">
      <div className="flex items-start gap-3 p-4">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
          <Check className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold">You're going to {e.title}</h3>
          <p className="text-sm text-secondary">
            Order {orderId} · {qty} × {tier.name}
            {section && section !== tier.name ? ` · ${section}` : ""}
          </p>
        </div>
      </div>
      <div className="scrollbar-none flex gap-3 overflow-x-auto border-t border-subtle px-4 py-3">
        {Array.from({ length: qty }, (_, i) => (
          <div key={i} className="flex w-[200px] shrink-0 items-center gap-3 rounded-xl border border-default p-3">
            <FakeQr seed={`${orderId}-${i}`} size={72} />
            <div className="min-w-0 text-xs">
              <div className="font-medium">Ticket {i + 1}</div>
              <div className="text-secondary">{tier.name}</div>
              <div className="text-secondary">
                {dateLabel(e.date)} · {e.time}
              </div>
              <div className="truncate text-secondary">{e.venue}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-subtle p-3">
        <Button color="primary" block onClick={() => downloadIcs({ title: e.title, dateISO: e.date, time: e.time, minutes: 150, location: e.venue, description: `Order ${orderId} · ${qty} × ${tier.name}. Bought through Wix in ChatGPT.` })}>
          <CalendarPlus className="size-4" /> Add to calendar
        </Button>
        <Button color="secondary" variant="outline" block>
          <Wallet className="size-4" /> Add to Wallet
        </Button>
      </div>
    </Frame>
  );
}
