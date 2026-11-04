import { useCallback, useMemo, useRef, useState } from "react";

import { BARBERS, EVENTS, RESTAURANTS } from "../../data/catalog";
import { formatMoney, sleep, uid } from "../../lib/cn";
import { detectIntent, titleFor } from "./intent";
import type { Conversation, Intent, Message, Widget, WidgetAction } from "./types";

const todayISO = () => new Date().toISOString().slice(0, 10);
const tomorrowISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

export const STARTER_PROMPTS = [
  { icon: "scissors", text: "Book me a haircut in Tel Aviv tomorrow afternoon" },
  { icon: "ticket", text: "What's happening in Tel Aviv this weekend?" },
  { icon: "utensils", text: "Find a pizza place for 2 tonight near Rothschild" },
  { icon: "music", text: "@Wix show me classical concerts this week" },
];

export function useConversation() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [connected, setConnectedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem("wix-chatgpt-connected") === "1";
    } catch {
      return false;
    }
  });
  const setConnected = useCallback((v: boolean) => {
    setConnectedState(v);
    try {
      localStorage.setItem("wix-chatgpt-connected", v ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);
  const [fullscreenEvent, setFullscreenEvent] = useState<string | null>(null);
  const [fullscreenMenu, setFullscreenMenu] = useState<string | null>(null);

  const pendingIntent = useRef<Intent | null>(null);
  const runId = useRef(0);
  const activeRef = useRef<string | null>(null);

  const active = useMemo(() => conversations.find((c) => c.id === activeId) ?? null, [conversations, activeId]);
  const messages = active?.messages ?? [];

  /* ------------------------------------------------------------ helpers */

  const mutate = useCallback((convId: string, fn: (msgs: Message[]) => Message[]) => {
    setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, messages: fn(c.messages) } : c)));
  }, []);

  const ensureConversation = useCallback(
    (firstText: string) => {
      if (activeRef.current) return activeRef.current;
      const id = uid("chat");
      const conv: Conversation = { id, title: titleFor(firstText), messages: [], createdAt: Date.now() };
      setConversations((prev) => [conv, ...prev]);
      setActiveId(id);
      activeRef.current = id;
      return id;
    },
    [],
  );

  const push = useCallback(
    (convId: string, m: Omit<Message, "id">) => {
      const id = uid("m");
      mutate(convId, (msgs) => [...msgs, { ...m, id }]);
      return id;
    },
    [mutate],
  );

  const patch = useCallback(
    (convId: string, id: string, partial: Partial<Message>) => {
      mutate(convId, (msgs) => msgs.map((m) => (m.id === id ? { ...m, ...partial } : m)));
    },
    [mutate],
  );

  /** Runs timed steps; aborts silently if the user started a new chat meanwhile. */
  const script = useCallback(async (steps: Array<[number, () => void]>) => {
    const run = ++runId.current;
    setBusy(true);
    for (const [delay, fn] of steps) {
      await sleep(delay);
      if (runId.current !== run) return;
      fn();
    }
    setBusy(false);
  }, []);

  /** Standard tool-call sequence: shimmer status → done → widget message. */
  const toolTurn = useCallback(
    (convId: string, statusLabel: string, result: { text?: string; widget: Widget }, waitMs = 1600) => {
      let statusId = "";
      return script([
        [500, () => (statusId = push(convId, { role: "assistant", status: { label: statusLabel, done: false } }))],
        [waitMs, () => patch(convId, statusId, { status: { label: statusLabel, done: true } })],
        [350, () => push(convId, { role: "assistant", app: "wix", widget: result.widget, text: result.text })],
      ]);
    },
    [patch, push, script],
  );

  /* --------------------------------------------------------- intents */

  const runIntent = useCallback(
    (convId: string, intent: Intent) => {
      switch (intent.type) {
        case "barber": {
          const when = intent.when === "today" ? "today" : "tomorrow";
          const slot = intent.time === "morning" ? "10:30" : intent.time === "evening" ? "18:30" : "15:30";
          return toolTurn(
            convId,
            `Searching Wix for barbers in ${intent.city ?? "Tel Aviv"}`,
            {
              text: `Here are four barbers near you with openings ${when}${intent.time ? ` in the ${intent.time}` : ""}. Oren's has the highest rating and a ${slot} slot open.`,
              widget: { kind: "barbers", ids: BARBERS.map((b) => b.id) },
            },
          );
        }
        case "events": {
          const filter = intent.filter ?? "all";
          const ids = EVENTS.filter((e) =>
            filter === "all" ? true : filter === "music" ? e.category === "music" || e.category === "classical" : e.category === filter,
          ).map((e) => e.id);
          const label =
            filter === "classical" ? "classical concerts" : filter === "comedy" ? "comedy shows" : filter === "music" ? "concerts" : "events";
          const text =
            filter === "all"
              ? "Here's what's on in Tel Aviv from Thursday to Saturday, pulled from venues and organizers listed on Wix. Arctic Monkeys at Yarkon Park is the big one; the rooftop jazz set and the night food market are cheaper options."
              : `Here are the ${label} I found in Tel Aviv this week. Tap one for seats, prices and tickets.`;
          return toolTurn(convId, `Searching Wix for ${label} in Tel Aviv`, {
            text,
            widget: { kind: "events", ids: ids.length ? ids : EVENTS.map((e) => e.id), heading: label },
          });
        }
        case "restaurant": {
          return toolTurn(convId, "Checking tables near Rothschild on Wix", {
            text: `Four pizza places near Rothschild can seat ${intent.party ?? 2} tonight. Tony Vespa is closest and has a 19:30 table.`,
            widget: { kind: "restaurants", ids: RESTAURANTS.map((r) => r.id) },
          });
        }
        default:
          return script([
            [
              700,
              () =>
                push(convId, {
                  role: "assistant",
                  text: "I can help with that. For live bookings, events and tables I'll use the Wix app, which pulls real availability from businesses listed on Wix. Try one of these:",
                  widget: { kind: "suggestions", chips: STARTER_PROMPTS.map((p) => p.text) },
                }),
            ],
          ]);
      }
    },
    [push, script, toolTurn],
  );

  const send = useCallback(
    (raw: string, opts?: { fromWidget?: boolean }) => {
      const text = raw.trim();
      if (!text || busy) return;
      const convId = ensureConversation(text);
      push(convId, { role: "user", text, fromWidget: opts?.fromWidget });

      const intent = detectIntent(text);
      const needsWix = intent.type === "barber" || intent.type === "events" || intent.type === "restaurant";

      if (/\bconnect\b.*\bwix\b/i.test(text) && !connected) {
        pendingIntent.current = { type: "unknown" };
        return script([[600, () => push(convId, { role: "assistant", text: "Sure, connect Wix below.", widget: { kind: "connect", app: "wix", reason: "to search businesses and book on your behalf" } })]]);
      }

      if (intent.type === "affirm" && pendingIntent.current) {
        const next = pendingIntent.current;
        pendingIntent.current = null;
        setConnected(true);
        return script([
          [600, () => push(convId, { role: "assistant", text: "Connected to Wix." })],
          [200, () => void runIntent(convId, next)],
        ]);
      }
      if (intent.type === "decline" && pendingIntent.current) {
        pendingIntent.current = null;
        return script([[600, () => push(convId, { role: "assistant", text: "No problem. I can still answer from general knowledge, but I won't be able to check live availability or book anything." })]]);
      }

      if (needsWix && !connected) {
        pendingIntent.current = intent;
        return script([
          [
            800,
            () =>
              push(convId, {
                role: "assistant",
                text: "I can check live availability and book this for you through the Wix app. It needs your permission the first time.",
                widget: {
                  kind: "connect",
                  app: "wix",
                  reason:
                    intent.type === "barber" ? "to search barbers and book appointments" : intent.type === "events" ? "to search events and buy tickets" : "to search restaurants and reserve tables",
                },
              }),
          ],
        ]);
      }

      return runIntent(convId, intent);
    },
    [busy, connected, ensureConversation, push, runIntent, script],
  );

  /* --------------------------------------------------------- actions */

  const act = useCallback(
    (action: WidgetAction) => {
      const convId = activeRef.current;
      if (!convId) return;

      switch (action.type) {
        case "connect": {
          const next = pendingIntent.current;
          pendingIntent.current = null;
          if (!action.allow) {
            mutate(convId, (msgs) => msgs.map((m) => (m.widget?.kind === "connect" ? { ...m, widget: { ...m.widget, reason: "declined" } } : m)));
            return script([[400, () => push(convId, { role: "assistant", text: "No problem. I can still answer from general knowledge, but I won't be able to check live availability or book anything. Say \"connect Wix\" any time to turn it on." })]]);
          }
          setConnected(true);
          mutate(convId, (msgs) =>
            msgs.map((m) => (m.widget?.kind === "connect" ? { ...m, widget: { ...m.widget, reason: "connected" } } : m)),
          );
          return script([[300, () => next && void runIntent(convId, next)]]);
        }
        case "chip":
          return send(action.text);

        case "select-barber": {
          const b = BARBERS.find((x) => x.id === action.barberId)!;
          push(convId, { role: "user", text: `Book at ${b.name}`, fromWidget: true });
          return toolTurn(convId, `Checking availability at ${b.name}`, {
            text: `Here's what's open at ${b.name} tomorrow. Pick a service and a time and I'll book it under your name.`,
            widget: { kind: "barber-booking", barberId: b.id, dateISO: tomorrowISO(), preferredTime: "15:30" },
          }, 1300);
        }
        case "confirm-booking": {
          const b = BARBERS.find((x) => x.id === action.barberId)!;
          const services = b.services.filter((s) => action.serviceIds.includes(s.id));
          const total = services.reduce((n, s) => n + s.price, 0);
          return toolTurn(convId, `Booking with ${b.name} on Wix`, {
            text: `You're booked. ${b.name} will send a reminder the morning of, and you can reschedule or cancel from this chat or the confirmation SMS.`,
            widget: { kind: "booking-confirmed", barberId: b.id, serviceIds: action.serviceIds, dateISO: action.dateISO, time: action.time, staff: action.staff, total },
          }, 1500);
        }
        case "select-event": {
          const e = EVENTS.find((x) => x.id === action.eventId)!;
          push(convId, { role: "user", text: `Tickets for ${e.title}`, fromWidget: true });
          let statusId = "";
          return script([
            [500, () => (statusId = push(convId, { role: "assistant", status: { label: `Getting ticket availability for ${e.title}`, done: false } }))],
            [1300, () => patch(convId, statusId, { status: { label: `Getting ticket availability for ${e.title}`, done: true } })],
            [
              300,
              () => {
                push(convId, {
                  role: "assistant",
                  app: "wix",
                  text: `${e.tiers.length} ticket types are still available. Choose seats and quantity, then I'll set up checkout.`,
                  widget: { kind: "event-detail", eventId: e.id },
                });
                setFullscreenEvent(e.id);
              },
            ],
          ]);
        }
        case "open-fullscreen":
          setFullscreenEvent(action.eventId);
          return;
        case "view-menu":
          setFullscreenMenu(action.restaurantId);
          return;
        case "checkout": {
          const e = EVENTS.find((x) => x.id === action.eventId)!;
          const tier = e.tiers.find((t) => t.id === action.tierId)!;
          setFullscreenEvent(null);
          push(convId, { role: "user", text: `${action.qty} × ${tier.name} for ${e.title}${action.section && action.section !== tier.name ? ` (${action.section})` : ""}`, fromWidget: true });
          return toolTurn(convId, "Preparing checkout with Wix", {
            text: `Here's your order. ${tier.left < 20 ? `Only ${tier.left} left in ${tier.name}, so I've held these for 10 minutes. ` : ""}Pay with Apple Pay or a saved card.`,
            widget: { kind: "checkout", eventId: e.id, tierId: tier.id, qty: action.qty, section: action.section },
          }, 1200);
        }
        case "pay": {
          const e = EVENTS.find((x) => x.id === action.eventId)!;
          const tier = e.tiers.find((t) => t.id === action.tierId)!;
          const subtotal = tier.price * action.qty;
          const total = subtotal + Math.round(subtotal * 0.05);
          return toolTurn(convId, `Completing purchase with ${action.method}`, {
            text: `Done. ${action.qty} ${action.qty === 1 ? "ticket" : "tickets"} for ${e.title}, ${formatMoney(total, e.currency)} charged to ${action.method}. They're below and in your email, and I added the event to your calendar.`,
            widget: { kind: "tickets", eventId: e.id, tierId: tier.id, qty: action.qty, orderId: `WX-${Math.floor(100000 + Math.random() * 899999)}`, section: action.section },
          }, 1800);
        }
        case "select-restaurant": {
          const r = RESTAURANTS.find((x) => x.id === action.restaurantId)!;
          push(convId, { role: "user", text: `Reserve at ${r.name}`, fromWidget: true });
          return toolTurn(convId, `Checking tables at ${r.name}`, {
            text: `${r.name} has tables tonight. Pick a time and party size.`,
            widget: { kind: "reserve", restaurantId: r.id, dateISO: todayISO(), party: 2 },
          }, 1200);
        }
        case "confirm-reservation": {
          const r = RESTAURANTS.find((x) => x.id === action.restaurantId)!;
          return toolTurn(convId, `Reserving at ${r.name} on Wix`, {
            text: `Table for ${action.party} at ${r.name}, ${action.time} tonight. They'll hold it for 15 minutes past the time.`,
            widget: { kind: "reservation-confirmed", restaurantId: r.id, dateISO: action.dateISO, time: action.time, party: action.party },
          }, 1300);
        }
        default:
          return;
      }
    },
    [mutate, patch, push, runIntent, script, send, toolTurn],
  );

  /* ----------------------------------------------------- navigation */

  const newChat = useCallback(() => {
    runId.current++;
    setBusy(false);
    setFullscreenEvent(null);
    pendingIntent.current = null;
    setActiveId(null);
    activeRef.current = null;
  }, []);

  const switchChat = useCallback((id: string) => {
    runId.current++;
    setBusy(false);
    setFullscreenEvent(null);
    setFullscreenMenu(null);
    setActiveId(id);
    activeRef.current = id;
  }, []);

  return {
    conversations,
    activeId,
    messages,
    busy,
    connected,
    fullscreenEvent,
    fullscreenMenu,
    closeFullscreen: () => {
      setFullscreenEvent(null);
      setFullscreenMenu(null);
    },
    disconnect: () => setConnected(false),
    send,
    act,
    newChat,
    switchChat,
  };
}

export type ConversationApi = ReturnType<typeof useConversation>;
