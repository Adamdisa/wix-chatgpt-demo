# Wix in ChatGPT — demo rebuild (design note)

Rebuild of the Nov 2025 Figma Make prototypes ("Wix in ChatGPT demo (with app selection)" and
"Wix ChatGPT Landing Page") as one Vite + React app with two surfaces.

## Intent

Show two sides of one story:

1. **Consumer side (`/chatgpt`)** — a mock of today's ChatGPT where the Wix app answers
   "book me a haircut", "what's on this weekend", "table for two tonight" with inline widgets
   built to OpenAI's Apps SDK design guidelines.
2. **Business side (`/`)** — a Wix landing page where a small business signs up in minutes,
   connects the bookings and events tools it already uses, and gets listed in ChatGPT.
   Events sync is new: businesses can list events from events platforms, not just bookings.

## Calls made (Adam opted out of the question round)

- **Stack:** Vite 6, React 18, TypeScript, Tailwind v4, react-router 7, motion, lucide-react,
  and `@openai/apps-sdk-ui` (OpenAI's own design system for ChatGPT apps) for tokens and a few
  primitives inside the chat widgets. No backend; every flow is scripted mock data.
- **ChatGPT shell** mirrors the current product: left sidebar (New chat, Search chats, Library,
  Apps, Projects, chat history), centred composer pill with "+" menu, app picker under
  "More → Apps", `@Wix` mention, light and dark themes.
- **Apps SDK rules applied to widgets:** every app response starts inline; carousels hold 3–8
  items, each with an image, a title, at most three metadata lines and one CTA; cards have at
  most two actions (one primary, one secondary); no nested scrolling, tabs or drill-ins inside
  cards; fullscreen only for the rich event detail (ticket tiers, seat sections) and keeps the
  composer visible; system font stack and system greys, brand colour only on accents and the
  primary button; ChatGPT appends the app name and logo above the widget, the widget itself
  carries no logo; first use shows a connect/consent step before any data is shown.
- **Flows in the demo:** barber booking (services → slot → confirm), events (carousel →
  fullscreen detail → checkout card → tickets), restaurant reservation (carousel → party size
  and time → confirm). Generic prompts get a short reply plus suggestion chips.
- **Landing page flows:** Get listed → Wix sign-up (simulated users.wix.com) → onboarding
  wizard: business basics → what to list (bookings, events or both) → connect a bookings
  provider → connect an events provider → review what was synced and preview the ChatGPT
  listing → live, with a dashboard showing sync status and a "Try it in ChatGPT" link that
  opens the demo with a matching prompt.
- **Providers:** Bookings: Wix Bookings, Calendly, Square Appointments, Acuity, Fresha, Booksy,
  Zoho Bookings, Setmore, Google Calendar. Events: Wix Events, Eventbrite, Ticketmaster, Dice,
  Luma, Humanitix, Meetup, Universe, Tixr. OAuth is simulated with a provider-branded consent page.

## Non-goals

Real auth, real payments, real MCP calls, mobile-native layouts beyond responsive breakpoints.

## Sources

- https://developers.openai.com/apps-sdk/concepts/design-guidelines
- https://developers.openai.com/apps-sdk/concepts/ui-guidelines
- `@openai/apps-sdk-ui` 0.2.2 (tokens: `--color-surface*`, `--color-text*`, `--color-border*`,
  `--radius-*`, heading/text scales, system font stack)
