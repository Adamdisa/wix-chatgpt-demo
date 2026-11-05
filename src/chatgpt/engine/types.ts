export type AppId = "wix";

export type Widget =
  | { kind: "connect"; app: AppId; reason: string }
  | { kind: "barbers"; ids: string[] }
  | { kind: "barber-booking"; barberId: string; dateISO: string; preferredTime?: string }
  | {
      kind: "booking-confirmed";
      barberId: string;
      serviceIds: string[];
      dateISO: string;
      time: string;
      staff: string;
      total: number;
    }
  | { kind: "events"; ids: string[]; heading?: string }
  | { kind: "event-detail"; eventId: string }
  | { kind: "checkout"; eventId: string; tierId: string; qty: number; section?: string }
  | { kind: "tickets"; eventId: string; tierId: string; qty: number; orderId: string; section?: string }
  | { kind: "restaurants"; ids: string[] }
  | { kind: "reserve"; restaurantId: string; dateISO: string; party: number }
  | { kind: "reservation-confirmed"; restaurantId: string; dateISO: string; time: string; party: number }
  | { kind: "suggestions"; chips: string[] }
  /** Site build progress; "done" collapses to the "Opened Wix site" line. */
  | { kind: "site-building"; phase: "planning" | "building" | "done"; note?: string }
  /** The closing message of a site build, with the domain card inside it. */
  | { kind: "site-live" }
  /** One chip after a domain purchase: "Check status". */
  | { kind: "domain-pending" };

export interface ToolStatus {
  label: string;
  done: boolean;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  text?: string;
  /** Tool-call progress line rendered above the response ("Searching Wix…"). */
  status?: ToolStatus;
  /** App widget rendered inline; ChatGPT prefixes it with the app name and logo. */
  widget?: Widget;
  app?: AppId;
  /** User turns that originate from a widget action (sendFollowUpMessage). */
  fromWidget?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export type Intent =
  | { type: "barber"; city?: string; when?: string; time?: string }
  | { type: "events"; filter?: "classical" | "comedy" | "music" | "food" | "family" | "all"; when?: string }
  | { type: "restaurant"; party?: number; when?: string }
  | { type: "site" }
  | { type: "affirm" }
  | { type: "decline" }
  | { type: "unknown" };

/** Custom-domain state for the site built in this chat. Shared by the chat card and the side pane. */
export interface DomainState {
  stage: "idle" | "pending" | "connected";
  domain?: string;
  /** True when the user connected a domain they already own instead of buying one. */
  own?: boolean;
}

/** The "Continue on Wix" handoff: ChatGPT's leave dialog, the Wix tab, then the return. */
export type Handoff = { step: "leave" | "wix" | "done"; domain: string; connect: boolean } | null;

export interface SitePaneState {
  open: boolean;
  full: boolean;
}

export type WidgetAction =
  | { type: "connect"; allow: boolean }
  | { type: "select-barber"; barberId: string }
  | {
      type: "confirm-booking";
      barberId: string;
      serviceIds: string[];
      dateISO: string;
      time: string;
      staff: string;
    }
  | { type: "select-event"; eventId: string }
  | { type: "checkout"; eventId: string; tierId: string; qty: number; section?: string }
  | { type: "pay"; eventId: string; tierId: string; qty: number; section?: string; method: string }
  | { type: "select-restaurant"; restaurantId: string }
  | { type: "view-menu"; restaurantId: string }
  | { type: "confirm-reservation"; restaurantId: string; dateISO: string; time: string; party: number }
  | { type: "chip"; text: string }
  | { type: "open-fullscreen"; eventId: string }
  | { type: "change-time"; widgetId: string }
  | { type: "get-domain"; domain: string }
  | { type: "connect-own-domain" }
  | { type: "handoff"; step: "open" | "cancel" | "complete" | "back"; ownDomain?: string }
  | { type: "check-domain-status" }
  | { type: "site-pane"; open: boolean; full?: boolean };
