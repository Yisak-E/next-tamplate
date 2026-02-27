"use client";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import ArchiveOutlined from "@mui/icons-material/ArchiveOutlined";
import ReplyIcon from "@mui/icons-material/Reply";
import MarkEmailUnreadOutlined from "@mui/icons-material/MarkEmailUnreadOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useAuth } from "../context/AuthContext";
import { emailApi, type MailboxEmail } from "../lib/api";

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

interface EmailDetailProps {
  email: MailboxEmail;
  onRefreshList: () => void;
}

export default function EmailDetail({ email, onRefreshList }: EmailDetailProps) {
  const { token } = useAuth();
  const [fullEmail, setFullEmail] = useState<MailboxEmail>(email);
  const [loading, setLoading] = useState(false);

  // Fetch full email body on mount or email change
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    emailApi
      .getEmail(token, email.folder || "inbox", email.uid)
      .then((data) => {
        if (data) setFullEmail(data);
        else setFullEmail(email);
      })
      .catch(() => setFullEmail(email))
      .finally(() => setLoading(false));

    // Mark as read
    if (!email.isRead) {
      emailApi.markRead(token, email.folder || "inbox", email.uid).catch(() => {});
    }
  }, [token, email]);

  const senderName = fullEmail.from?.name || fullEmail.from?.address || "Unknown";
  const senderEmail = fullEmail.from?.address || "";
  const toNames = (fullEmail.to || [])
    .map((t) => t.name || t.address)
    .join(", ");

  const handleToggleStar = async () => {
    if (!token) return;
    try {
      await emailApi.toggleStar(
        token,
        fullEmail.folder || "inbox",
        fullEmail.uid,
        !fullEmail.isFlagged
      );
      setFullEmail((prev) => ({ ...prev, isFlagged: !prev.isFlagged }));
    } catch {
      // ignore
    }
  };

  const handleDelete = async () => {
    if (!token) return;
    try {
      await emailApi.deleteEmail(token, fullEmail.folder || "inbox", fullEmail.uid);
      onRefreshList();
    } catch {
      // ignore
    }
  };

  const handleMarkUnread = async () => {
    if (!token) return;
    try {
      await emailApi.markUnread(token, fullEmail.folder || "inbox", fullEmail.uid);
      onRefreshList();
    } catch {
      // ignore
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        bgcolor: "#FFFFFF",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        overflow: "hidden",
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
      ) : (
        <>
          {/* Top toolbar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 2,
              py: 1,
              borderBottom: "1px solid #E8E7EF",
            }}
          >
            <Tooltip title={fullEmail.isFlagged ? "Unstar" : "Star"}>
              <IconButton size="small" onClick={handleToggleStar}>
                {fullEmail.isFlagged ? (
                  <StarIcon sx={{ color: "#C4A265" }} />
                ) : (
                  <StarBorderIcon sx={{ color: "#49454F" }} />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Mark unread">
              <IconButton size="small" onClick={handleMarkUnread} sx={{ color: "#49454F" }}>
                <MarkEmailUnreadOutlined />
              </IconButton>
            </Tooltip>
            <Tooltip title="Archive">
              <IconButton size="small" sx={{ color: "#49454F" }}>
                <ArchiveOutlined />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={handleDelete} sx={{ color: "#BA1A1A" }}>
                <DeleteOutline />
              </IconButton>
            </Tooltip>
            <Box sx={{ flex: 1 }} />
            <Tooltip title="Reply">
              <IconButton size="small" sx={{ color: "#49454F" }}>
                <ReplyIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Subject */}
          <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
            <Typography
              sx={{ fontSize: 20, fontWeight: 500, color: "#1A1B21" }}
            >
              {fullEmail.subject || "(no subject)"}
            </Typography>
          </Box>

          {/* Sender row */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              px: 3,
              py: 1.5,
            }}
          >
            <Avatar
              sx={{
                width: 44,
                height: 44,
                bgcolor: getAvatarColor(senderName),
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              {getInitials(senderName)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#1A1B21",
                    whiteSpace: "nowrap",
                  }}
                >
                  {senderName}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#757680",
                    whiteSpace: "nowrap",
                  }}
                >
                  &lt;{senderEmail}&gt;
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 12, color: "#49454F" }}>
                To: {toNames}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 12, color: "#757680", flexShrink: 0 }}>
              {new Date(fullEmail.date).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          </Box>

          {/* Attachments */}
          {fullEmail.hasAttachments && fullEmail.attachments?.length > 0 && (
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                px: 3,
                pb: 1,
              }}
            >
              {fullEmail.attachments.map((att: unknown, i: number) => {
                const a = att as { filename?: string };
                return (
                  <Chip
                    key={i}
                    icon={<AttachFileIcon sx={{ fontSize: 16 }} />}
                    label={a.filename || `Attachment ${i + 1}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: "#CAC4D0",
                      color: "#49454F",
                      fontSize: 12,
                    }}
                  />
                );
              })}
            </Box>
          )}

          <Divider sx={{ borderColor: "#E8E7EF" }} />

          {/* Body */}
          <Box sx={{ flex: 1, overflow: "auto", px: 3, py: 2 }}>
            {fullEmail.html ? (
              <Box
                dangerouslySetInnerHTML={{ __html: fullEmail.html }}
                sx={{
                  fontSize: 14,
                  color: "#1A1B21",
                  lineHeight: 1.6,
                  "& img": { maxWidth: "100%" },
                  "& a": { color: "#4A5C92" },
                }}
              />
            ) : (
              <Typography
                sx={{
                  fontSize: 14,
                  color: "#1A1B21",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {fullEmail.text || ""}
              </Typography>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
