import arcticMonkeys from "../assets/arctic-monkeys.png";
import barberHero from "../assets/barber.png";
import orchestra from "../assets/orchestra.png";

const u = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/* ---------------------------------------------------------------- barbers */

export interface Service {
  id: string;
  name: string;
  minutes: number;
  price: number;
}

export interface Barber {
  id: string;
  name: string;
  neighborhood: string;
  city: string;
  rating: number;
  reviews: number;
  distanceKm: number;
  image: string;
  nextSlot: string;
  tags: string[];
  services: Service[];
  staff: string[];
  address: string;
}

export const BARBERS: Barber[] = [
  {
    id: "orens",
    name: "Oren's Barber Shop",
    neighborhood: "Florentin",
    city: "Tel Aviv",
    rating: 4.9,
    reviews: 612,
    distanceKm: 0.8,
    image: barberHero,
    nextSlot: "Today 15:30",
    tags: ["Walk-ins", "Beard specialist"],
    address: "Vital 12, Tel Aviv",
    staff: ["Oren", "Dana", "Yossi"],
    services: [
      { id: "cut", name: "Haircut", minutes: 30, price: 100 },
      { id: "cut-beard", name: "Haircut + beard", minutes: 45, price: 120 },
      { id: "beard", name: "Beard trim", minutes: 20, price: 40 },
      { id: "kids", name: "Kids haircut", minutes: 25, price: 70 },
      { id: "hot-towel", name: "Hot-towel shave", minutes: 30, price: 90 },
    ],
  },
  {
    id: "fade",
    name: "Fade Factory",
    neighborhood: "Dizengoff",
    city: "Tel Aviv",
    rating: 4.8,
    reviews: 388,
    distanceKm: 1.4,
    image: u("photo-1503951914875-452162b0f3f1"),
    nextSlot: "Today 16:00",
    tags: ["Skin fades", "Late hours"],
    address: "Dizengoff 142, Tel Aviv",
    staff: ["Tomer", "Lior"],
    services: [
      { id: "fade", name: "Skin fade", minutes: 40, price: 110 },
      { id: "cut", name: "Classic cut", minutes: 30, price: 90 },
      { id: "lineup", name: "Line-up", minutes: 15, price: 40 },
    ],
  },
  {
    id: "mister",
    name: "Mister Barber",
    neighborhood: "Neve Tzedek",
    city: "Tel Aviv",
    rating: 4.7,
    reviews: 254,
    distanceKm: 2.1,
    image: u("photo-1585747860715-2ba37e788b70"),
    nextSlot: "Tomorrow 10:00",
    tags: ["Premium", "Espresso bar"],
    address: "Shabazi 35, Tel Aviv",
    staff: ["Ariel", "Noa"],
    services: [
      { id: "signature", name: "Signature cut", minutes: 45, price: 160 },
      { id: "beard", name: "Beard sculpt", minutes: 30, price: 70 },
      { id: "combo", name: "The works", minutes: 75, price: 220 },
    ],
  },
  {
    id: "clip",
    name: "Clip & Co.",
    neighborhood: "Rothschild",
    city: "Tel Aviv",
    rating: 4.6,
    reviews: 171,
    distanceKm: 1.0,
    image: u("photo-1622286342621-4bd786c2447c"),
    nextSlot: "Today 18:30",
    tags: ["Students -20%"],
    address: "Rothschild 60, Tel Aviv",
    staff: ["Maya", "Guy"],
    services: [
      { id: "cut", name: "Haircut", minutes: 30, price: 85 },
      { id: "wash", name: "Wash + cut", minutes: 40, price: 105 },
    ],
  },
];

export const TIME_SLOTS = ["09:30", "10:30", "11:30", "13:00", "14:30", "15:30", "16:00", "17:30", "18:30"];

/* ----------------------------------------------------------------- events */

export type EventCategory = "music" | "classical" | "comedy" | "food" | "family" | "workshop";

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  left: number;
  perks?: string;
}

export interface Event {
  id: string;
  title: string;
  organizer: string;
  source: string; // provider the event was synced from
  category: EventCategory;
  city: string;
  venue: string;
  date: string; // ISO date
  time: string;
  image: string;
  currency: string;
  fromPrice: number;
  tiers: TicketTier[];
  blurb: string;
  sections?: string[];
  tags: string[];
}

export const EVENTS: Event[] = [
  {
    id: "arctic",
    title: "Arctic Monkeys — Live in Tel Aviv",
    organizer: "Live Nation Israel",
    source: "Ticketmaster",
    category: "music",
    city: "Tel Aviv",
    venue: "Yarkon Park",
    date: "2026-11-07",
    time: "20:00",
    image: arcticMonkeys,
    currency: "ILS",
    fromPrice: 390,
    blurb: "The Sheffield four-piece return for one open-air night. Gates 18:00, support act 19:00.",
    sections: ["General admission", "Golden ring", "Grandstand A", "Grandstand B"],
    tiers: [
      { id: "ga", name: "General admission", price: 390, left: 1200 },
      { id: "golden", name: "Golden ring", price: 690, left: 84, perks: "Front-of-stage pit" },
      { id: "stand", name: "Grandstand (seated)", price: 520, left: 310 },
    ],
    tags: ["Outdoor", "16+"],
  },
  {
    id: "ipo",
    title: "Israel Philharmonic — Mahler 5",
    organizer: "Israel Philharmonic Orchestra",
    source: "Wix Events",
    category: "classical",
    city: "Tel Aviv",
    venue: "Charles Bronfman Auditorium",
    date: "2026-11-08",
    time: "19:30",
    image: orchestra,
    currency: "ILS",
    fromPrice: 180,
    blurb: "Lahav Shani conducts Mahler's Fifth. Pre-concert talk at 18:45 in the foyer.",
    sections: ["Orchestra", "Mezzanine", "Balcony"],
    tiers: [
      { id: "balcony", name: "Balcony", price: 180, left: 96 },
      { id: "mezz", name: "Mezzanine", price: 290, left: 42 },
      { id: "orch", name: "Orchestra", price: 420, left: 18 },
    ],
    tags: ["Classical", "2h incl. interval"],
  },
  {
    id: "jazz",
    title: "Rooftop Jazz Sessions",
    organizer: "Beit HaAmudim",
    source: "Eventbrite",
    category: "music",
    city: "Tel Aviv",
    venue: "Beit HaAmudim rooftop",
    date: "2026-11-06",
    time: "21:30",
    image: u("photo-1511192336575-5a79af67a629"),
    currency: "ILS",
    fromPrice: 80,
    blurb: "Late-night trio set with the city skyline behind the band. Bar opens 20:30.",
    tiers: [
      { id: "std", name: "Standing", price: 80, left: 60 },
      { id: "table", name: "Table seat", price: 140, left: 12, perks: "Includes first drink" },
    ],
    tags: ["Intimate", "21+"],
  },
  {
    id: "comedy",
    title: "Stand-up Thursday (English)",
    organizer: "Comedy Basement TLV",
    source: "Dice",
    category: "comedy",
    city: "Tel Aviv",
    venue: "Comedy Basement, Allenby 40",
    date: "2026-11-06",
    time: "20:30",
    image: u("photo-1585699324551-f6c309eedeca"),
    currency: "ILS",
    fromPrice: 60,
    blurb: "Five comics, one headliner, no two-drink minimum. Doors 20:00.",
    tiers: [
      { id: "ga", name: "General admission", price: 60, left: 35 },
      { id: "front", name: "Front row", price: 90, left: 6, perks: "You will get picked on" },
    ],
    tags: ["English", "90 min"],
  },
  {
    id: "food",
    title: "Night Food Market",
    organizer: "Sarona Market",
    source: "Luma",
    category: "food",
    city: "Tel Aviv",
    venue: "Sarona Market",
    date: "2026-11-07",
    time: "18:00",
    image: u("photo-1555939594-58d7cb561ad1"),
    currency: "ILS",
    fromPrice: 0,
    blurb: "Thirty street-food stalls, live DJ set, free entry. Tasting passport optional.",
    tiers: [
      { id: "free", name: "Free entry", price: 0, left: 999 },
      { id: "passport", name: "Tasting passport (8 bites)", price: 120, left: 150 },
    ],
    tags: ["Free entry", "Family friendly"],
  },
  {
    id: "pottery",
    title: "Wheel-throwing Workshop",
    organizer: "Studio Clay",
    source: "Wix Events",
    category: "workshop",
    city: "Tel Aviv",
    venue: "Studio Clay, Jaffa",
    date: "2026-11-08",
    time: "11:00",
    image: u("photo-1565193566173-7a0ee3dbe261"),
    currency: "ILS",
    fromPrice: 220,
    blurb: "Two-hour beginners' session. Clay, firing and a coffee included. Max 8 people.",
    tiers: [{ id: "seat", name: "Seat", price: 220, left: 3 }],
    tags: ["Beginners", "2h"],
  },
];

/* ------------------------------------------------------------ restaurants */

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  neighborhood: string;
  rating: number;
  reviews: number;
  price: "$" | "$$" | "$$$";
  image: string;
  distanceKm: number;
  nextTable: string;
  tags: string[];
}

export interface MenuItem {
  name: string;
  desc: string;
  price: number;
  tag?: "Popular" | "Vegan" | "Spicy" | "New";
}
export interface MenuSection {
  title: string;
  items: MenuItem[];
}

/** Menus synced from Wix Restaurants, shown in the fullscreen menu view. */
export const MENUS: Record<string, MenuSection[]> = {
  tonys: [
    { title: "By the slice", items: [
      { name: "Margherita", desc: "San Marzano tomato, fior di latte, basil", price: 22, tag: "Popular" },
      { name: "Patate e rosmarino", desc: "Thin potato, rosemary, sea salt, no cheese", price: 24, tag: "Vegan" },
      { name: "Nduja & honey", desc: "Calabrian nduja, hot honey, pecorino", price: 28, tag: "Spicy" },
    ] },
    { title: "Starters", items: [
      { name: "Suppli", desc: "Fried rice ball, ragu, mozzarella", price: 18 },
      { name: "Burrata", desc: "Puglian burrata, cherry tomatoes, olive oil", price: 42 },
    ] },
    { title: "Drinks", items: [
      { name: "House red", desc: "Montepulciano, glass", price: 34 },
      { name: "Chinotto", desc: "Lurisia, bottle", price: 14 },
    ] },
  ],
  delfina: [
    { title: "Antipasti", items: [
      { name: "Insalata tricolore", desc: "Arugula, radicchio, endive, parmigiano", price: 46 },
      { name: "Meatballs", desc: "Beef and pork, tomato sugo, grilled bread", price: 52, tag: "Popular" },
      { name: "Broccoli di ciccio", desc: "Charred, chili, lemon", price: 38, tag: "Vegan" },
    ] },
    { title: "Pizze", items: [
      { name: "Margherita", desc: "Tomato, fior di latte, basil", price: 58 },
      { name: "Salsiccia", desc: "Fennel sausage, tomato, bell pepper, onion", price: 72, tag: "Popular" },
      { name: "Funghi", desc: "Roasted mushrooms, fontina, thyme", price: 68 },
      { name: "Diavola", desc: "Spicy salami, chili oil, mozzarella", price: 70, tag: "Spicy" },
    ] },
    { title: "Dolci", items: [
      { name: "Tiramisu", desc: "Classic, made this morning", price: 36 },
      { name: "Affogato", desc: "Vanilla gelato, espresso", price: 28 },
    ] },
  ],
  golden: [
    { title: "Squares", items: [
      { name: "Cheese square", desc: "Thick crust, aged mozzarella, tomato", price: 26, tag: "Popular" },
      { name: "Pepperoni square", desc: "Cup-and-char pepperoni", price: 30 },
      { name: "Clam & garlic", desc: "Whole clams, garlic butter, parsley", price: 34, tag: "New" },
    ] },
    { title: "Sides", items: [
      { name: "Garlic knots", desc: "Six, parmesan, parsley", price: 20 },
      { name: "Caesar", desc: "Romaine, anchovy dressing, croutons", price: 38 },
    ] },
    { title: "Drinks", items: [
      { name: "Lager", desc: "Goldstar, pint", price: 30 },
      { name: "Lemonade", desc: "Fresh, mint", price: 16 },
    ] },
  ],
  star: [
    { title: "Deep dish", items: [
      { name: "The Classic", desc: "Cornmeal crust, mozzarella, chunky tomato", price: 84, tag: "Popular" },
      { name: "Little Star", desc: "Spinach, ricotta, feta, mushrooms, onions, garlic", price: 92 },
      { name: "Meat lover", desc: "Sausage, pepperoni, bacon", price: 98 },
    ] },
    { title: "Thin crust", items: [
      { name: "Margherita", desc: "Tomato, mozzarella, basil", price: 64 },
      { name: "Veggie", desc: "Roasted peppers, zucchini, olives", price: 68, tag: "Vegan" },
    ] },
    { title: "Desserts", items: [
      { name: "Chocolate chip cookie", desc: "Skillet-baked, vanilla ice cream", price: 34 },
    ] },
  ],
};

export const RESTAURANTS: Restaurant[] = [
  {
    id: "tonys",
    name: "Tony Vespa",
    cuisine: "Roman pizza",
    neighborhood: "Rothschild",
    rating: 4.6,
    reviews: 843,
    price: "$$",
    image: u("photo-1566843972142-a7fcb70de55a"),
    distanceKm: 0.6,
    nextTable: "19:30",
    tags: ["Outdoor seating"],
  },
  {
    id: "delfina",
    name: "Pizzeria Delfina",
    cuisine: "Neapolitan",
    neighborhood: "Florentin",
    rating: 4.5,
    reviews: 987,
    price: "$$",
    image: u("photo-1682943755011-f262a8ad2713"),
    distanceKm: 1.2,
    nextTable: "20:00",
    tags: ["Wood oven"],
  },
  {
    id: "golden",
    name: "Golden Boy",
    cuisine: "Sicilian squares",
    neighborhood: "Kerem",
    rating: 4.6,
    reviews: 1203,
    price: "$",
    image: u("photo-1760413445188-1318f64b128a"),
    distanceKm: 1.8,
    nextTable: "19:00",
    tags: ["Late night"],
  },
  {
    id: "star",
    name: "Little Star",
    cuisine: "Deep dish",
    neighborhood: "Port",
    rating: 4.4,
    reviews: 756,
    price: "$$",
    image: u("photo-1708649360970-1739eb95204b"),
    distanceKm: 3.4,
    nextTable: "21:00",
    tags: ["Kids menu"],
  },
];

/* -------------------------------------------------------------- providers */

export type ProviderKind = "bookings" | "events";

export interface Provider {
  id: string;
  name: string;
  kind: ProviderKind;
  color: string;
  initials: string;
  domain: string;
  native?: boolean; // Wix-owned, no OAuth needed
  blurb: string;
}

export const BOOKING_PROVIDERS: Provider[] = [
  { id: "wix-bookings", name: "Wix Bookings", kind: "bookings", color: "#116dff", initials: "W", domain: "wix.com", native: true, blurb: "Already on Wix? Nothing to connect." },
  { id: "calendly", name: "Calendly", kind: "bookings", color: "#006bff", initials: "C", domain: "calendly.com", blurb: "Event types and availability." },
  { id: "square", name: "Square Appointments", kind: "bookings", color: "#1a1a1a", initials: "S", domain: "squareup.com", blurb: "Services, staff and bookings." },
  { id: "acuity", name: "Acuity Scheduling", kind: "bookings", color: "#0f766e", initials: "A", domain: "acuityscheduling.com", blurb: "Appointment types and calendars." },
  { id: "fresha", name: "Fresha", kind: "bookings", color: "#7c3aed", initials: "F", domain: "fresha.com", blurb: "Salon and barber menus." },
  { id: "booksy", name: "Booksy", kind: "bookings", color: "#0ea5e9", initials: "B", domain: "booksy.com", blurb: "Services and staff schedules." },
  { id: "zoho", name: "Zoho Bookings", kind: "bookings", color: "#e42527", initials: "Z", domain: "zoho.com", blurb: "Workspaces and services." },
  { id: "setmore", name: "Setmore", kind: "bookings", color: "#f97316", initials: "S", domain: "setmore.com", blurb: "Services and staff." },
  { id: "gcal", name: "Google Calendar", kind: "bookings", color: "#1a73e8", initials: "G", domain: "google.com", blurb: "Busy times only, we add the services." },
];

export const EVENT_PROVIDERS: Provider[] = [
  { id: "wix-events", name: "Wix Events", kind: "events", color: "#116dff", initials: "W", domain: "wix.com", native: true, blurb: "Already on Wix? Nothing to connect." },
  { id: "eventbrite", name: "Eventbrite", kind: "events", color: "#f05537", initials: "E", domain: "eventbrite.com", blurb: "Public events and ticket classes." },
  { id: "ticketmaster", name: "Ticketmaster", kind: "events", color: "#026cdf", initials: "T", domain: "ticketmaster.com", blurb: "Via Universe for organizers." },
  { id: "dice", name: "DICE", kind: "events", color: "#000000", initials: "D", domain: "dice.fm", blurb: "Gigs, club nights, comedy." },
  { id: "luma", name: "Luma", kind: "events", color: "#ec4899", initials: "L", domain: "lu.ma", blurb: "Community events and RSVPs." },
  { id: "humanitix", name: "Humanitix", kind: "events", color: "#ffb800", initials: "H", domain: "humanitix.com", blurb: "Events and ticket types." },
  { id: "meetup", name: "Meetup", kind: "events", color: "#f64060", initials: "M", domain: "meetup.com", blurb: "Group events." },
  { id: "tixr", name: "Tixr", kind: "events", color: "#111827", initials: "T", domain: "tixr.com", blurb: "Festivals and venues." },
];

export const ALL_PROVIDERS = [...BOOKING_PROVIDERS, ...EVENT_PROVIDERS];

export const BUSINESS_CATEGORIES: Record<string, string[]> = {
  "Beauty & wellness": ["Barber shop", "Hair salon", "Nail studio", "Spa & massage", "Tattoo studio"],
  "Food & drink": ["Restaurant", "Café", "Bar", "Bakery", "Food truck"],
  "Events & entertainment": ["Venue", "Promoter", "Comedy club", "Theatre", "Festival"],
  "Fitness": ["Gym", "Yoga studio", "Pilates", "Personal trainer", "Climbing gym"],
  "Classes & workshops": ["Art studio", "Cooking school", "Music teacher", "Language school"],
  "Health": ["Dentist", "Physiotherapy", "Nutritionist", "Therapist"],
  "Home services": ["Cleaning", "Plumbing", "Electrician", "Handyman"],
  "Professional services": ["Consultant", "Accountant", "Photographer", "Lawyer"],
};
