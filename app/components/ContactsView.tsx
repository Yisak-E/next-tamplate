"use client";
import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import type { Contact } from "../types";
import ContactDialog from "./ContactDialog";
import ConfirmDialog from "./ConfirmDialog";

const AVATAR_COLORS = [
  "#4A5C92", "#BA1A1A", "#5C8A5C", "#C4A265",
  "#7B6BA8", "#AD6B6B", "#6B8EAD",
];

const initialContacts: Contact[] = [
  {
    id: "1",
    firstName: "Jack",
    lastName: "Smith",
    email: "jack.smith@company.com",
    phone: "+1 (555) 123-4567",
    company: "Acme Corp",
    avatarColor: "#7B6BA8",
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Pruett",
    email: "sarah.pruett@design.io",
    phone: "+1 (555) 234-5678",
    company: "Design.io",
    avatarColor: "#5C8A5C",
  },
  {
    id: "3",
    firstName: "Jasmine",
    lastName: "Fields",
    email: "jasmine.fields@tech.co",
    phone: "+1 (555) 345-6789",
    company: "TechCo",
    avatarColor: "#C4A265",
  },
  {
    id: "4",
    firstName: "Dan",
    lastName: "Trovalds",
    email: "dan.trovalds@startup.dev",
    phone: "+1 (555) 456-7890",
    company: "StartupDev",
    avatarColor: "#6B8EAD",
  },
  {
    id: "5",
    firstName: "Christine",
    lastName: "Woods",
    email: "christine.woods@agency.net",
    phone: "+1 (555) 567-8901",
    company: "Creative Agency",
    avatarColor: "#AD6B6B",
  },
  {
    id: "6",
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@firm.com",
    phone: "+1 (555) 678-9012",
    company: "Chen & Associates",
    avatarColor: "#4A5C92",
  },
];

export default function ContactsView() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(
    initialContacts[0]
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const q = searchQuery.toLowerCase();
    return contacts.filter(
      (c) =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  }, [contacts, searchQuery]);

  const sortedContacts = useMemo(
    () =>
      [...filteredContacts].sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`
        )
      ),
    [filteredContacts]
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

  const handleDeleteConfirm = () => {
    if (deletingContact) {
      setContacts((prev) => prev.filter((c) => c.id !== deletingContact.id));
      if (selectedContact?.id === deletingContact.id) {
        setSelectedContact(null);
      }
      setDeletingContact(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleSave = (data: Omit<Contact, "id" | "avatarColor">) => {
    if (editingContact) {
      // Update
      const updated = { ...editingContact, ...data };
      setContacts((prev) =>
        prev.map((c) => (c.id === editingContact.id ? updated : c))
      );
      if (selectedContact?.id === editingContact.id) {
        setSelectedContact(updated);
      }
    } else {
      // Create
      const newContact: Contact = {
        ...data,
        id: Date.now().toString(),
        avatarColor:
          AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      };
      setContacts((prev) => [...prev, newContact]);
      setSelectedContact(newContact);
    }
    setDialogOpen(false);
    setEditingContact(null);
  };

  const getInitials = (c: Contact) =>
    `${c.firstName[0]}${c.lastName[0]}`.toUpperCase();

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
            Contacts ({contacts.length})
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
          {sortedContacts.length === 0 ? (
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
                      {contact.firstName} {contact.lastName}
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
                  {selectedContact.firstName} {selectedContact.lastName}
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
                    {selectedContact.phone}
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
                    {selectedContact.company}
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
        message={`Are you sure you want to delete ${deletingContact?.firstName} ${deletingContact?.lastName}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeletingContact(null);
        }}
      />
    </Box>
  );
}
