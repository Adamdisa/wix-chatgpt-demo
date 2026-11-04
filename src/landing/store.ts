import { useCallback, useEffect, useState } from "react";

export interface Business {
  name: string;
  category: string;
  subcategory: string;
  city: string;
  phone: string;
  description: string;
}

export interface OnboardingState {
  business: Business;
  listings: { bookings: boolean; events: boolean };
  bookingProvider?: string;
  eventProvider?: string;
  hiddenServiceIds: string[];
  hiddenEventIds: string[];
  publishedAt?: number;
}

const KEY = "wix-chatgpt-onboarding";

export const SAMPLE_BUSINESS: Business = {
  name: "Oren's Barber Shop",
  category: "Beauty & wellness",
  subcategory: "Barber shop",
  city: "Tel Aviv",
  phone: "+972 3 555 0123",
  description: "Classic cuts, skin fades and hot-towel shaves in Florentin since 2014. Walk-ins welcome, espresso on the house.",
};

export const DEFAULT_STATE: OnboardingState = {
  business: { name: "", category: "", subcategory: "", city: "", phone: "", description: "" },
  listings: { bookings: true, events: true },
  hiddenServiceIds: [],
  hiddenEventIds: [],
};

export function loadState(): OnboardingState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_STATE, ...(JSON.parse(raw) as OnboardingState) };
  } catch {
    /* ignore */
  }
  return DEFAULT_STATE;
}

export function saveState(s: OnboardingState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function useOnboardingState() {
  const [state, setState] = useState<OnboardingState>(loadState);
  useEffect(() => saveState(state), [state]);
  const update = useCallback((patch: Partial<OnboardingState> | ((s: OnboardingState) => OnboardingState)) => {
    setState((s) => (typeof patch === "function" ? patch(s) : { ...s, ...patch }));
  }, []);
  const reset = useCallback(() => setState(DEFAULT_STATE), []);
  return { state, update, reset };
}

/** Synced items the provider "returns" during onboarding. */
export const SYNCED_SERVICES = [
  { id: "cut", name: "Haircut", minutes: 30, price: 100 },
  { id: "cut-beard", name: "Haircut + beard", minutes: 45, price: 120 },
  { id: "beard", name: "Beard trim", minutes: 20, price: 40 },
  { id: "kids", name: "Kids haircut", minutes: 25, price: 70 },
  { id: "hot-towel", name: "Hot-towel shave", minutes: 30, price: 90 },
  { id: "color", name: "Grey blending", minutes: 40, price: 140 },
];

export const SYNCED_EVENTS = [
  { id: "ev-1", name: "Late-night cuts & vinyl", date: "2026-11-13", time: "21:00", tickets: "Free · 20 spots" },
  { id: "ev-2", name: "Beard care workshop", date: "2026-11-20", time: "19:00", tickets: "₪60 · 12 seats" },
  { id: "ev-3", name: "Movember charity shave-off", date: "2026-11-29", time: "12:00", tickets: "Donation · open" },
];
