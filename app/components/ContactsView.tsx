"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import type { Contact } from "../types";
import { useAuth } from "../context/AuthContext";
import {
  contactsApi,
  type ApiContact,
  type CreateContactDto,
} from "../lib/api";
import ContactDialog from "./ContactDialog";
import ConfirmDialog from "./ConfirmDialog";

const AVATAR_COLORS = [
  "#4A5C92", "#BA1A1A", "#5C8A5C", "#C4A265",
  "#7B6BA8", "#AD6B6B", "#6B8EAD",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function apiToContact(ac: ApiContact): Contact {
  return {
    id: ac._id,
    name: ac.name,
    email: ac.email,
    phone: ac.phone || "",
    company: ac.company || "",
    avatarColor: getAvatarColor(ac.name),
    notes: ac.notes,
    isFavorite: ac.isFavorite,
    tags: ac.tags,
  };
}

// ── Module-level contacts cache ──
interface CachedContacts {
  contacts: Contact[];
  total: number;
  ts: number;
}
const contactsCache = new Map<string, CachedContacts>();
const CONTACTS_CACHE_TTL = 5 * 60 * 1000; // 5 min

function contactsCacheKey(query: string) {
  return query || "__all__";
}

export function invalidateContactsCache() {
  contactsCache.clear();
}

export default function ContactsView() {
  const { token } = useAuth();

  // Initialise from cache so the very first render has data
  const initCached = contactsCache.get(contactsCacheKey(""));
  const [contacts, setContacts] = useState<Contact[]>(initCached?.contacts ?? []);
  const [total, setTotal] = useState(initCached?.total ?? 0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);

  // Synchronously hydrate from cache on search query change
  const [prevQuery, setPrevQuery] = useState("");
  if (searchQuery !== prevQuery) {
    setPrevQuery(searchQuery);
    const snap = contactsCache.get(contactsCacheKey(searchQuery));
    if (snap) {
      setContacts(snap.contacts);
      setTotal(snap.total);
    }
  }

  const fetchContacts = useCallback(async (opts?: { force?: boolean }) => {
    if (!token) return;

    const key = contactsCacheKey(searchQuery);
    const cached = contactsCache.get(key);
    const isStale = !cached || Date.now() - cached.ts > CONTACTS_CACHE_TTL;

    // If cache is fresh and not forced, skip network
    if (cached && !isStale && !opts?.force) return;

    if (!cached) setLoading(true);

    try {
      const result = await contactsApi.list(token, {
        q: searchQuery || undefined,
        limit: 100,
      });
      const mapped = result.contacts.map(apiToContact);

      contactsCache.set(key, {
        contacts: mapped,
        total: result.total,
        ts: Date.now(),
      });

      setContacts(mapped);
      setTotal(result.total);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    } finally {
      setLoading(false);
    }
  }, [token, searchQuery]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const sortedContacts = useMemo(
    () => [...contacts].sort((a, b) => a.name.localeCompare(b.name)),
    [contacts]
  );

  const handleCreate = () => {
    setEditingContact(null);
    setDialogOpen(true);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setDialogOpen(true);
  };

  const handleDeleteClick = (contact: Contact) => {
    setDeletingContact(contact);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!token || !deletingContact) return;

    // Optimistic: remove from UI immediately
    const removedContact = deletingContact;
    setContacts((prev) => prev.filter((c) => c.id !== removedContact.id));
    setTotal((prev) => Math.max(0, prev - 1));
    if (selectedContact?.id === removedContact.id) {
      setSelectedContact(null);
    }
    setDeletingContact(null);
    setDeleteDialogOpen(false);

    try {
      await contactsApi.delete(token, removedContact.id);
      invalidateContactsCache();
    } catch (err) {
      console.error("Failed to delete contact:", err);
      // Rollback: re-add the contact
      setContacts((prev) => [...prev, removedContact]);
      setTotal((prev) => prev + 1);
    }
  };

  const handleSave = async (data: {
    name: string;
    email: string;
    phone: string;
    company: string;
  }) => {
    if (!token) return;

    const dto: CreateContactDto = {
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      company: data.company || undefined,
    };

    // Close dialog immediately for responsiveness
    setDialogOpen(false);

    if (editingContact) {
      // Optimistic update
      const optimistic: Contact = {
        ...editingContact,
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        avatarColor: editingContact.avatarColor,
      };
      setContacts((prev) =>
        prev.map((c) => (c.id === editingContact.id ? optimistic : c))
      );
      if (selectedContact?.id === editingContact.id) {
        setSelectedContact(optimistic);
      }
      const prevContact = editingContact;
      setEditingContact(null);

      try {
        const updated = await contactsApi.update(token, prevContact.id, dto);
        const mapped = apiToContact(updated);
        setContacts((prev) =>
          prev.map((c) => (c.id === prevContact.id ? mapped : c))
        );
        if (selectedContact?.id === prevContact.id) {
          setSelectedContact(mapped);
        }
        invalidateContactsCache();
      } catch (err) {
        console.error("Failed to update contact:", err);
        // Rollback
        setContacts((prev) =>
          prev.map((c) => (c.id === prevContact.id ? prevContact : c))
        );
        if (selectedContact?.id === prevContact.id) {
          setSelectedContact(prevContact);
        }
      }
    } else {
      setEditingContact(null);
      try {
        const created = await contactsApi.create(token, dto);
        const mapped = apiToContact(created);
        setContacts((prev) => [...prev, mapped]);
        setTotal((prev) => prev + 1);
        setSelectedContact(mapped);
        invalidateContactsCache();
      } catch (err) {
        console.error("Failed to create contact:", err);
      }
    }
  };

  const getInitials = (c: Contact) => {
    const parts = c.name.trim().split(/\s+/);
    if (parts.length >= 2)
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return c.name.slice(0, 2).toUpperCase();
  };

  return (
    <Box sx={{ display: "flex", gap: "15px", flex: 1, overflow: "hidden" }}>
      {/* Contact List */}
      <Box
        sx={{
          width: 380,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Typography
            sx={{ fontSize: 18, fontWeight: 500, color: "#1A1B21" }}
          >
            Contacts ({total})
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{
              textTransform: "none",
              bgcolor: "#4A5C92",
              fontWeight: 500,
              "&:hover": { bgcolor: "#324478" },
            }}
          >
            New Contact
          </Button>
        </Box>

        {/* Search */}
        <TextField
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          size="small"
          sx={{
            mb: 1.5,
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              bgcolor: "#E8E7EF",
              "& fieldset": { border: "none" },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#49454F", fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
        />

        {/* List */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <CircularProgress sx={{ color: "#4A5C92" }} />
            </Box>
          ) : sortedContacts.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Typography sx={{ fontSize: 14, color: "#757680" }}>
                No contacts found
              </Typography>
            </Box>
          ) : (
            sortedContacts.map((contact) => (
              <Box key={contact.id}>
                <Box
                  onClick={() => setSelectedContact(contact)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 1.5,
                    py: 1.25,
                    cursor: "pointer",
                    borderRadius: "12px",
                    bgcolor:
                      selectedContact?.id === contact.id
                        ? "rgba(74,92,146,0.08)"
                        : "transparent",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                    transition: "background-color 0.15s",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: contact.avatarColor,
                      fontSize: 15,
                      fontWeight: 500,
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(contact)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#1A1B21",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {contact.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "#49454F",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {contact.company}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Box>

      {/* Contact Detail */}
      <Box
        sx={{
          flex: 1,
          bgcolor: "#FFFFFF",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {selectedContact ? (
          <>
            {/* Detail Header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 3,
                borderBottom: "1px solid #E8E7EF",
              }}
            >
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: selectedContact.avatarColor,
                  fontSize: 24,
                  fontWeight: 500,
                }}
              >
                {getInitials(selectedContact)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{ fontSize: 22, fontWeight: 500, color: "#1A1B21" }}
                >
                  {selectedContact.name}
                </Typography>
                <Typography sx={{ fontSize: 14, color: "#49454F" }}>
                  {selectedContact.company}
                </Typography>
              </Box>
              <Tooltip title="Edit">
                <IconButton
                  onClick={() => handleEdit(selectedContact)}
                  sx={{ color: "#49454F" }}
                >
                  <EditOutlined />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  onClick={() => handleDeleteClick(selectedContact)}
                  sx={{ color: "#BA1A1A" }}
                >
                  <DeleteOutline />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Detail Body */}
            <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <EmailOutlined sx={{ color: "#49454F", fontSize: 22 }} />
                <Box>
                  <Typography sx={{ fontSize: 12, color: "#757680", mb: 0.25 }}>
                    Email
                  </Typography>
                  <Typography
                    component="a"
                    href={`mailto:${selectedContact.email}`}
                    sx={{
                      fontSize: 14,
                      color: "#4A5C92",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {selectedContact.email}
                  </Typography>
                </Box>
              </Box>
              <Divider />
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <PhoneOutlined sx={{ color: "#49454F", fontSize: 22 }} />
                <Box>
                  <Typography sx={{ fontSize: 12, color: "#757680", mb: 0.25 }}>
                    Phone
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: "#1A1B21" }}>
                    {selectedContact.phone || "—"}
                  </Typography>
                </Box>
              </Box>
              <Divider />
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <BusinessOutlined sx={{ color: "#49454F", fontSize: 22 }} />
                <Box>
                  <Typography sx={{ fontSize: 12, color: "#757680", mb: 0.25 }}>
                    Company
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: "#1A1B21" }}>
                    {selectedContact.company || "—"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Typography sx={{ fontSize: 14, color: "#757680" }}>
              Select a contact to view details
            </Typography>
          </Box>
        )}
      </Box>

      {/* Contact Create/Edit Dialog */}
      <ContactDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingContact(null);
        }}
        onSave={handleSave}
        contact={editingContact}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Contact"
        message={`Are you sure you want to delete ${deletingContact?.name}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeletingContact(null);
        }}
      />
    </Box>
  );
}
