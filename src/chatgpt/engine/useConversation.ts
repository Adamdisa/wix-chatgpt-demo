import { useCallback, useMemo, useRef, useState } from "react";

import { BARBERS, EVENTS, RESTAURANTS } from "../../data/catalog";
import { BEST_DOMAIN, SITE } from "../../data/site";
import { formatMoney, sleep, uid } from "../../lib/cn";
import { detectIntent, titleFor } from "./intent";
import type { Conversation, DomainState, Handoff, Intent, Message, SitePaneState, Widget, WidgetAction } from "./types";

const todayISO = () => new Date().toISOString().slice(0, 10);
const tomorrowISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

export const SITE_PROMPT = "Create a site for my bar in Tel Aviv: 42 draft beers, a wine selection, good food and 2 pool tables";

export const STARTER_PROMPTS = [
  { icon: "globe", text: SITE_PROMPT },
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
  // Site-creation flow: the custom-domain state is shared by the chat card and the side pane.
  const [domain, setDomain] = useState<DomainState>({ stage: "idle" });
  const [handoff, setHandoff] = useState<Handoff>(null);
  const [sitePane, setSitePane] = useState<SitePaneState>({ open: false, full: false });

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
        case "site": {
          let statusId = "";
          let buildId = "";
          const label = "Planning your site with Wix";
          return script([
            [500, () => (statusId = push(convId, { role: "assistant", status: { label, done: false } }))],
            [
              1600,
              () => {
                patch(convId, statusId, { status: { label, done: true } });
                buildId = push(convId, {
                  role: "assistant",
                  app: "wix",
                  text: "I'll build a first version with a dark, lively Tel Aviv bar feel: the 42 taps, wine and food, the two pool tables, and clear visit info.",
                  widget: { kind: "site-building", phase: "planning" },
                });
              },
            ],
            [2400, () => patch(convId, buildId, { widget: { kind: "site-building", phase: "building", note: "Laying out the 42 taps menu and the billiards section." } })],
            [2400, () => patch(convId, buildId, { widget: { kind: "site-building", phase: "building", note: "Publishing to your free Wix address." } })],
            [
              1800,
              () => {
                patch(convId, buildId, { widget: { kind: "site-building", phase: "done" }, text: undefined, app: undefined });
                push(convId, { role: "assistant", widget: { kind: "site-live" } });
                setSitePane({ open: true, full: false });
              },
            ],
          ]);
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
      const needsWix = intent.type === "barber" || intent.type === "events" || intent.type === "restaurant" || intent.type === "site";

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
                    intent.type === "barber"
                      ? "to search barbers and book appointments"
                      : intent.type === "events"
                        ? "to search events and buy tickets"
                        : intent.type === "site"
                          ? "to build and publish a website on your Wix account"
                          : "to search restaurants and reserve tables",
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
        case "get-domain":
          setDomain((d) => ({ ...d, domain: action.domain, own: false }));
          setHandoff({ step: "leave", domain: action.domain, connect: false });
          return;
        case "connect-own-domain":
          setHandoff({ step: "leave", domain: "", connect: true });
          return;
        case "handoff": {
          if (!handoff) return;
          if (action.step === "cancel") return setHandoff(null);
          if (action.step === "open") return setHandoff({ ...handoff, step: "wix" });
          if (action.step === "complete") return setHandoff({ ...handoff, step: "done", domain: handoff.connect ? action.ownDomain || "lilienblumbar.co.il" : handoff.domain });
          const d = handoff.domain;
          const own = handoff.connect;
          setHandoff(null);
          setDomain({ stage: "pending", domain: d, own });
          return script([
            [
              400,
              () =>
                push(convId, {
                  role: "assistant",
                  text: own
                    ? `${d} is being connected to ${SITE.name}. This usually takes a few minutes, up to 48 hours everywhere; the free address keeps working meanwhile.`
                    : `You now own ${d}. Wix is connecting it to ${SITE.name}; this usually takes a few minutes, up to 48 hours everywhere. The free address keeps working meanwhile.`,
                  widget: { kind: "domain-pending" },
                }),
            ],
          ]);
        }
        case "check-domain-status": {
          const d = domain.domain ?? BEST_DOMAIN;
          const label = "Checking domain status on Wix";
          let statusId = "";
          return script([
            [400, () => (statusId = push(convId, { role: "assistant", status: { label, done: false } }))],
            [
              1200,
              () => {
                patch(convId, statusId, { status: { label, done: true } });
                setDomain((s) => ({ ...s, stage: "connected" }));
                push(convId, { role: "assistant", text: `${d} now points to ${SITE.name}. I'll use it in links from now on; the free address keeps working too.` });
              },
            ],
          ]);
        }
        case "site-pane":
          setSitePane((p) => ({ open: action.open, full: action.full ?? (action.open ? p.full : false) }));
          return;
        default:
          return;
      }
    },
    [domain.domain, handoff, mutate, patch, push, runIntent, script, send, toolTurn],
  );

  /* ----------------------------------------------------- navigation */

  const resetSite = useCallback(() => {
    setSitePane({ open: false, full: false });
    setHandoff(null);
    setDomain({ stage: "idle" });
  }, []);

  const newChat = useCallback(() => {
    runId.current++;
    setBusy(false);
    setFullscreenEvent(null);
    resetSite();
    pendingIntent.current = null;
    setActiveId(null);
    activeRef.current = null;
  }, [resetSite]);

  const switchChat = useCallback((id: string) => {
    runId.current++;
    setBusy(false);
    setFullscreenEvent(null);
    setFullscreenMenu(null);
    resetSite();
    setActiveId(id);
    activeRef.current = id;
  }, [resetSite]);

  return {
    conversations,
    activeId,
    messages,
    busy,
    connected,
    fullscreenEvent,
    fullscreenMenu,
    domain,
    handoff,
    sitePane,
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
