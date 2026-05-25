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

export type MealBlock = {
  type: string;
  name: string;
  dishes?: string;
  cost?: string;
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
};

export type Trip = {
  id: string;
  owner_id: string | null;
  title: string;
  subtitle: string | null;
  start_date: string;
  end_date: string;
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
