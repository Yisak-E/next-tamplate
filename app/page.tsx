"use client";
import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MenuIcon from "@mui/icons-material/Menu";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import NavigationRail from "./components/NavigationRail";
import EmailList from "./components/EmailList";
import CalendarView from "./components/CalendarView";
import ContactsView from "./components/ContactsView";
import type { ViewType } from "./types";

export default function Home() {
  const [activeView, setActiveView] = useState<ViewType>("email");

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
      <NavigationRail activeView={activeView} onViewChange={setActiveView} />

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
              defaultValue="(Sam Jones) sam.jones@..."
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
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" sx={{ color: "#49454F" }}>
                        <CancelOutlined />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
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
              <EmailList />
              <Box
                sx={{
                  flex: 1,
                  bgcolor: "#FFFFFF",
                  borderRadius: "16px",
                  minWidth: 0,
                }}
              />
            </>
          )}
          {activeView === "calendar" && <CalendarView />}
          {activeView === "contacts" && <ContactsView />}
        </Box>
      </Box>
    </Box>
  );
}
