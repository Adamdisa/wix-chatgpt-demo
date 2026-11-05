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
  | { kind: "suggestions"; chips: string[] };

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
  | { type: "affirm" }
  | { type: "decline" }
  | { type: "unknown" };

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
  | { type: "change-time"; widgetId: string };
