"use client";
import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import type { CalendarEvent } from "../types";

interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, "id">) => void;
  event: CalendarEvent | null;
  selectedDate: string;
  colors: string[];
}

export default function EventDialog({
  open,
  onClose,
  onSave,
  event,
  selectedDate,
  colors,
}: EventDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [color, setColor] = useState(colors[0]);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description);
      setDate(event.date);
      setStartTime(event.startTime);
      setEndTime(event.endTime);
      setColor(event.color);
    } else {
      setTitle("");
      setDescription("");
      setDate(selectedDate);
      setStartTime("09:00");
      setEndTime("10:00");
      setColor(colors[0]);
    }
  }, [event, selectedDate, colors, open]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({ title, description, date, startTime, endTime, color });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: "16px" },
      }}
    >
      <DialogTitle sx={{ fontWeight: 500, color: "#1A1B21" }}>
        {event ? "Edit Event" : "New Event"}
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
          autoFocus
          size="small"
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={2}
          size="small"
        />
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          fullWidth
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Start Time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="End Time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
        <Box>
          <Box sx={{ fontSize: 12, color: "#49454F", mb: 0.5 }}>Color</Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            {colors.map((c) => (
              <Box
                key={c}
                onClick={() => setColor(c)}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  bgcolor: c,
                  cursor: "pointer",
                  border: color === c ? "3px solid #1A1B21" : "3px solid transparent",
                  transition: "border-color 0.15s",
                }}
              />
            ))}
          </Box>
        </Box>
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
          disabled={!title.trim()}
          sx={{
            textTransform: "none",
            bgcolor: "#4A5C92",
            "&:hover": { bgcolor: "#324478" },
          }}
        >
          {event ? "Save Changes" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
