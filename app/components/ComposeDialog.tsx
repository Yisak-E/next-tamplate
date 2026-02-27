"use client";
import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "../context/AuthContext";
import { emailApi } from "../lib/api";

interface ComposeDialogProps {
  open: boolean;
  onClose: () => void;
  onSent?: () => void;
}

export default function ComposeDialog({
  open,
  onClose,
  onSent,
}: ComposeDialogProps) {
  const { token } = useAuth();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [cc, setCc] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCc, setShowCc] = useState(false);

  const handleSend = async () => {
    if (!token || !to.trim() || !subject.trim()) return;
    setSending(true);
    setError(null);
    try {
      const ccList = cc
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await emailApi.send(token, {
        to: to.trim(),
        subject: subject.trim(),
        text: body,
        ...(ccList.length > 0 ? { cc: ccList } : {}),
      });
      // Reset form
      setTo("");
      setSubject("");
      setBody("");
      setCc("");
      setShowCc(false);
      onSent?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!sending) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px" } }}
    >
      <DialogTitle sx={{ fontWeight: 500, color: "#1A1B21" }}>
        New Message
      </DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          pt: "8px !important",
        }}
      >
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <TextField
          label="To"
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          fullWidth
          required
          autoFocus
          size="small"
        />
        {showCc ? (
          <TextField
            label="CC"
            value={cc}
            onChange={(e) => setCc(e.target.value)}
            fullWidth
            size="small"
            placeholder="Separate multiple with commas"
          />
        ) : (
          <Button
            variant="text"
            size="small"
            onClick={() => setShowCc(true)}
            sx={{
              textTransform: "none",
              color: "#4A5C92",
              fontWeight: 500,
              alignSelf: "flex-start",
              fontSize: 12,
              p: 0,
              minWidth: "auto",
            }}
          >
            + Add CC
          </Button>
        )}
        <TextField
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          fullWidth
          required
          size="small"
        />
        <TextField
          label="Message"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          fullWidth
          multiline
          rows={8}
          size="small"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
          disabled={sending}
          sx={{ textTransform: "none", color: "#49454F" }}
        >
          Discard
        </Button>
        <Button
          onClick={handleSend}
          variant="contained"
          disabled={sending || !to.trim() || !subject.trim()}
          sx={{
            textTransform: "none",
            bgcolor: "#4A5C92",
            "&:hover": { bgcolor: "#324478" },
          }}
        >
          {sending ? (
            <CircularProgress size={20} sx={{ color: "#fff" }} />
          ) : (
            "Send"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
