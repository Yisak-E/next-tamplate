export type ViewType = "email" | "calendar" | "contacts";

// Calendar types
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  color: string;
}

// Contact types
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  avatarColor: string;
}
