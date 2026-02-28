"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Checkbox from "@mui/material/Checkbox";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import SyncOutlined from "@mui/icons-material/SyncOutlined";
import ArrowDropDown from "@mui/icons-material/ArrowDropDown";
import CheckIcon from "@mui/icons-material/Check";
import InboxIcon from "@mui/icons-material/InboxOutlined";
import SendIcon from "@mui/icons-material/SendOutlined";
import DraftsIcon from "@mui/icons-material/DraftsOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import ReportIcon from "@mui/icons-material/ReportOutlined";
import StarIcon from "@mui/icons-material/StarOutlined";
import { useAuth } from "../context/AuthContext";
import {
  emailApi,
  type MailboxEmail,
  type FetchEmailsParams,
} from "../lib/api";
import type { EmailFolder } from "../types";

const AVATAR_COLORS = [
  "#7B6BA8", "#5C8A5C", "#C4A265", "#6B8EAD",
  "#AD6B6B", "#4A5C92", "#BA1A1A",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const oneDay = 86_400_000;

  if (diff < oneDay && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }
  if (diff < 2 * oneDay) return "Yesterday";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const FOLDER_ITEMS: { key: EmailFolder; label: string; icon: React.ReactNode }[] = [
  { key: "inbox",   label: "Inbox",    icon: <InboxIcon fontSize="small" /> },
  { key: "sent",    label: "Sent",     icon: <SendIcon fontSize="small" /> },
  { key: "drafts",  label: "Drafts",   icon: <DraftsIcon fontSize="small" /> },
  { key: "trash",   label: "Trash",    icon: <DeleteIcon fontSize="small" /> },
  { key: "spam",    label: "Spam",     icon: <ReportIcon fontSize="small" /> },
  { key: "starred", label: "Starred",  icon: <StarIcon fontSize="small" /> },
];

interface EmailListProps {
  folder: EmailFolder;
  onSelectEmail: (email: MailboxEmail) => void;
  onFolderChange?: (folder: EmailFolder) => void;
  selectedUid?: number;
  /** Called when the set of checked emails changes (for bulk actions) */
  onSelectionChange?: (uids: number[]) => void;
}

const filterChips = ["All", "Read", "Today", "Unread"];

type FilterKey = "all" | "seen" | "today" | "unseen";
const filterMap: Record<string, FilterKey> = {
  All: "all",
  Read: "seen",
  Today: "today",
  Unread: "unseen",
};

const FOLDER_LABELS: Record<EmailFolder, string> = {
  inbox: "Inbox",
  sent: "Sent",
  drafts: "Drafts",
  trash: "Trash",
  spam: "Spam",
  starred: "Starred",
};

// ── Module-level cache so data survives re-renders / remounts ──
interface CachedFolder {
  emails: MailboxEmail[];
  total: number;
  ts: number; // timestamp of last fetch
}
const folderCache = new Map<string, CachedFolder>();
const CACHE_TTL = 5 * 60 * 1000; // 5 min – background refresh after this

function cacheKey(folder: string, filter: string) {
  return `${folder}::${filter}`;
}

export function invalidateFolderCache(folder?: EmailFolder) {
  if (folder) {
    for (const k of folderCache.keys()) {
      if (k.startsWith(`${folder}::`)) folderCache.delete(k);
    }
  } else {
    folderCache.clear();
  }
}

/** Update a single email in every cache entry for the given folder */
export function updateEmailInCache(
  folder: string,
  uid: number,
  patch: Partial<MailboxEmail>
) {
  for (const [key, cached] of folderCache.entries()) {
    if (key.startsWith(`${folder}::`)) {
      cached.emails = cached.emails.map((e) =>
        e.uid === uid ? { ...e, ...patch } : e
      );
    }
  }
}

/** Remove an email from every cache entry for the given folder */
export function removeEmailFromCache(folder: string, uid: number) {
  for (const [key, cached] of folderCache.entries()) {
    if (key.startsWith(`${folder}::`)) {
      cached.emails = cached.emails.filter((e) => e.uid !== uid);
      cached.total = Math.max(0, cached.total - 1);
    }
  }
}

export default function EmailList({
  folder,
  onSelectEmail,
  onFolderChange,
  selectedUid,
  onSelectionChange,
}: EmailListProps) {
  const { token } = useAuth();

  // Initialise state directly from cache so the very first render already has data
  const initCached = folderCache.get(cacheKey(folder, "All"));
  const [emails, setEmails] = useState<MailboxEmail[]>(initCached?.emails ?? []);
  const [total, setTotal] = useState(initCached?.total ?? 0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // ── Group selection state ──
  const [checkedUids, setCheckedUids] = useState<Set<number>>(new Set());
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchronously hydrate from cache whenever folder or filter changes
  // (runs before useEffect, so UI never shows stale folder data)
  const [prevKey, setPrevKey] = useState(cacheKey(folder, "All"));
  const currentKey = cacheKey(folder, activeFilter);
  // Clear selection when folder/filter changes
  if (currentKey !== prevKey) {
    setPrevKey(currentKey);
    setCheckedUids(new Set());
    const snap = folderCache.get(currentKey);
    if (snap) {
      setEmails(snap.emails);
      setTotal(snap.total);
      setLoading(false);
    } else {
      setEmails([]);
      setTotal(0);
    }
  }

  const fetchEmails = useCallback(
    async (opts?: { force?: boolean }) => {
      if (!token) return;

      const key = cacheKey(folder, activeFilter);
      const cached = folderCache.get(key);
      const isStale = !cached || Date.now() - cached.ts > CACHE_TTL;

      // If cache is fresh and not forced, skip network entirely
      if (cached && !isStale && !opts?.force) return;

      // Only show spinner when there's nothing cached to display
      if (!cached) setLoading(true);

      try {
        const params: FetchEmailsParams = { limit: 50 };
        if (activeFilter === "Read") params.flag = "seen";
        else if (activeFilter === "Unread") params.flag = "unseen";
        else if (activeFilter === "Today") {
          params.since = new Date().toISOString().split("T")[0];
        }

        const fetcher =
          emailApi[folder as keyof typeof emailApi] as typeof emailApi.inbox;
        const result = await fetcher(token, params);

        folderCache.set(key, {
          emails: result.emails,
          total: result.total,
          ts: Date.now(),
        });

        setEmails(result.emails);
        setTotal(result.total);
      } catch (err) {
        console.error("Failed to fetch emails:", err);
      } finally {
        setLoading(false);
      }
    },
    [token, folder, activeFilter]
  );

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  // Notify parent whenever checked set changes
  useEffect(() => {
    onSelectionChange?.(Array.from(checkedUids));
  }, [checkedUids, onSelectionChange]);

  // ── Selection helpers ──
  const toggleCheck = (uid: number) => {
    setCheckedUids((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  const allChecked = emails.length > 0 && checkedUids.size === emails.length;
  const someChecked = checkedUids.size > 0 && !allChecked;

  const toggleAll = () => {
    if (allChecked) {
      setCheckedUids(new Set());
    } else {
      setCheckedUids(new Set(emails.map((e) => e.uid)));
    }
  };

  // ── Refresh handler (spins icon, invalidates cache, re-fetches) ──
  const handleRefresh = useCallback(() => {
    if (refreshing) return;
    setRefreshing(true);
    invalidateFolderCache(folder);
    fetchEmails({ force: true }).finally(() => {
      // Keep spinning at least 600ms so the user sees it
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = setTimeout(() => setRefreshing(false), 600);
    });
  }, [refreshing, folder, fetchEmails]);

  const handleFilterClick = (label: string) => {
    setActiveFilter(label);
  };

  const handleClear = () => {
    setActiveFilter("All");
  };

  const unseenCount = emails.filter((e) => !e.isRead).length;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: 450,
        flexShrink: 0,
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 44,
          px: 0,
        }}
      >
        <IconButton
          size="small"
          sx={{ color: "#1A1B21" }}
          onClick={(e) => setMenuAnchor(e.currentTarget)}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          slotProps={{ paper: { sx: { minWidth: 180, borderRadius: "12px", mt: 0.5 } } }}
        >
          {FOLDER_ITEMS.map((item) => (
            <MenuItem
              key={item.key}
              selected={item.key === folder}
              onClick={() => {
                onFolderChange?.(item.key);
                setMenuAnchor(null);
              }}
              sx={{
                gap: 1,
                borderRadius: "8px",
                mx: 0.5,
                "&.Mui-selected": { bgcolor: "rgba(74,92,146,0.10)" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: item.key === folder ? "#4A5C92" : "#49454F" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  sx: {
                    fontSize: 14,
                    fontWeight: item.key === folder ? 600 : 400,
                    color: item.key === folder ? "#4A5C92" : "#1A1B21",
                  },
                }}
              />
            </MenuItem>
          ))}
        </Menu>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            size="small"
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{
              color: "#49454F",
              animation: refreshing ? "spin 0.8s linear infinite" : "none",
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          >
            <SyncOutlined sx={{ fontSize: 24 }} />
          </IconButton>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 500,
              lineHeight: "24px",
              letterSpacing: 0.15,
              color: "#000",
            }}
          >
            {FOLDER_LABELS[folder]} ({unseenCount > 0 ? unseenCount : total})
          </Typography>
          <ArrowDropDown sx={{ color: "#49454F" }} />
        </Box>
        <Checkbox
          checked={allChecked}
          indeterminate={someChecked}
          onChange={toggleAll}
          sx={{
            color: "#45464F",
            "&.Mui-checked": { color: "#4A5C92" },
            "&.MuiCheckbox-indeterminate": { color: "#4A5C92" },
            p: 0.5,
          }}
        />
      </Box>

      {/* Filter Chips */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          height: 44,
          overflow: "hidden",
        }}
      >
        {filterChips.map((label) => {
          const isActive = activeFilter === label;
          return (
            <Chip
              key={label}
              label={label}
              icon={isActive ? <CheckIcon sx={{ fontSize: 18 }} /> : undefined}
              variant={isActive ? "filled" : "outlined"}
              clickable
              onClick={() => handleFilterClick(label)}
              sx={{
                height: 32,
                borderRadius: "8px",
                fontWeight: 500,
                fontSize: 14,
                letterSpacing: 0.1,
                ...(isActive
                  ? {
                      bgcolor: "#DDE1F9",
                      color: "#414659",
                      "&:hover": { bgcolor: "#CDD1E9" },
                      "& .MuiChip-icon": { color: "#414659" },
                    }
                  : {
                      borderColor: "#757680",
                      color: "#45464F",
                    }),
              }}
            />
          );
        })}
        <Box sx={{ flex: 1 }} />
        <Button
          variant="text"
          onClick={handleClear}
          sx={{
            color: "#4A5C92",
            fontWeight: 500,
            fontSize: 14,
            letterSpacing: 0.1,
            textTransform: "none",
            minWidth: "auto",
          }}
        >
          Clear
        </Button>
      </Box>

      <Divider sx={{ borderColor: "#CAC4D0" }} />

      {/* Email List */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          bgcolor: "#FAF8FF",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <CircularProgress sx={{ color: "#4A5C92" }} />
          </Box>
        ) : emails.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Typography sx={{ fontSize: 14, color: "#757680" }}>
              No emails found
            </Typography>
          </Box>
        ) : (
          emails.map((email) => {
            const senderName = email.from?.name || email.from?.address || "Unknown";
            const color = getAvatarColor(senderName);
            const initials = getInitials(senderName);
            const isSelected = selectedUid === email.uid;
            const isChecked = checkedUids.has(email.uid);

            return (
              <Box key={email.uid}>
                <Box
                  onClick={() => onSelectEmail(email)}
                  sx={{
                    display: "flex",
                    gap: 2,
                    pl: 1,
                    pr: 3,
                    py: 1.5,
                    cursor: "pointer",
                    bgcolor: isChecked
                      ? "rgba(74,92,146,0.12)"
                      : isSelected
                        ? "rgba(74,92,146,0.08)"
                        : "transparent",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                    transition: "background-color 0.15s",
                    alignItems: "center",
                  }}
                >
                  {/* Checkbox */}
                  <Checkbox
                    checked={isChecked}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleCheck(email.uid)}
                    size="small"
                    sx={{
                      color: "#757680",
                      "&.Mui-checked": { color: "#4A5C92" },
                      p: 0.5,
                      flexShrink: 0,
                    }}
                  />
                  {/* Avatar */}
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: color,
                      fontSize: 16,
                      fontWeight: 500,
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </Avatar>

                  {/* Content */}
                  <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 500,
                        lineHeight: "16px",
                        letterSpacing: 0.5,
                        color: "#49454F",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {email.subject || "(no subject)"}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 16,
                        fontWeight: email.isRead ? 400 : 600,
                        lineHeight: "24px",
                        letterSpacing: 0.5,
                        color: "#1A1B21",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {senderName}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 400,
                        lineHeight: "20px",
                        letterSpacing: 0.25,
                        color: "#49454F",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {email.snippet || email.text?.slice(0, 80) || ""}
                    </Typography>
                  </Box>

                  {/* Trailing */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.25,
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 500,
                        lineHeight: "16px",
                        letterSpacing: 0.5,
                        color: "#49454F",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(email.date)}
                    </Typography>
                    {!email.isRead && (
                      <Box
                        sx={{
                          bgcolor: "#BA1A1A",
                          borderRadius: "100px",
                          width: 10,
                          height: 10,
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </Box>
                </Box>
                <Divider sx={{ borderColor: "#CAC4D0" }} />
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}
