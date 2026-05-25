export type Currency = "JPY" | "NTD" | "KRW" | "VND" | "USD" | "TWD" | "EUR";

export type TransportOption = {
  tool: string;
  from: string;
  fromQ?: string;
  to: string;
  toQ?: string;
  duration?: string;
  cost?: string;
  note?: string;
  recommended?: boolean;
};

export type MealOption = {
  headline?: string;
  name: string;
  cost?: string;
  dishes?: string;
  desc?: string;
  mapQ?: string;
};

export type MealBlock = {
  type: string;
  options: MealOption[];
};

export type ExperienceItem = {
  headline?: string;
  spot: string;
  cost?: string;
  desc?: string;
  mapQ?: string;
};

export type TimelineItem = {
  time: string;
  label: string;
  mapQ?: string;
  coords?: [number, number];
  isHotelArrival?: boolean;
  transport?: TransportOption[];
  meals?: MealBlock[];
  exps?: ExperienceItem[];
};

export type HotelInfo = {
  name: string;
  checkin?: string | null;
  checkout?: string | null;
  cost?: string;
  mapQ?: string;
  url?: string;
};

export type Trip = {
  id: string;
  owner_id: string | null;
  title: string;
  subtitle: string | null;
  start_date: string;
  end_date: string;
  companions: string[];
  cover_emoji: string;
  is_public_sample: boolean;
  created_at: string;
};

export type Day = {
  id: string;
  trip_id: string;
  date: string;
  day_label: string | null;
  theme: string | null;
  hotel: HotelInfo | null;
  risks: string[];
  timeline: TimelineItem[];
  sort_order: number;
};

export type Expense = {
  id: string;
  trip_id: string;
  description: string;
  amount: number;
  currency: Currency;
  category: string;
  date: string;
  created_at: string;
};
