import { CalendarPlus, Check, MapPin, Navigation, Users } from "lucide-react";
import { useState } from "react";

import { RESTAURANTS } from "../../data/catalog";
import { longDate, nextDays, shortDate, shortDay } from "../../lib/cn";
import { downloadIcs } from "../../lib/ics";
import type { WidgetAction } from "../engine/types";
import { Button, Carousel, CarouselCard, Chip, Field, Frame, Meta, Rating, Stepper, Tag, inputClass } from "./primitives";

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
        <Button color="secondary" variant="outline">
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
