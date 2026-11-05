import { Check, Copy, RefreshCw, ThumbsDown, ThumbsUp, Volume2 } from "lucide-react";
import { useEffect, useRef } from "react";

import { cn } from "../lib/cn";
import type { Message, Widget, WidgetAction } from "./engine/types";
import { BarberBookingCard, BarbersCarousel, BookingConfirmedCard } from "./widgets/BarberWidgets";
import { ConnectCard } from "./widgets/ConnectCard";
import { CheckoutCard, EventDetailCard, EventsCarousel, TicketsCard } from "./widgets/EventWidgets";
import { ReservationConfirmedCard, ReserveCard, RestaurantsCarousel } from "./widgets/RestaurantWidgets";
import { SuggestionChips } from "./widgets/SuggestionChips";
import { WixMark } from "./WixMark";

function WidgetHost({ widget, onAct, isLatest }: { widget: Widget; onAct: (a: WidgetAction) => void; isLatest: boolean }) {
  switch (widget.kind) {
    case "connect":
      return <ConnectCard reason={widget.reason} onAct={onAct} />;
    case "barbers":
      return <BarbersCarousel ids={widget.ids} onAct={onAct} />;
    case "barber-booking":
      return <BarberBookingCard {...widget} onAct={onAct} disabled={!isLatest} />;
    case "booking-confirmed":
      return <BookingConfirmedCard {...widget} />;
    case "events":
      return <EventsCarousel ids={widget.ids} onAct={onAct} />;
    case "event-detail":
      return <EventDetailCard eventId={widget.eventId} onAct={onAct} />;
    case "checkout":
      return <CheckoutCard {...widget} onAct={onAct} disabled={!isLatest} />;
    case "tickets":
      return <TicketsCard {...widget} />;
    case "restaurants":
      return <RestaurantsCarousel ids={widget.ids} onAct={onAct} />;
    case "reserve":
      return <ReserveCard {...widget} onAct={onAct} disabled={!isLatest} />;
    case "reservation-confirmed":
      return <ReservationConfirmedCard {...widget} />;
    case "suggestions":
      return <SuggestionChips chips={widget.chips} onPick={(text) => onAct({ type: "chip", text })} />;
  }
}

function ToolStatusLine({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2 py-1 text-sm">
      <WixMark size={18} className={cn(!done && "animate-pulse")} />
      {done ? (
        <span className="flex items-center gap-1.5 text-secondary">
          {label.replace(/^(Searching|Checking|Getting|Preparing|Booking|Reserving|Completing)/, (v) => ({ Searching: "Searched", Checking: "Checked", Getting: "Got", Preparing: "Prepared", Booking: "Booked", Reserving: "Reserved", Completing: "Completed" })[v] ?? v)}
          <Check className="size-3.5" />
        </span>
      ) : (
        <span className="shimmer-text font-medium">{label}…</span>
      )}
    </div>
  );
}

function AssistantActions() {
  return (
    <div className="mt-1 flex items-center gap-0.5 text-tertiary opacity-0 transition group-hover:opacity-100">
      {[Copy, ThumbsUp, ThumbsDown, Volume2, RefreshCw].map((Icon, i) => (
        <button key={i} type="button" className="inline-flex size-7 items-center justify-center rounded-md hover:bg-surface-secondary hover:text-secondary" aria-hidden tabIndex={-1}>
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  );
}

export function MessageList({ messages, busy, onAct }: { messages: Message[]; busy: boolean; onAct: (a: WidgetAction) => void }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  const lastWidgetIndex = messages.reduce((acc, m, i) => (m.widget ? i : acc), -1);
  const last = messages[messages.length - 1];
  const showThinking = busy && !(last?.role === "assistant" && last.status && !last.status.done);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6">
      {messages.map((m, i) => {
        if (m.role === "user") {
          return (
            <div key={m.id} className="flex justify-end">
              <div className={cn("max-w-[75%] rounded-3xl bg-surface-tertiary px-4 py-2.5 text-[15px] leading-6 whitespace-pre-wrap", m.fromWidget && "text-secondary")}>{m.text}</div>
            </div>
          );
        }
        return (
          <div key={m.id} className="group flex flex-col gap-2">
            {m.status ? <ToolStatusLine {...m.status} /> : null}
            {m.text ? <p className="text-[15px] leading-7 whitespace-pre-wrap">{m.text}</p> : null}
            {m.widget ? (
              <div className="flex flex-col gap-2">
                {m.app ? (
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <WixMark size={18} />
                    <span>Wix</span>
                  </div>
                ) : null}
                <WidgetHost widget={m.widget} onAct={onAct} isLatest={i === lastWidgetIndex} />
              </div>
            ) : null}
            {m.text && !m.status ? <AssistantActions /> : null}
          </div>
        );
      })}
      {showThinking ? (
        <div className="flex items-center gap-1 py-1" aria-label="ChatGPT is thinking">
          <span className="size-3 animate-pulse rounded-full bg-[color:var(--color-text)]" />
        </div>
      ) : null}
      <div ref={endRef} className="h-2" />
    </div>
  );
}
