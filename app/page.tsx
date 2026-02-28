"use client";
import { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MenuIcon from "@mui/icons-material/Menu";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import Tooltip from "@mui/material/Tooltip";
import NavigationRail from "./components/NavigationRail";
import EmailList, {
  invalidateFolderCache,
  updateEmailInCache,
  removeEmailFromCache,
} from "./components/EmailList";
import EmailDetail from "./components/EmailDetail";
import ComposeDialog from "./components/ComposeDialog";
import CalendarView from "./components/CalendarView";
import ContactsView from "./components/ContactsView";
import LoginPage from "./components/LoginPage";
import { useAuth } from "./context/AuthContext";
import type { ViewType, EmailFolder } from "./types";
import type { MailboxEmail } from "./lib/api";

export default function Home() {
  const { user, token, loading, logout } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>("email");
  const [activeFolder, setActiveFolder] = useState<EmailFolder>("inbox");
  const [selectedEmail, setSelectedEmail] = useState<MailboxEmail | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [emailListKey, setEmailListKey] = useState(0);
  // refresh key bumped when cache is invalidated – forces EmailList re-fetch

  const handleSelectEmail = useCallback(
    (email: MailboxEmail) => {
      setSelectedEmail(email);
      // Immediately mark as read in the list cache so the UI reflects it
      if (!email.isRead) {
        updateEmailInCache(email.folder || activeFolder, email.uid, {
          isRead: true,
        });
        setEmailListKey((k) => k + 1);
      }
    },
    [activeFolder]
  );

  /** Update a single email property in the list (star, read/unread) without full refresh */
  const handleUpdateEmail = useCallback(
    (uid: number, patch: Partial<MailboxEmail>) => {
      updateEmailInCache(activeFolder, uid, patch);
      setEmailListKey((k) => k + 1);
      // Also update the selected email so detail keeps in-sync
      setSelectedEmail((prev) =>
        prev && prev.uid === uid ? { ...prev, ...patch } : prev
      );
    },
    [activeFolder]
  );

  /** Remove an email from the list (delete / archive) and clear selection */
  const handleRemoveEmail = useCallback(
    (uid: number) => {
      removeEmailFromCache(activeFolder, uid);
      setSelectedEmail(null);
      setEmailListKey((k) => k + 1);
    },
    [activeFolder]
  );

  const handleRefreshList = useCallback(() => {
    setSelectedEmail(null);
    invalidateFolderCache(); // clear cached data so fresh emails are fetched
    setEmailListKey((k) => k + 1);
  }, []);

  const handleCompose = useCallback(() => {
    setComposeOpen(true);
  }, []);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          bgcolor: "#FAF8FF",
        }}
      >
        <CircularProgress sx={{ color: "#4A5C92" }} />
      </Box>
    );
  }

  // Show login page if not authenticated
  if (!user || !token) {
    return <LoginPage />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: "#FAF8FF",
        p: "15px",
        gap: "15px",
      }}
    >
      {/* Navigation Rail */}
      <NavigationRail
        activeView={activeView}
        onViewChange={(view) => {
          setActiveView(view);
          setSelectedEmail(null);
        }}
        onCompose={handleCompose}
        user={user}
      />

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {/* NavBar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: 56,
            gap: "15px",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {/* Logo Section */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              width: 450,
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 400,
                lineHeight: "24px",
                letterSpacing: 0.5,
                color: "#000",
                whiteSpace: "nowrap",
              }}
            >
              Simple-Client
            </Typography>
            <TextField
              variant="outlined"
              size="small"
              value={`(${user.username}) ${user.email}`}
              slotProps={{ input: { readOnly: true } }}
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  height: 48,
                  borderRadius: "4px",
                  fontSize: 16,
                  color: "#45464F",
                  letterSpacing: 0.5,
                  "& fieldset": {
                    borderColor: "#757680",
                  },
                  "&:hover fieldset": {
                    borderColor: "#45464F",
                  },
                },
              }}
            />
            <Tooltip title="Sign out">
              <IconButton size="small" onClick={logout} sx={{ color: "#49454F" }}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Search Bar (centered) */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "#E8E7EF",
                borderRadius: "28px",
                height: 56,
                width: "100%",
                maxWidth: 720,
                minWidth: 360,
                px: 0.5,
                gap: 0.5,
              }}
            >
              <IconButton sx={{ color: "#49454F" }}>
                <MenuIcon />
              </IconButton>
              <Typography
                sx={{
                  flex: 1,
                  fontSize: 16,
                  fontWeight: 400,
                  lineHeight: "24px",
                  letterSpacing: 0.5,
                  color: "#45464F",
                  cursor: "text",
                }}
              >
                Global Search
              </Typography>
              <IconButton sx={{ color: "#49454F" }}>
                <SearchIcon />
              </IconButton>
              <IconButton sx={{ color: "#49454F" }}>
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box
          sx={{
            display: "flex",
            gap: "15px",
            flex: 1,
            overflow: "hidden",
            borderRadius: "16px",
          }}
        >
          {activeView === "email" && (
            <>
              <EmailList
                key={emailListKey}
                folder={activeFolder}
                onSelectEmail={handleSelectEmail}
                onFolderChange={(f) => {
                  setActiveFolder(f);
                  setSelectedEmail(null);
                }}
                selectedUid={selectedEmail?.uid}
              />
              {selectedEmail ? (
                <EmailDetail
                  email={selectedEmail}
                  onRefreshList={handleRefreshList}
                  onUpdateEmail={handleUpdateEmail}
                  onRemoveEmail={handleRemoveEmail}
                />
              ) : (
                <Box
                  sx={{
                    flex: 1,
                    bgcolor: "#FFFFFF",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 0,
                  }}
                >
                  <Typography sx={{ fontSize: 14, color: "#757680" }}>
                    Select an email to read
                  </Typography>
                </Box>
              )}
            </>
          )}
          {activeView === "calendar" && <CalendarView />}
          {activeView === "contacts" && <ContactsView />}
        </Box>
      </Box>

      {/* Compose Email Dialog */}
      <ComposeDialog
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSent={handleRefreshList}
      />
    </Box>
  );
}
