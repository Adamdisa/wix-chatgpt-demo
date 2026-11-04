import { CalendarPlus, Check, Clock, MapPin, Navigation, Users, X } from "lucide-react";
import { useState } from "react";

import { MENUS, RESTAURANTS } from "../../data/catalog";
import { longDate, nextDays, shortDate, shortDay } from "../../lib/cn";
import { downloadIcs } from "../../lib/ics";
import type { WidgetAction } from "../engine/types";
import { WixMark } from "../WixMark";
import { Button, Carousel, CarouselCard, Chip, Field, Frame, Meta, Rating, Stepper, Tag, inputClass } from "./primitives";
import { cn, formatMoney } from "../../lib/cn";

const DINNER_SLOTS = ["18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"];
const full = new Set(["20:00", "20:30"]);

export function RestaurantsCarousel({ ids, onAct }: { ids: string[]; onAct: (a: WidgetAction) => void }) {
  const items = RESTAURANTS.filter((r) => ids.includes(r.id));
  return (
    <Carousel ariaLabel="Restaurants near you">
      {items.map((r) => (
        <CarouselCard
          key={r.id}
          image={r.image}
          alt={r.name}
          title={r.name}
          badge={r.tags[0] ? <Tag>{r.tags[0]}</Tag> : undefined}
          lines={[
            <span key="r" className="inline-flex items-center gap-2">
              <Rating value={r.rating} count={r.reviews} />
              <span>· {r.price}</span>
            </span>,
            `${r.cuisine} · ${r.neighborhood} · ${r.distanceKm} km`,
            `Next table ${r.nextTable}`,
          ]}
          cta="Reserve"
          onCta={() => onAct({ type: "select-restaurant", restaurantId: r.id })}
        />
      ))}
    </Carousel>
  );
}

export function ReserveCard({ restaurantId, dateISO, party: initialParty, onAct, disabled }: { restaurantId: string; dateISO: string; party: number; onAct: (a: WidgetAction) => void; disabled?: boolean }) {
  const r = RESTAURANTS.find((x) => x.id === restaurantId)!;
  const days = nextDays(4, new Date(dateISO));
  const [date, setDate] = useState(dateISO);
  const [time, setTime] = useState(r.nextTable);
  const [party, setParty] = useState(initialParty);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const locked = disabled || done;

  return (
    <Frame className="max-w-[560px]">
      <div className="flex gap-3 p-4">
        <img src={r.image} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold">{r.name}</h3>
          <Meta icon={<MapPin />}>
            {r.cuisine} · {r.neighborhood}
          </Meta>
          <div className="mt-0.5">
            <Rating value={r.rating} count={r.reviews} />
          </div>
        </div>
      </div>
      <div className="space-y-4 border-t border-subtle p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <Users className="size-4" /> Party size
          </span>
          <Stepper value={party} min={1} max={12} onChange={setParty} label="Party size" />
        </div>
        <section>
          <h4 className="mb-2 text-xs font-medium text-secondary">Date</h4>
          <div className="flex gap-2">
            {days.map((d, i) => {
              const iso = d.toISOString().slice(0, 10);
              return (
                <Chip key={iso} selected={iso === date} disabled={locked} onClick={() => setDate(iso)}>
                  {i === 0 ? "Tonight" : i === 1 ? "Tomorrow" : `${shortDay(d)} ${shortDate(d)}`}
                </Chip>
              );
            })}
          </div>
        </section>
        <section>
          <h4 className="mb-2 text-xs font-medium text-secondary">Time</h4>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {DINNER_SLOTS.map((t) => (
              <Chip key={t} selected={t === time} disabled={locked || full.has(t)} onClick={() => setTime(t)} className="px-0">
                {t}
              </Chip>
            ))}
          </div>
        </section>
        <Field label="Special requests (optional)">
          <input className={inputClass} disabled={locked} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Outdoor table, high chair…" />
        </Field>
      </div>
      <div className="flex gap-2 border-t border-subtle p-3">
        <Button color="secondary" variant="outline" onClick={() => onAct({ type: "view-menu", restaurantId: r.id })}>
          View menu
        </Button>
        <Button
          color="primary"
          className="min-w-0 flex-1"
          disabled={locked}
          onClick={() => {
            setDone(true);
            onAct({ type: "confirm-reservation", restaurantId: r.id, dateISO: date, time, party });
          }}
        >
          {done ? "Reserved" : `Reserve for ${party} at ${time}`}
        </Button>
      </div>
    </Frame>
  );
}

export function ReservationConfirmedCard({ restaurantId, dateISO, time, party }: { restaurantId: string; dateISO: string; time: string; party: number }) {
  const r = RESTAURANTS.find((x) => x.id === restaurantId)!;
  return (
    <Frame className="max-w-[520px]">
      <div className="flex items-start gap-3 p-4">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
          <Check className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold">Table reserved at {r.name}</h3>
          <p className="text-sm text-secondary">
            {longDate(new Date(dateISO))} · {time} · {party} {party === 1 ? "guest" : "guests"}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-subtle p-3">
        <Button color="primary" block onClick={() => downloadIcs({ title: `Dinner at ${r.name}`, dateISO, time, minutes: 90, location: `${r.name}, ${r.neighborhood}`, description: `Table for ${party}. Reserved through Wix in ChatGPT.` })}>
          <CalendarPlus className="size-4" /> Add to calendar
        </Button>
        <Button color="secondary" variant="outline" block onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(`${r.name} ${r.neighborhood} Tel Aviv`)}`, "_blank")}>
          <Navigation className="size-4" /> Directions
        </Button>
      </div>
    </Frame>
  );
}

/**
 * Menu in ChatGPT's fullscreen display mode. Widgets can't embed third-party sites in an iframe
 * (the widget CSP only allows whitelisted asset domains), so the menu is rendered from data Wix
 * already has, the way the event ticket picker is. The system composer and chat snippet stay visible.
 */
export function MenuFullscreen({ restaurantId, onClose, lastAssistantText }: { restaurantId: string; onClose: () => void; lastAssistantText?: string }) {
  const r = RESTAURANTS.find((x) => x.id === restaurantId)!;
  const sections = MENUS[r.id] ?? MENUS.delfina;
  const [active, setActive] = useState(sections[0].title);

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-surface">
      <header className="flex h-14 items-center gap-3 border-b border-subtle px-4">
        <WixMark size={24} />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">Wix</div>
          <div className="truncate text-xs text-secondary">{r.name} · Menu</div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="inline-flex size-9 items-center justify-center rounded-full hover:bg-surface-secondary">
          <X className="size-5" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl p-4 md:p-8">
          <div className="flex gap-4">
            <img src={r.image} alt="" className="size-20 shrink-0 rounded-2xl object-cover md:size-24" />
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight">{r.name}</h1>
              <p className="mt-0.5 text-sm text-secondary">
                {r.cuisine} · {r.neighborhood} · {r.price}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <Rating value={r.rating} count={r.reviews} />
                <Meta icon={<Clock />}>Open until 23:30</Meta>
              </div>
            </div>
          </div>

          <div className="scrollbar-none sticky top-0 z-10 -mx-4 mt-6 flex gap-2 overflow-x-auto bg-surface px-4 py-2 md:-mx-8 md:px-8">
            {sections.map((sec) => (
              <Chip
                key={sec.title}
                selected={sec.title === active}
                onClick={() => {
                  setActive(sec.title);
                  document.getElementById(`menu-${sec.title}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="shrink-0"
              >
                {sec.title}
              </Chip>
            ))}
          </div>

          <div className="mt-2 space-y-8">
            {sections.map((sec) => (
              <section key={sec.title} id={`menu-${sec.title}`} className="scroll-mt-16">
                <h2 className="mb-3 text-lg font-semibold">{sec.title}</h2>
                <ul className="divide-y divide-[color:var(--color-border-subtle)] rounded-2xl border border-default">
                  {sec.items.map((it) => (
                    <li key={it.name} className="flex items-start gap-4 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{it.name}</span>
                          {it.tag ? <Tag tone={it.tag === "Popular" ? "success" : it.tag === "Spicy" ? "warning" : "neutral"}>{it.tag}</Tag> : null}
                        </div>
                        <p className="mt-0.5 text-sm text-secondary">{it.desc}</p>
                      </div>
                      <span className={cn("shrink-0 text-sm tabular-nums")}>{formatMoney(it.price, "ILS")}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          <p className="mt-6 text-xs text-tertiary">Menu synced from Wix Restaurants. Prices include VAT; a 12% service charge is added to the bill.</p>
        </div>
      </div>

      <footer className="border-t border-subtle bg-surface px-4 py-3">
        <div className="mx-auto flex max-w-3xl flex-col gap-2">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-secondary px-3 py-2 text-sm">
            <span className="min-w-0 truncate text-secondary">{lastAssistantText ?? `Next table at ${r.name}: ${r.nextTable}`}</span>
            <Button color="primary" size="sm" onClick={onClose}>
              Back to reservation
            </Button>
          </div>
          <div className="flex h-12 items-center rounded-full border border-default bg-surface px-4 text-sm text-tertiary">Ask anything about the menu…</div>
        </div>
      </footer>
    </div>
  );
}
