"use client";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import EditOutlined from "@mui/icons-material/EditOutlined";
import MailOutlined from "@mui/icons-material/MailOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import PersonOutlineOutlined from "@mui/icons-material/PersonOutlineOutlined";
import NotificationsOutlined from "@mui/icons-material/NotificationsOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import PaletteOutlined from "@mui/icons-material/PaletteOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import type { ViewType } from "../types";
import type { AuthUser } from "../lib/api";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  view: ViewType;
}

const navItems: NavItem[] = [
  { icon: <MailOutlined />, label: "Email", view: "email" },
  { icon: <CalendarTodayOutlined />, label: "Calendar", view: "calendar" },
  { icon: <PersonOutlineOutlined />, label: "Contacts", view: "contacts" },
];

interface NavigationRailProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  onCompose?: () => void;
  user?: AuthUser | null;
}

export default function NavigationRail({
  activeView,
  onViewChange,
  onCompose,
  user,
}: NavigationRailProps) {
  const initials = user
    ? user.username
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100%",
        width: 80,
        flexShrink: 0,
        py: 1,
      }}
    >
      {/* FAB */}
      <Fab
        size="medium"
        onClick={onCompose}
        sx={{
          bgcolor: "#FFD6F8",
          color: "#000",
          boxShadow: "0px 4px 8px 3px rgba(0,0,0,0.15), 0px 1px 3px 0px rgba(0,0,0,0.3)",
          borderRadius: "16px",
          "&:hover": { bgcolor: "#F0C0E8" },
          mb: 2,
        }}
      >
        <EditOutlined />
      </Fab>

      {/* Navigation Items */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
          flex: 1,
          pt: 1,
        }}
      >
        {navItems.map((item) => {
          const isActive = activeView === item.view;
          return (
            <Box
              key={item.label}
              onClick={() => onViewChange(item.view)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
                cursor: "pointer",
                width: "100%",
                pb: 0.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: isActive ? "#DDE1F9" : "transparent",
                  borderRadius: "100px",
                  px: 2,
                  py: 0.5,
                  transition: "background-color 0.2s",
                  "&:hover": {
                    bgcolor: isActive ? "#CDD1E9" : "rgba(0,0,0,0.04)",
                  },
                }}
              >
                {item.icon}
              </Box>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 500,
                  lineHeight: "16px",
                  letterSpacing: 0.5,
                  color: isActive ? "#1A1B21" : "#45464F",
                  textAlign: "center",
                }}
              >
                {item.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Bottom Icons */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          width: "100%",
        }}
      >
        <Badge
          badgeContent={25}
          color="error"
          sx={{
            "& .MuiBadge-badge": {
              fontSize: 11,
              fontWeight: 500,
              minWidth: 16,
              height: 16,
              borderRadius: "100px",
            },
          }}
        >
          <IconButton size="small" sx={{ color: "#49454F" }}>
            <NotificationsOutlined fontSize="small" />
          </IconButton>
        </Badge>
        <IconButton size="small" sx={{ color: "#49454F" }}>
          <LightModeOutlined fontSize="small" />
        </IconButton>
        <IconButton size="small" sx={{ color: "#49454F" }}>
          <PaletteOutlined fontSize="small" />
        </IconButton>
        <IconButton size="small" sx={{ color: "#49454F" }}>
          <SettingsOutlined fontSize="small" />
        </IconButton>
        <Avatar
          sx={{
            width: 56,
            height: 56,
            bgcolor: "#DBE1FF",
            fontSize: 20,
            color: "#324478",
          }}
        >
          {initials}
        </Avatar>
      </Box>
    </Box>
  );
}
