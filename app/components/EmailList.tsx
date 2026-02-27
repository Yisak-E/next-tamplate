"use client";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Checkbox from "@mui/material/Checkbox";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import SyncOutlined from "@mui/icons-material/SyncOutlined";
import ArrowDropDown from "@mui/icons-material/ArrowDropDown";
import CheckIcon from "@mui/icons-material/Check";

interface EmailItem {
  id: number;
  subject: string;
  sender: string;
  preview: string;
  date: string;
  badgeCount?: number;
  avatarColor: string;
  avatarInitials: string;
}

const emails: EmailItem[] = [
  {
    id: 1,
    subject: "New Business Opportunities",
    sender: "Jack Smith",
    preview: "Dear Sam, Hope this email finds you well. I would like t...",
    date: "Now",
    badgeCount: 3,
    avatarColor: "#7B6BA8",
    avatarInitials: "JS",
  },
  {
    id: 2,
    subject: "RE: Project Progress",
    sender: "Sarah Pruett",
    preview: "Reminder on the mentioned bel...",
    date: "Yesterday",
    badgeCount: 2,
    avatarColor: "#5C8A5C",
    avatarInitials: "SP",
  },
  {
    id: 3,
    subject: "LPO Created",
    sender: "Jasmine Fields",
    preview: "Hello Sam, Cloud you please sign the issued LPO for the new pur...",
    date: "Yesterday",
    badgeCount: 5,
    avatarColor: "#C4A265",
    avatarInitials: "JF",
  },
  {
    id: 4,
    subject: "Insurance Requested Documents",
    sender: "Dan Trovalds",
    preview: "Dear Sam, I hope my message finds you in your best health ...",
    date: "02/Feb/2026",
    avatarColor: "#6B8EAD",
    avatarInitials: "DT",
  },
  {
    id: 5,
    subject: "Update Request",
    sender: "Christine Woods",
    preview: "Dear Sam, I would like you to prepare a detailed project up...",
    date: "22/Dec/2025",
    avatarColor: "#AD6B6B",
    avatarInitials: "CW",
  },
];

const filterChips = ["All", "Read", "Today", "Unread"];

export default function EmailList() {
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
        <IconButton size="small" sx={{ color: "#1A1B21" }}>
          <MenuIcon />
        </IconButton>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SyncOutlined sx={{ fontSize: 24, color: "#49454F" }} />
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 500,
              lineHeight: "24px",
              letterSpacing: 0.15,
              color: "#000",
            }}
          >
            Inbox (4)
          </Typography>
          <ArrowDropDown sx={{ color: "#49454F" }} />
        </Box>
        <Checkbox
          sx={{
            color: "#45464F",
            "&.Mui-checked": { color: "#4A5C92" },
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
        {filterChips.map((label, index) => (
          <Chip
            key={label}
            label={label}
            icon={index === 0 ? <CheckIcon sx={{ fontSize: 18 }} /> : undefined}
            variant={index === 0 ? "filled" : "outlined"}
            clickable
            sx={{
              height: 32,
              borderRadius: "8px",
              fontWeight: 500,
              fontSize: 14,
              letterSpacing: 0.1,
              ...(index === 0
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
        ))}
        <Box sx={{ flex: 1 }} />
        <Button
          variant="text"
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
        {emails.map((email) => (
          <Box key={email.id}>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                pl: 2,
                pr: 3,
                py: 1.5,
                cursor: "pointer",
                "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                transition: "background-color 0.15s",
              }}
            >
              {/* Avatar */}
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: email.avatarColor,
                  fontSize: 16,
                  fontWeight: 500,
                  flexShrink: 0,
                }}
              >
                {email.avatarInitials}
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
                  {email.subject}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 400,
                    lineHeight: "24px",
                    letterSpacing: 0.5,
                    color: "#1A1B21",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {email.sender}
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
                  {email.preview}
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
                  {email.date}
                </Typography>
                {email.badgeCount && (
                  <Box
                    sx={{
                      bgcolor: "#BA1A1A",
                      color: "#FFF",
                      borderRadius: "100px",
                      minWidth: 16,
                      height: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      px: 0.5,
                      fontSize: 11,
                      fontWeight: 500,
                      lineHeight: "16px",
                      letterSpacing: 0.5,
                    }}
                  >
                    {email.badgeCount}
                  </Box>
                )}
              </Box>
            </Box>
            <Divider sx={{ borderColor: "#CAC4D0" }} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
