"use client";
import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import type { Contact } from "../types";

const AVATAR_COLORS = [
  "#4A5C92", "#BA1A1A", "#5C8A5C", "#C4A265",
  "#7B6BA8", "#AD6B6B", "#6B8EAD",
];

interface ContactDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (contact: Omit<Contact, "id" | "avatarColor">) => void;
  contact: Contact | null;
}

export default function ContactDialog({
  open,
  onClose,
  onSave,
  contact,
}: ContactDialogProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");

  useEffect(() => {
    if (contact) {
      setFirstName(contact.firstName);
      setLastName(contact.lastName);
      setEmail(contact.email);
      setPhone(contact.phone);
      setCompany(contact.company);
    } else {
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setCompany("");
    }
  }, [contact, open]);

  const handleSubmit = () => {
    if (!firstName.trim() || !lastName.trim()) return;
    onSave({ firstName, lastName, email, phone, company });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px" } }}
    >
      <DialogTitle sx={{ fontWeight: 500, color: "#1A1B21" }}>
        {contact ? "Edit Contact" : "New Contact"}
      </DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          pt: "8px !important",
        }}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
            required
            autoFocus
            size="small"
          />
          <TextField
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
            required
            size="small"
          />
        </Box>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          size="small"
        />
        <TextField
          label="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          fullWidth
          size="small"
        />
        <TextField
          label="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          fullWidth
          size="small"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          sx={{ textTransform: "none", color: "#49454F" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!firstName.trim() || !lastName.trim()}
          sx={{
            textTransform: "none",
            bgcolor: "#4A5C92",
            "&:hover": { bgcolor: "#324478" },
          }}
        >
          {contact ? "Save Changes" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
