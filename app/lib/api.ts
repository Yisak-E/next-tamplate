const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// ─── helpers ────────────────────────────────────────────────────────────────

function authHeaders(token: string | null): HeadersInit {
  const h: HeadersInit = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  token: string | null = null
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(token), ...(init.headers as object) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? res.statusText, body);
  }
  // 204 No Content
  if (res.status === 204) return {} as T;
  return res.json();
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
}

export const authApi = {
  register(data: {
    username: string;
    email: string;
    password: string;
    roles?: string[];
  }) {
    return request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login(data: { email: string; password: string }) {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  profile(token: string) {
    return request<AuthUser>("/auth/profile", {}, token);
  },
};

// ─── Email types ─────────────────────────────────────────────────────────────

export interface EmailAddress {
  name: string;
  address: string;
}

export interface MailboxEmail {
  uid: number;
  messageId: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc: EmailAddress[];
  subject: string;
  text: string;
  html: string;
  date: string;
  flags: string[];
  isRead: boolean;
  isFlagged: boolean;
  hasAttachments: boolean;
  attachments: unknown[];
  folder: string;
  size: number;
  snippet: string;
}

export interface FetchEmailsResult {
  emails: MailboxEmail[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  folder: string;
}

export interface MailboxInfo {
  name: string;
  path: string;
  totalMessages: number;
  unseenMessages: number;
  recentMessages: number;
}

export interface FetchEmailsParams {
  email?: string;
  from?: string;
  to?: string;
  limit?: number;
  skip?: number;
  mailbox?: string;
  since?: string;
  before?: string;
  subject?: string;
  body?: string;
  folder?: string;
  flag?: "seen" | "unseen" | "flagged" | "unflagged";
}

function buildQuery(params: FetchEmailsParams): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
}

// ─── Email API ───────────────────────────────────────────────────────────────

export const emailApi = {
  mailboxes(token: string) {
    return request<MailboxInfo[]>("/email/mailboxes", {}, token);
  },

  inbox(token: string, params: FetchEmailsParams = {}) {
    return request<FetchEmailsResult>(
      `/email/inbox${buildQuery(params)}`,
      {},
      token
    );
  },

  sent(token: string, params: FetchEmailsParams = {}) {
    return request<FetchEmailsResult>(
      `/email/sent${buildQuery(params)}`,
      {},
      token
    );
  },

  drafts(token: string, params: FetchEmailsParams = {}) {
    return request<FetchEmailsResult>(
      `/email/drafts${buildQuery(params)}`,
      {},
      token
    );
  },

  trash(token: string, params: FetchEmailsParams = {}) {
    return request<FetchEmailsResult>(
      `/email/trash${buildQuery(params)}`,
      {},
      token
    );
  },

  spam(token: string, params: FetchEmailsParams = {}) {
    return request<FetchEmailsResult>(
      `/email/spam${buildQuery(params)}`,
      {},
      token
    );
  },

  starred(token: string, params: FetchEmailsParams = {}) {
    return request<FetchEmailsResult>(
      `/email/starred${buildQuery(params)}`,
      {},
      token
    );
  },

  folder(token: string, folderName: string, params: FetchEmailsParams = {}) {
    return request<FetchEmailsResult>(
      `/email/folder/${encodeURIComponent(folderName)}${buildQuery(params)}`,
      {},
      token
    );
  },

  getEmail(token: string, folder: string, uid: number) {
    return request<MailboxEmail>(
      `/email/${encodeURIComponent(folder)}/${uid}`,
      {},
      token
    );
  },

  // ── Actions ──

  markRead(token: string, folder: string, uid: number) {
    return request<{ success: boolean; message: string; uid: number }>(
      `/email/${encodeURIComponent(folder)}/${uid}/read`,
      { method: "PATCH" },
      token
    );
  },

  markUnread(token: string, folder: string, uid: number) {
    return request<{ success: boolean; message: string; uid: number }>(
      `/email/${encodeURIComponent(folder)}/${uid}/unread`,
      { method: "PATCH" },
      token
    );
  },

  toggleStar(token: string, folder: string, uid: number, starred: boolean) {
    return request<{ success: boolean; message: string; uid: number }>(
      `/email/${encodeURIComponent(folder)}/${uid}/star`,
      { method: "PATCH", body: JSON.stringify({ starred }) },
      token
    );
  },

  moveEmail(token: string, folder: string, uid: number, toFolder: string) {
    return request<{ success: boolean; message: string; uid: number }>(
      `/email/${encodeURIComponent(folder)}/${uid}/move`,
      { method: "PATCH", body: JSON.stringify({ toFolder }) },
      token
    );
  },

  deleteEmail(
    token: string,
    folder: string,
    uid: number,
    permanent?: boolean
  ) {
    const q = permanent ? "?permanent=true" : "";
    return request<{ success: boolean; message: string; uid: number }>(
      `/email/${encodeURIComponent(folder)}/${uid}${q}`,
      { method: "DELETE" },
      token
    );
  },

  // ── Send ──

  send(
    token: string,
    data: {
      to: string;
      subject: string;
      text?: string;
      html?: string;
      cc?: string[];
      bcc?: string[];
    }
  ) {
    return request<{
      messageId: string;
      accepted: string[];
      rejected: string[];
      response: string;
    }>("/email/send", { method: "POST", body: JSON.stringify(data) }, token);
  },
};

// ─── Contact types ───────────────────────────────────────────────────────────

export interface ApiContact {
  _id: string;
  id?: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
  avatarUrl: string;
  isFavorite: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ContactListResult {
  contacts: ApiContact[];
  total: number;
  limit: number;
  skip: number;
}

export interface CreateContactDto {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  notes?: string;
  avatarUrl?: string;
  isFavorite?: boolean;
  tags?: string[];
}

// ─── Contacts API ────────────────────────────────────────────────────────────

export const contactsApi = {
  list(
    token: string,
    params: {
      q?: string;
      tag?: string;
      favorites?: boolean;
      limit?: number;
      skip?: number;
    } = {}
  ) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    });
    const q = qs.toString();
    return request<ContactListResult>(
      `/contacts${q ? `?${q}` : ""}`,
      {},
      token
    );
  },

  get(token: string, id: string) {
    return request<ApiContact>(`/contacts/${id}`, {}, token);
  },

  create(token: string, data: CreateContactDto) {
    return request<ApiContact>(
      "/contacts",
      { method: "POST", body: JSON.stringify(data) },
      token
    );
  },

  update(token: string, id: string, data: Partial<CreateContactDto>) {
    return request<ApiContact>(
      `/contacts/${id}`,
      { method: "PATCH", body: JSON.stringify(data) },
      token
    );
  },

  delete(token: string, id: string) {
    return request<ApiContact>(`/contacts/${id}`, { method: "DELETE" }, token);
  },
};

// ─── Calendar types ──────────────────────────────────────────────────────────

export interface ApiCalendarEvent {
  _id: string;
  userId: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  color: string;
  isAllDay: boolean;
  location: string;
  reminders: number[];
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEventListResult {
  data: ApiCalendarEvent[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateCalendarEventDto {
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  color?: string;
  isAllDay?: boolean;
  location?: string;
  reminders?: number[];
}

// ─── Calendar API ────────────────────────────────────────────────────────────

export const calendarApi = {
  list(
    token: string,
    params: {
      from?: string;
      to?: string;
      month?: number;
      year?: number;
      q?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    });
    const q = qs.toString();
    return request<CalendarEventListResult>(
      `/calendar${q ? `?${q}` : ""}`,
      {},
      token
    );
  },

  get(token: string, id: string) {
    return request<ApiCalendarEvent>(`/calendar/${id}`, {}, token);
  },

  create(token: string, data: CreateCalendarEventDto) {
    return request<ApiCalendarEvent>(
      "/calendar",
      { method: "POST", body: JSON.stringify(data) },
      token
    );
  },

  update(token: string, id: string, data: Partial<CreateCalendarEventDto>) {
    return request<ApiCalendarEvent>(
      `/calendar/${id}`,
      { method: "PATCH", body: JSON.stringify(data) },
      token
    );
  },

  delete(token: string, id: string) {
    return request<void>(`/calendar/${id}`, { method: "DELETE" }, token);
  },
};
