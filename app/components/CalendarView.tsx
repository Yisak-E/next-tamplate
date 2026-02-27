"use client";
import { useState, useCallback, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import type { CalendarEvent } from "../types";
import { calendarApi, type ApiCalendarEvent } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import EventDialog from "./EventDialog";
import ConfirmDialog from "./ConfirmDialog";

const COLORS = ["#4A5C92", "#BA1A1A", "#5C8A5C", "#C4A265", "#7B6BA8", "#AD6B6B", "#6B8EAD"];

function apiToEvent(e: ApiCalendarEvent): CalendarEvent {
  return {
    id: e._id,
    title: e.title,
    description: e.description ?? "",
    date: e.date,
    startTime: e.startTime,
    endTime: e.endTime,
    color: e.color ?? "#4A5C92",
  };
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function CalendarView() {
  const { token } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<CalendarEvent | null>(null);

  // Fetch events for the current month from the API
  const fetchEvents = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await calendarApi.list(token, {
        month: currentMonth + 1, // API expects 1-12
        year: currentYear,
        limit: 200,
      });
      setEvents(res.data.map(apiToEvent));
    } catch (err) {
      console.error("Failed to fetch calendar events", err);
    } finally {
      setLoading(false);
    }
  }, [token, currentMonth, currentYear]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(todayStr);
  };

  const eventsForDate = useCallback(
    (dateStr: string) => events.filter((e) => e.date === dateStr),
    [events]
  );

  const selectedEvents = eventsForDate(selectedDate);

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setDialogOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const handleDeleteClick = (event: CalendarEvent) => {
    setDeletingEvent(event);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingEvent && token) {
      try {
        await calendarApi.delete(token, deletingEvent.id);
        setEvents((prev) => prev.filter((e) => e.id !== deletingEvent.id));
      } catch (err) {
        console.error("Failed to delete event", err);
      }
      setDeletingEvent(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleSaveEvent = async (eventData: Omit<CalendarEvent, "id">) => {
    if (!token) return;
    try {
      if (editingEvent) {
        const updated = await calendarApi.update(token, editingEvent.id, {
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          startTime: eventData.startTime,
          endTime: eventData.endTime,
          color: eventData.color,
        });
        setEvents((prev) =>
          prev.map((e) => (e.id === editingEvent.id ? apiToEvent(updated) : e))
        );
      } else {
        const created = await calendarApi.create(token, {
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          startTime: eventData.startTime,
          endTime: eventData.endTime,
          color: eventData.color,
        });
        setEvents((prev) => [...prev, apiToEvent(created)]);
      }
    } catch (err) {
      console.error("Failed to save event", err);
    }
    setDialogOpen(false);
    setEditingEvent(null);
  };

  // Build calendar grid
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  return (
    <Box sx={{ display: "flex", gap: "15px", flex: 1, overflow: "hidden" }}>
      {/* Calendar Grid */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Month Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              sx={{ fontSize: 20, fontWeight: 500, color: "#1A1B21" }}
            >
              {MONTHS[currentMonth]} {currentYear}
            </Typography>
            <IconButton size="small" onClick={prevMonth}>
              <ChevronLeftIcon />
            </IconButton>
            <IconButton size="small" onClick={nextMonth}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={goToToday}
              sx={{
                textTransform: "none",
                borderColor: "#757680",
                color: "#4A5C92",
                fontWeight: 500,
              }}
            >
              Today
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleCreateEvent}
              sx={{
                textTransform: "none",
                bgcolor: "#4A5C92",
                fontWeight: 500,
                "&:hover": { bgcolor: "#324478" },
              }}
            >
              New Event
            </Button>
          </Box>
        </Box>

        {/* Day Headers */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 0,
          }}
        >
          {DAYS.map((day) => (
            <Box
              key={day}
              sx={{
                textAlign: "center",
                py: 1,
                borderBottom: "1px solid #CAC4D0",
              }}
            >
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#49454F",
                  letterSpacing: 0.5,
                }}
              >
                {day}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Calendar Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            flex: 1,
          }}
        >
          {calendarDays.map((day, idx) => {
            const dateStr = day
              ? formatDate(currentYear, currentMonth, day)
              : "";
            const dayEvents = day ? eventsForDate(dateStr) : [];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;

            return (
              <Box
                key={idx}
                onClick={() => day && setSelectedDate(dateStr)}
                sx={{
                  minHeight: 80,
                  p: 0.5,
                  borderBottom: "1px solid #E8E7EF",
                  borderRight:
                    (idx + 1) % 7 !== 0 ? "1px solid #E8E7EF" : "none",
                  cursor: day ? "pointer" : "default",
                  bgcolor: isSelected
                    ? "rgba(74,92,146,0.06)"
                    : "transparent",
                  "&:hover": day
                    ? { bgcolor: "rgba(0,0,0,0.03)" }
                    : {},
                  transition: "background-color 0.15s",
                }}
              >
                {day && (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        mb: 0.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: isToday ? "#4A5C92" : "transparent",
                          color: isToday ? "#FFF" : "#1A1B21",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: isToday ? 600 : 400,
                          }}
                        >
                          {day}
                        </Typography>
                      </Box>
                    </Box>
                    {dayEvents.slice(0, 2).map((ev) => (
                      <Box
                        key={ev.id}
                        sx={{
                          bgcolor: ev.color,
                          color: "#FFF",
                          borderRadius: "4px",
                          px: 0.5,
                          py: 0.25,
                          mb: 0.25,
                          overflow: "hidden",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 10,
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {ev.title}
                        </Typography>
                      </Box>
                    ))}
                    {dayEvents.length > 2 && (
                      <Typography
                        sx={{
                          fontSize: 10,
                          color: "#49454F",
                          textAlign: "center",
                        }}
                      >
                        +{dayEvents.length - 2} more
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Event Sidebar */}
      <Box
        sx={{
          width: 320,
          flexShrink: 0,
          bgcolor: "#FFFFFF",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid #E8E7EF" }}>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 500,
              color: "#49454F",
              mb: 0.5,
            }}
          >
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#757680" }}>
            {selectedEvents.length} event{selectedEvents.length !== 1 ? "s" : ""}
          </Typography>
        </Box>

        <Box sx={{ flex: 1, overflow: "auto", p: 1 }}>
          {selectedEvents.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 1,
              }}
            >
              <Typography sx={{ fontSize: 14, color: "#757680" }}>
                No events for this day
              </Typography>
              <Button
                variant="text"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleCreateEvent}
                sx={{
                  textTransform: "none",
                  color: "#4A5C92",
                  fontWeight: 500,
                }}
              >
                Add Event
              </Button>
            </Box>
          ) : (
            selectedEvents
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((event) => (
                <Box
                  key={event.id}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    borderRadius: "12px",
                    borderLeft: `4px solid ${event.color}`,
                    bgcolor: "#FAF8FF",
                    "&:hover": { bgcolor: "#F0EFF7" },
                    transition: "background-color 0.15s",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#1A1B21",
                        flex: 1,
                      }}
                    >
                      {event.title}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.25 }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEditEvent(event)}
                          sx={{ color: "#49454F" }}
                        >
                          <EditOutlined sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(event)}
                          sx={{ color: "#BA1A1A" }}
                        >
                          <DeleteOutline sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mt: 0.5,
                    }}
                  >
                    <AccessTimeIcon
                      sx={{ fontSize: 14, color: "#757680" }}
                    />
                    <Typography sx={{ fontSize: 12, color: "#757680" }}>
                      {event.startTime} - {event.endTime}
                    </Typography>
                  </Box>
                  {event.description && (
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "#49454F",
                        mt: 0.5,
                        lineHeight: "18px",
                      }}
                    >
                      {event.description}
                    </Typography>
                  )}
                </Box>
              ))
          )}
        </Box>
      </Box>

      {/* Event Create/Edit Dialog */}
      <EventDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        event={editingEvent}
        selectedDate={selectedDate}
        colors={COLORS}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Event"
        message={`Are you sure you want to delete "${deletingEvent?.title}"?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeletingEvent(null);
        }}
      />
    </Box>
  );
}
