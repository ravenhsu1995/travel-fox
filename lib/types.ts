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
  excluded?: boolean;
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
  excluded?: boolean;
};

export type Visibility = "private" | "unlisted" | "public";

export type Trip = {
  id: string;
  owner_id: string | null;
  title: string;
  subtitle: string | null;
  start_date: string;
  end_date: string;
  cover_emoji: string;
  is_public_sample: boolean;
  visibility: Visibility;
  share_token: string | null;
  public_display_name: string | null;
  created_at: string;
};

// Narrower projection for public / shared pages that must NOT carry
// owner_id or share_token. RPC `get_shared_trip_by_token` and /samples
// queries return this shape.
export type TripForView = Omit<Trip, "owner_id" | "share_token">;

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
  excluded: boolean;
  created_at: string;
};
