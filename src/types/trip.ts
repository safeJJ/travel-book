export type ConfirmedDates = {
  label: string;
  start: string;
  end: string;
};

export type TripSettings = {
  name: string;
  destination: string;
  leader: string;
  inviteEnabled: boolean;
  inviteCode: string;
};

export type DailyActivity = {
  id: number;
  time: string;
  title: string;
  note: string;
};

export type DailyPlan = Record<string, DailyActivity[]>;

export type FundTransaction = {
  id: number;
  kind: "income" | "expense";
  title: string;
  amount: number;
  createdAt: string;
  createdBy: string;
};
