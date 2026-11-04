import { CalendarPlus, Check, Clock, MapPin, Navigation } from "lucide-react";
import { useMemo, useState } from "react";

import { BARBERS, TIME_SLOTS } from "../../data/catalog";
import { cn, formatMoney, longDate, nextDays, shortDate, shortDay } from "../../lib/cn";
import { downloadIcs } from "../../lib/ics";
import type { WidgetAction } from "../engine/types";
import { Button, Carousel, CarouselCard, Chip, CheckRow, Frame, Meta, Rating, Tag } from "./primitives";

export function BarbersCarousel({ ids, onAct }: { ids: string[]; onAct: (a: WidgetAction) => void }) {
  const items = BARBERS.filter((b) => ids.includes(b.id));
  return (
    <Carousel ariaLabel="Barbers near you">
      {items.map((b) => (
        <CarouselCard
          key={b.id}
          image={b.image}
          alt={b.name}
          title={b.name}
          badge={b.id === "orens" ? <Tag tone="success">Top rated</Tag> : undefined}
          lines={[
            <span key="r" className="inline-flex items-center gap-2">
              <Rating value={b.rating} count={b.reviews} />
            </span>,
            `${b.neighborhood} · ${b.distanceKm} km`,
            `Next: ${b.nextSlot}`,
          ]}
          cta="Book"
          onCta={() => onAct({ type: "select-barber", barberId: b.id })}
        />
      ))}
    </Carousel>
  );
}

const unavailable = new Set(["11:30", "14:30", "17:30"]);

export function BarberBookingCard({ barberId, dateISO, preferredTime, onAct, disabled }: { barberId: string; dateISO: string; preferredTime?: string; onAct: (a: WidgetAction) => void; disabled?: boolean }) {
  const b = BARBERS.find((x) => x.id === barberId)!;
  const days = useMemo(() => nextDays(5, new Date(dateISO)), [dateISO]);
  const [date, setDate] = useState(dateISO);
  const [time, setTime] = useState(preferredTime && !unavailable.has(preferredTime) ? preferredTime : "15:30");
  const [staff, setStaff] = useState("Any");
  const [services, setServices] = useState<string[]>([b.services[0].id]);
  const [done, setDone] = useState(false);

  const chosen = b.services.filter((s) => services.includes(s.id));
  const total = chosen.reduce((n, s) => n + s.price, 0);
  const minutes = chosen.reduce((n, s) => n + s.minutes, 0);
  const locked = disabled || done;

  return (
    <Frame>
      <div className="flex gap-3 p-4 pb-3">
        <img src={b.image} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold">{b.name}</h3>
          <Meta icon={<MapPin />}>{b.address}</Meta>
          <div className="mt-0.5 flex items-center gap-2 text-sm">
            <Rating value={b.rating} count={b.reviews} />
            {b.tags.slice(0, 1).map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-subtle p-4">
        <section>
          <h4 className="mb-2 text-xs font-medium text-secondary">Service</h4>
          <div className="space-y-1.5">
            {b.services.map((s) => (
              <CheckRow
                key={s.id}
                checked={services.includes(s.id)}
                onToggle={() => !locked && setServices((prev) => (prev.includes(s.id) ? (prev.length > 1 ? prev.filter((x) => x !== s.id) : prev) : [...prev, s.id]))}
                title={s.name}
                meta={`${s.minutes} min`}
                trailing={formatMoney(s.price, "ILS")}
              />
            ))}
          </div>
        </section>

        <section>
          <h4 className="mb-2 text-xs font-medium text-secondary">Date</h4>
          <div className="scrollbar-none flex gap-2 overflow-x-auto">
            {days.map((d) => {
              const iso = d.toISOString().slice(0, 10);
              return (
                <Chip key={iso} selected={iso === date} disabled={locked} onClick={() => setDate(iso)} className="h-auto shrink-0 flex-col gap-0 px-4 py-1.5 leading-tight">
                  <span className="text-[11px] opacity-70">{shortDay(d)}</span>
                  <span className="text-sm font-medium">{shortDate(d)}</span>
                </Chip>
              );
            })}
          </div>
        </section>

        <section>
          <h4 className="mb-2 text-xs font-medium text-secondary">Time</h4>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {TIME_SLOTS.map((t) => (
              <Chip key={t} selected={t === time} disabled={locked || unavailable.has(t)} onClick={() => setTime(t)} className="px-0">
                {t}
              </Chip>
            ))}
          </div>
        </section>

        <section>
          <h4 className="mb-2 text-xs font-medium text-secondary">With</h4>
          <div className="flex flex-wrap gap-2">
            {["Any", ...b.staff].map((s) => (
              <Chip key={s} selected={s === staff} disabled={locked} onClick={() => setStaff(s)}>
                {s}
              </Chip>
            ))}
          </div>
        </section>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-subtle bg-surface-secondary px-4 py-3">
        <div className="text-sm">
          <div className="font-semibold">{formatMoney(total, "ILS")}</div>
          <div className="text-xs text-secondary">
            {minutes} min · {shortDate(new Date(date))} at {time}
          </div>
        </div>
        <div className="flex gap-2">
          <Button color="secondary" variant="outline" disabled={locked} onClick={() => window.open(`tel:+97235550123`)}>
            Call shop
          </Button>
          <Button
            color="primary"
            disabled={locked}
            onClick={() => {
              setDone(true);
              onAct({ type: "confirm-booking", barberId: b.id, serviceIds: services, dateISO: date, time, staff });
            }}
          >
            {done ? "Booked" : "Confirm booking"}
          </Button>
        </div>
      </div>
    </Frame>
  );
}

export function BookingConfirmedCard({ barberId, serviceIds, dateISO, time, staff, total }: { barberId: string; serviceIds: string[]; dateISO: string; time: string; staff: string; total: number }) {
  const b = BARBERS.find((x) => x.id === barberId)!;
  const services = b.services.filter((s) => serviceIds.includes(s.id));
  const minutes = services.reduce((n, s) => n + s.minutes, 0);
  return (
    <Frame className="max-w-[520px]">
      <div className="flex items-start gap-3 p-4">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
          <Check className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold">Booked at {b.name}</h3>
          <p className="text-sm text-secondary">
            {longDate(new Date(dateISO))} · {time}
          </p>
        </div>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t border-subtle px-4 py-3 text-sm">
        <dt className="text-secondary">Service</dt>
        <dd className="text-right">{services.map((s) => s.name).join(", ")}</dd>
        <dt className="text-secondary">With</dt>
        <dd className="text-right">{staff === "Any" ? "First available" : staff}</dd>
        <dt className="flex items-center gap-1 text-secondary">
          <Clock className="size-3.5" /> Duration
        </dt>
        <dd className="text-right">{minutes} min</dd>
        <dt className="text-secondary">Total</dt>
        <dd className="text-right font-medium">
          {formatMoney(total, "ILS")} <span className="font-normal text-tertiary">· pay at shop</span>
        </dd>
        <dt className="text-secondary">Where</dt>
        <dd className="text-right">{b.address}</dd>
      </dl>
      <div className="grid grid-cols-2 gap-2 border-t border-subtle p-3">
        <Button color="primary" block onClick={() => downloadIcs({ title: `${services[0]?.name ?? "Haircut"} at ${b.name}`, dateISO, time, minutes, location: b.address, description: `Booked through Wix in ChatGPT. With: ${staff}` })}>
          <CalendarPlus className="size-4" /> Add to calendar
        </Button>
        <Button color="secondary" variant="outline" block onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(b.address)}`, "_blank")}>
          <Navigation className="size-4" /> Directions
        </Button>
      </div>
    </Frame>
  );
}
