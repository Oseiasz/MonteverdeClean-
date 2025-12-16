export interface Apartment {
  id: string;
  name: string;
  number: string;
}

export interface ScheduleItem {
  startDate: Date;
  endDate: Date;
  apartment: Apartment;
  isCurrentWeek: boolean;
}

export interface AppSettings {
  apartments: Apartment[];
  cycleStartDate: string; // ISO string YYYY-MM-DD
  myApartmentId: string | null;
}

export interface Task {
  id: string;
  label: string;
}