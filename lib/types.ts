export type Currency =
  | "TWD"
  | "USD"
  | "CNY"
  | "NZD"
  | "JPY"
  | "EUR"
  | "GBP"
  | "CAD";

export type TransportOption = {
  tool: string;
  from: string;
  to: string;
  duration?: string;
  cost?: string;
  costAmount?: number;
  costCurrency?: Currency;
  note?: string;
};

export type MealBlock = {
  type: string;
  name: string;
  dishes?: string;
  cost?: string;
  costAmount?: number;
  costCurrency?: Currency;
};

export type ExperienceItem = {
  headline?: string;
  spot: string;
  cost?: string;
  costAmount?: number;
  costCurrency?: Currency;
  desc?: string;
};

export type TimelineType = "transport" | "meal" | "exp";

export type TimelineItem = {
  time: string;
  type: TimelineType;
  transport?: TransportOption;
  meal?: MealBlock;
  exp?: ExperienceItem;
};

export type HotelInfo = {
  name: string;
  checkin?: string | null;
  checkout?: string | null;
  cost?: string;
  costAmount?: number;
  costCurrency?: Currency;
  mapQ?: string;
  nights?: number;
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
