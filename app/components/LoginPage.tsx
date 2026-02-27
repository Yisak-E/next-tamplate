"use client";
import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import MailOutlined from "@mui/icons-material/MailOutlined";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, register, error, loading, clearError } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
    } catch {
      // error is set in context
    }
  };

  const toggleMode = () => {
    clearError();
    setMode((m) => (m === "login" ? "register" : "login"));
  };

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
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: 400,
          bgcolor: "#FFFFFF",
          borderRadius: "16px",
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          boxShadow:
            "0px 4px 8px 3px rgba(0,0,0,0.08), 0px 1px 3px 0px rgba(0,0,0,0.16)",
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            mb: 1,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "16px",
              bgcolor: "#DBE1FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MailOutlined sx={{ color: "#4A5C92", fontSize: 28 }} />
          </Box>
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 500,
              color: "#1A1B21",
            }}
          >
            Simple-Client
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#49454F" }}>
            {mode === "login"
              ? "Sign in to your account"
              : "Create a new account"}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" onClose={clearError}>
            {error}
          </Alert>
        )}

        {mode === "register" && (
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            fullWidth
            size="small"
            autoFocus
          />
        )}

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          size="small"
          autoFocus={mode === "login"}
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          size="small"
          inputProps={{ minLength: 6 }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            textTransform: "none",
            bgcolor: "#4A5C92",
            fontWeight: 500,
            height: 44,
            "&:hover": { bgcolor: "#324478" },
          }}
        >
          {loading ? (
            <CircularProgress size={22} sx={{ color: "#fff" }} />
          ) : mode === "login" ? (
            "Sign In"
          ) : (
            "Create Account"
          )}
        </Button>

        <Box sx={{ textAlign: "center" }}>
          <Typography component="span" sx={{ fontSize: 14, color: "#49454F" }}>
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
          </Typography>
          <Typography
            component="span"
            onClick={toggleMode}
            sx={{
              fontSize: 14,
              fontWeight: 500,
              color: "#4A5C92",
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {mode === "login" ? "Sign Up" : "Sign In"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
