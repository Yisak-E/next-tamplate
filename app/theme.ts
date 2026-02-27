"use client";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4A5C92",
      light: "#DBE1FF",
      dark: "#324478",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#414659",
      light: "#DDE1F9",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#BA1A1A",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#FAF8FF",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1A1B21",
      secondary: "#49454F",
    },
    divider: "#CAC4D0",
  },
  typography: {
    fontFamily: "var(--font-roboto), Roboto, sans-serif",
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#FAF8FF",
        },
      },
    },
  },
});

export default theme;
