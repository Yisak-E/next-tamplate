export type ViewType = "email" | "calendar" | "contacts";

// Email folder type
export type EmailFolder =
  | "inbox"
  | "sent"
  | "drafts"
  | "trash"
  | "spam"
  | "starred";

// Calendar types — mapped from ApiCalendarEvent for UI display
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  color: string;
}

// Contact types — mapped from ApiContact for UI display
export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  avatarColor: string;
  notes?: string;
  isFavorite?: boolean;
  tags?: string[];
}
