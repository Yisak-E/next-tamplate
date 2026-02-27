# Figma Prototype Specification — "Simple-Client" Email Application

> Use this document as an exact blueprint to recreate the implemented UI in Figma. Every color, size, spacing, typography token, and layout constraint is captured from the live codebase.

---

## 1. Global Design Tokens (Material Design 3)

### 1.1 Color Palette

| Token Name | Hex | Usage |
|---|---|---|
| Primary | `#4A5C92` | Buttons, active indicators, links, today circle |
| Primary Dark | `#324478` | Hover state on primary buttons |
| Primary Container / Light | `#DBE1FF` | Avatar fallback bg, nav rail user avatar bg |
| Secondary Container | `#DDE1F9` | Active nav pill bg, "All" filter chip bg |
| Secondary Container Hover | `#CDD1E9` | Hover on active nav pill / active chip |
| On-Primary-Container | `#324478` | Avatar fallback text color |
| On-Secondary-Container | `#414659` | "All" chip text + icon color |
| On-Surface | `#1A1B21` | Primary text, headings |
| On-Surface-Variant | `#49454F` | Secondary text, icons, labels |
| Outline | `#757680` | Chip borders, text field borders, "Today" btn border |
| Outline-Variant / Divider | `#CAC4D0` | Dividers between email items |
| Surface | `#FAF8FF` | Page background, email list bg, calendar cells |
| Surface-Container-High | `#E8E7EF` | Search bar bg, contact search bg, calendar grid lines |
| Surface-Container-Lowest / Paper | `#FFFFFF` | Email content pane, contact detail card, event sidebar, dialog bg |
| Error | `#BA1A1A` | Unread badge bg, delete button color |
| Error Hover | `#930F0F` | Delete button hover |
| On-Error | `#FFFFFF` | Badge text, delete btn text |
| Black | `#000000` | "Simple-Client" label, "Inbox (4)" text |
| FAB Background | `#FFD6F8` | Compose FAB (pink) |
| FAB Hover | `#F0C0E8` | Compose FAB hover |

### 1.2 Avatar Color Palette (for contacts & email senders)

| Color | Hex | Used By |
|---|---|---|
| Purple | `#7B6BA8` | Jack Smith |
| Green | `#5C8A5C` | Sarah Pruett |
| Gold | `#C4A265` | Jasmine Fields |
| Blue | `#6B8EAD` | Dan Trovalds |
| Red | `#AD6B6B` | Christine Woods |
| Indigo | `#4A5C92` | Michael Chen |

### 1.3 Calendar Event Colors

`#4A5C92` · `#BA1A1A` · `#5C8A5C` · `#C4A265` · `#7B6BA8` · `#AD6B6B` · `#6B8EAD`

### 1.4 Typography (Font: Roboto)

| Token | Weight | Size | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|
| Title/Medium | 500 | 16px | 24px | 0.15px | "Inbox (4)", nav bar items |
| Title/Large | 500 | 20px | — | — | Calendar month heading |
| Title/XL | 500 | 22px | — | — | Contact detail name |
| Body/Large | 400 | 16px | 24px | 0.5px | "Simple-Client" text, sender name, search placeholder, text field value |
| Body/Medium | 400 | 14px | 20px | 0.25px | Email preview text |
| Label/Large | 500 | 14px | 20px | 0.1px | Chip labels, button labels, contact list name |
| Label/Medium | 500 | 12px | 16px | 0.5px | Email subject line, nav item labels (inactive), date sidebar label |
| Label/Medium Prominent | 600 | 12px | 16px | 0.5px | Active nav item label, calendar day headers |
| Label/Small | 500 | 11px | 16px | 0.5px | Date timestamp, badge numbers |
| Body/Small-Calendar | 500 | 10px | — | — | Calendar event chip text, "+N more" |
| Detail/Tiny | 500 | 13px | — | — | Calendar day number |
| Section/Title | 500 | 18px | — | — | "Contacts (N)" heading |

### 1.5 Elevation / Shadows

| Level | Value | Usage |
|---|---|---|
| Elevation 3 (FAB) | `0px 4px 8px 3px rgba(0,0,0,0.15), 0px 1px 3px 0px rgba(0,0,0,0.3)` | Compose FAB |

### 1.6 Border Radii

| Value | Usage |
|---|---|
| `100px` (pill) | Nav icon pill, badges, chips |
| `99px` | Avatars |
| `28px` | Search bar |
| `16px` | FAB, content panels, dialogs, email content area |
| `12px` | Contact list items, event cards, contact search input |
| `8px` | Filter chips |
| `4px` | Text field, calendar event chips |
| `50%` | Calendar day circle, color picker circles |

---

## 2. Layout — Root Frame

- **Background:** `#FAF8FF`
- **Size:** Full viewport (`100vw × 100vh`)
- **Padding:** `15px` all sides
- **Layout:** Horizontal flex, gap `15px`
- **Children:** `[Navigation Rail]` + `[Main Content Column]`

---

## 3. Navigation Rail (Left Sidebar)

- **Width:** `80px` fixed
- **Height:** Fill parent
- **Direction:** Vertical flex, centered horizontally
- **Padding:** `8px` top/bottom

### 3.1 Compose FAB (Top)

- **Size:** `48px × 48px` (MUI medium)
- **Background:** `#FFD6F8`
- **Corner radius:** `16px`
- **Shadow:** Elevation 3 (see tokens)
- **Icon:** `EditOutlined` (Material), `24px`, black
- **Margin bottom:** `16px`
- **Hover:** bg → `#F0C0E8`

### 3.2 Navigation Items (Middle, flex-grow)

- **Direction:** Vertical flex, gap `12px`, top padding `8px`
- **3 items:** Email, Calendar, Contacts

**Each nav item:**
- Direction: Vertical flex, centered, gap `4px`, bottom padding `4px`, full width
- **Icon pill container:**
  - Horizontal flex, centered
  - Padding: `4px` vertical, `16px` horizontal
  - Corner radius: `100px`
  - Active state bg: `#DDE1F9` → hover `#CDD1E9`
  - Inactive: transparent → hover `rgba(0,0,0,0.04)`
  - Icon: `24px` Material outlined icon
- **Label:**
  - Roboto, 12px, centered
  - Active: weight 600, color `#1A1B21`
  - Inactive: weight 500, color `#45464F`

**Icons per item:**
| Item | Icon | View Key |
|---|---|---|
| Email | `MailOutlined` | `email` |
| Calendar | `CalendarTodayOutlined` | `calendar` |
| Contacts | `PersonOutlineOutlined` | `contacts` |

### 3.3 Bottom Section (pinned to bottom)

- Direction: Vertical flex, centered, gap `16px`
- **Items in order (top to bottom):**

1. **Notification bell with badge**
   - Icon: `NotificationsOutlined`, `20px`, color `#49454F`
   - Badge: `25`, red `#BA1A1A`, white text, 11px, weight 500, min-width 16px, height 16px, pill shape
2. **Light mode icon** — `LightModeOutlined`, `20px`, color `#49454F`
3. **Palette icon** — `PaletteOutlined`, `20px`, color `#49454F`
4. **Settings icon** — `SettingsOutlined`, `20px`, color `#49454F`
5. **User avatar**
   - Size: `56px × 56px`
   - Corner radius: `99px` (circle)
   - Background: `#DBE1FF`
   - Fallback text: "SJ", 20px, weight 400, color `#324478`

---

## 4. Main Content Column

- **Layout:** Vertical flex, gap `15px`, flex-grow, overflow hidden

### 4.1 Top NavBar (height: 56px, flex-shrink 0)

- **Layout:** Horizontal flex, gap `15px`, vertically centered

#### 4.1.1 Logo Section (left, width 450px fixed)

- Horizontal flex, gap `15px`, overflow hidden
- **"Simple-Client" text:**
  - Roboto 400, 16px/24px, letter-spacing 0.5px, color `#000000`, no wrap
- **Account text field:**
  - Flex-grow to fill remaining space
  - MUI Outlined TextField, height `48px`
  - Border radius: `4px`
  - Border color: `#757680`, hover `#45464F`
  - Value: `(Sam Jones) sam.jones@...`
  - Font: 16px, color `#45464F`, letter-spacing 0.5px
  - End adornment: `CancelOutlined` icon button, small, color `#49454F`

#### 4.1.2 Global Search Bar (center, flex-grow)

- Centered container, flex-grow
- **Search bar capsule:**
  - Background: `#E8E7EF`
  - Corner radius: `28px`
  - Height: `56px`
  - Width: 100% of container, min `360px`, max `720px`
  - Horizontal padding: `4px`, gap `4px`
  - **Left:** `MenuIcon` icon button, color `#49454F`
  - **Middle:** "Global Search" placeholder text — Roboto 400, 16px/24px, 0.5px spacing, color `#45464F`
  - **Right end, 2 icons:**
    - `SearchIcon` button, color `#49454F`
    - `MoreVertIcon` button, color `#49454F`

---

## 5. View: Email (activeView === "email")

### 5.1 Content Area Layout

- Horizontal flex, gap `15px`, flex-grow, overflow hidden, border-radius `16px`
- **Children:** `[Email List (450px)]` + `[Email Content (flex-grow, white)]`

### 5.2 Email List Panel (width: 450px)

- Vertical flex, overflow hidden

#### 5.2.1 Header Row (height: 44px)

- Horizontal flex, space-between, vertically centered
- **Left:** `MenuIcon` icon button, small, color `#1A1B21`
- **Center group:** horizontal flex, gap `8px`, centered
  - `SyncOutlined` icon, `24px`, color `#49454F`
  - "Inbox (4)" — Roboto 500, 16px/24px, letter-spacing 0.15px, color `#000`
  - `ArrowDropDown` icon, color `#49454F`
- **Right:** Unchecked Checkbox, color `#45464F`, checked color `#4A5C92`, padding `4px`

#### 5.2.2 Filter Chips Row (height: 44px)

- Horizontal flex, gap `8px`, overflow hidden
- **Chips (all height 32px, border-radius 8px, font 500/14px, letter-spacing 0.1px):**

| Chip | Variant | Style |
|---|---|---|
| ✓ All | Filled | bg `#DDE1F9`, text `#414659`, leading `CheckIcon` (18px) |
| Read | Outlined | border `#757680`, text `#45464F` |
| Today | Outlined | border `#757680`, text `#45464F` |
| Unread | Outlined | border `#757680`, text `#45464F` |

- **Right spacer** (flex-grow)
- **"Clear" text button:** Roboto 500, 14px, color `#4A5C92`, no uppercase

#### 5.2.3 Divider

- Full-width, color `#CAC4D0`

#### 5.2.4 Email Items List (flex-grow, scrollable, bg `#FAF8FF`)

**Each email item:**
- Horizontal flex, gap `16px`
- Padding: `12px` top/bottom, `16px` left, `24px` right
- Hover: bg `rgba(0,0,0,0.04)`, transition 0.15s
- Bottom divider: `#CAC4D0`

**Item children:**
1. **Avatar** — `56px × 56px`, circular, colored background, white initials (16px, weight 500)
2. **Content column** — flex-grow, overflow hidden, all text single-line ellipsis
   - **Subject:** 12px/16px, weight 500, color `#49454F`, letter-spacing 0.5px
   - **Sender:** 16px/24px, weight 400, color `#1A1B21`, letter-spacing 0.5px
   - **Preview:** 14px/20px, weight 400, color `#49454F`, letter-spacing 0.25px
3. **Trailing** — horizontal flex, gap `10px`, flex-shrink 0
   - **Date:** 11px/16px, weight 500, color `#49454F`, letter-spacing 0.5px, right-aligned
   - **Unread badge (if present):** pill, bg `#BA1A1A`, color white, min-width 16px, height 16px, padding 0 4px, 11px/16px, weight 500

**Email Data:**

| # | Subject | Sender | Initials | Avatar Color | Preview | Date | Badge |
|---|---|---|---|---|---|---|---|
| 1 | New Business Opportunities | Jack Smith | JS | `#7B6BA8` | Dear Sam, Hope this email finds you well. I would like t... | Now | 3 |
| 2 | RE: Project Progress | Sarah Pruett | SP | `#5C8A5C` | Reminder on the mentioned bel... | Yesterday | 2 |
| 3 | LPO Created | Jasmine Fields | JF | `#C4A265` | Hello Sam, Cloud you please sign the issued LPO for the new pur... | Yesterday | 5 |
| 4 | Insurance Requested Documents | Dan Trovalds | DT | `#6B8EAD` | Dear Sam, I hope my message finds you in your best health ... | 02/Feb/2026 | — |
| 5 | Update Request | Christine Woods | CW | `#AD6B6B` | Dear Sam, I would like you to prepare a detailed project up... | 22/Dec/2025 | — |

### 5.3 Email Content Pane (right side)

- Flex-grow, background `#FFFFFF`, border-radius `16px`
- Empty / placeholder (no content rendered)

---

## 6. View: Calendar (activeView === "calendar")

### 6.1 Content Area Layout

- Horizontal flex, gap `15px`, flex-grow, overflow hidden

### 6.2 Calendar Grid (left, flex-grow)

- Vertical flex

#### 6.2.1 Month Header

- Horizontal flex, space-between, margin-bottom `16px`
- **Left group:**
  - Month + year text: Roboto 500, 20px, color `#1A1B21` (e.g. "February 2026")
  - `ChevronLeftIcon` icon button (previous month)
  - `ChevronRightIcon` icon button (next month)
- **Right group:**
  - "Today" outlined button: border `#757680`, text `#4A5C92`, font 500, no uppercase
  - "New Event" contained button: bg `#4A5C92`, hover `#324478`, font 500, no uppercase, leading `AddIcon`

#### 6.2.2 Day of Week Headers

- CSS Grid: 7 columns equal width
- Each cell: centered text, padding `8px` vertical, bottom border `1px solid #CAC4D0`
- Text: Roboto 600, 12px, color `#49454F`, letter-spacing 0.5px
- Labels: `Sun` `Mon` `Tue` `Wed` `Thu` `Fri` `Sat`

#### 6.2.3 Calendar Day Cells

- CSS Grid: 7 columns, flex-grow vertically
- **Each cell:**
  - Min-height: `80px`
  - Padding: `4px`
  - Borders: bottom `1px solid #E8E7EF`, right `1px solid #E8E7EF` (no right on 7th column)
  - Clickable cells (with dates): cursor pointer
  - Selected date cell: bg `rgba(74,92,146,0.06)`
  - Hover: bg `rgba(0,0,0,0.03)`, transition 0.15s

- **Day number:**
  - Centered, `28px × 28px` circle container
  - Today: bg `#4A5C92`, text white, weight 600
  - Other days: transparent bg, text `#1A1B21`, weight 400
  - Font size: 13px

- **Event chips (max 2 visible per cell):**
  - Background: event color
  - Text: white, 10px, weight 500, single-line ellipsis
  - Border-radius: `4px`
  - Padding: `2px` vertical, `4px` horizontal
  - Margin-bottom: `2px`

- **Overflow indicator:** "+N more" text, 10px, color `#49454F`, centered

### 6.3 Event Sidebar (right, width 320px)

- Width: `320px`, flex-shrink 0
- Background: `#FFFFFF`
- Border-radius: `16px`
- Vertical flex, overflow hidden

#### 6.3.1 Sidebar Header

- Padding: `16px`
- Bottom border: `1px solid #E8E7EF`
- **Date text:** Roboto 500, 14px, color `#49454F` — format: "Friday, February 27, 2026"
- **Count text:** Roboto, 12px, color `#757680` — "3 events" / "1 event" / "0 events"

#### 6.3.2 Event List (scrollable, padding 8px)

**Empty state:** centered vertical flex
- "No events for this day" — 14px, color `#757680`
- "Add Event" text button with `AddIcon`, color `#4A5C92`, weight 500

**Each event card:**
- Padding: `12px`
- Margin-bottom: `8px`
- Border-radius: `12px`
- Left border: `4px solid {event.color}`
- Background: `#FAF8FF`, hover `#F0EFF7`, transition 0.15s

- **Top row:** horizontal flex, space-between
  - Title: 14px, weight 500, color `#1A1B21`, flex-grow
  - Action buttons (gap `2px`):
    - Edit: `EditOutlined` 16px, color `#49454F`, tooltip "Edit"
    - Delete: `DeleteOutline` 16px, color `#BA1A1A`, tooltip "Delete"

- **Time row:** horizontal flex, gap `4px`, margin-top `4px`
  - `AccessTimeIcon` 14px, color `#757680`
  - Time range: 12px, color `#757680` — "09:00 - 09:30"

- **Description:** 12px, color `#49454F`, line-height 18px, margin-top `4px`

**Calendar Event Data:**

| # | Title | Description | Date | Time | Color |
|---|---|---|---|---|---|
| 1 | Team Standup | Daily standup meeting with the dev team | 2026-02-27 | 09:00–09:30 | `#4A5C92` |
| 2 | Client Call - Project Review | Review project milestones with client | 2026-02-27 | 11:00–12:00 | `#5C8A5C` |
| 3 | Lunch with Sarah | Discuss the new proposal over lunch | 2026-02-27 | 13:00–14:00 | `#C4A265` |
| 4 | Sprint Planning | Plan next sprint tasks and assignments | 2026-03-02 | 10:00–11:30 | `#7B6BA8` |
| 5 | Design Review | Review UI/UX designs for the new feature | 2026-03-05 | 14:00–15:00 | `#AD6B6B` |

---

## 7. View: Contacts (activeView === "contacts")

### 7.1 Content Area Layout

- Horizontal flex, gap `15px`, flex-grow, overflow hidden

### 7.2 Contact List Panel (left, width 380px)

- Vertical flex, overflow hidden

#### 7.2.1 Header

- Horizontal flex, space-between, margin-bottom `12px`
- **Left:** "Contacts (6)" — Roboto 500, 18px, color `#1A1B21`
- **Right:** "New Contact" contained button — bg `#4A5C92`, hover `#324478`, font 500, no uppercase, leading `AddIcon`

#### 7.2.2 Search Input

- Full width, margin-bottom `12px`
- Background: `#E8E7EF`
- Border-radius: `12px`
- No visible border
- Placeholder: "Search contacts..."
- Start adornment: `SearchIcon`, 20px, color `#49454F`

#### 7.2.3 Contact List (scrollable)

**Empty state:** centered "No contacts found" — 14px, color `#757680`

**Each contact row:**
- Horizontal flex, vertically centered, gap `12px`
- Padding: `10px` vertical, `12px` horizontal
- Border-radius: `12px`
- Selected: bg `rgba(74,92,146,0.08)`
- Hover: bg `rgba(0,0,0,0.04)`, transition 0.15s
- Cursor: pointer

- **Avatar:** `44px × 44px`, circular, colored bg, white initials (15px, weight 500)
- **Text column** (flex-grow, overflow hidden):
  - Name: 14px, weight 500, color `#1A1B21`, ellipsis
  - Company: 12px, weight 400, color `#49454F`, ellipsis

### 7.3 Contact Detail Panel (right, flex-grow)

- Background: `#FFFFFF`
- Border-radius: `16px`
- Vertical flex, overflow hidden

**Empty state:** centered "Select a contact to view details" — 14px, color `#757680`

#### 7.3.1 Detail Header

- Horizontal flex, vertically centered, gap `16px`
- Padding: `24px`
- Bottom border: `1px solid #E8E7EF`

- **Avatar:** `72px × 72px`, circular, colored bg, white initials (24px, weight 500)
- **Info (flex-grow):**
  - Full name: Roboto 500, 22px, color `#1A1B21`
  - Company: 14px, color `#49454F`
- **Action buttons:**
  - Edit: `EditOutlined`, color `#49454F`, tooltip "Edit"
  - Delete: `DeleteOutline`, color `#BA1A1A`, tooltip "Delete"

#### 7.3.2 Detail Body

- Padding: `24px`, vertical flex, gap `20px`
- Each field row: horizontal flex, vertically centered, gap `16px`

| Icon | Label | Value Style |
|---|---|---|
| `EmailOutlined` (22px, `#49454F`) | "Email" (12px, `#757680`) | 14px, color `#4A5C92`, clickable (mailto:) |
| `PhoneOutlined` (22px, `#49454F`) | "Phone" (12px, `#757680`) | 14px, color `#1A1B21` |
| `BusinessOutlined` (22px, `#49454F`) | "Company" (12px, `#757680`) | 14px, color `#1A1B21` |

- Dividers between each row: full-width `#CAC4D0`

**Contact Data:**

| # | First | Last | Email | Phone | Company | Avatar Color |
|---|---|---|---|---|---|---|
| 1 | Jack | Smith | jack.smith@company.com | +1 (555) 123-4567 | Acme Corp | `#7B6BA8` |
| 2 | Sarah | Pruett | sarah.pruett@design.io | +1 (555) 234-5678 | Design.io | `#5C8A5C` |
| 3 | Jasmine | Fields | jasmine.fields@tech.co | +1 (555) 345-6789 | TechCo | `#C4A265` |
| 4 | Dan | Trovalds | dan.trovalds@startup.dev | +1 (555) 456-7890 | StartupDev | `#6B8EAD` |
| 5 | Christine | Woods | christine.woods@agency.net | +1 (555) 567-8901 | Creative Agency | `#AD6B6B` |
| 6 | Michael | Chen | michael.chen@firm.com | +1 (555) 678-9012 | Chen & Associates | `#4A5C92` |

---

## 8. Dialogs (Modals)

All dialogs use border-radius `16px`.

### 8.1 Event Dialog (Create / Edit)

- **Max width:** `sm` (600px), full width
- **Title:** "New Event" or "Edit Event" — weight 500, color `#1A1B21`
- **Content fields (vertical flex, gap 16px, top padding 8px):**
  1. Title — TextField, small, required, autofocus
  2. Description — TextField, small, multiline, 2 rows
  3. Date — TextField type="date", small, shrink label
  4. Start Time + End Time — horizontal flex, gap `16px`, two TextField type="time", small, shrink labels
  5. Color picker:
     - Label: "Color", 12px, color `#49454F`
     - Row of 7 circles, `28px × 28px`, each event color
     - Selected: `3px solid #1A1B21` border
     - Unselected: `3px solid transparent`
- **Actions (right-aligned, padding `24px` horizontal, `16px` bottom):**
  - "Cancel" — text button, color `#49454F`, no uppercase
  - "Create" / "Save Changes" — contained, bg `#4A5C92`, hover `#324478`, no uppercase, disabled if title empty

### 8.2 Contact Dialog (Create / Edit)

- **Max width:** `sm` (600px), full width
- **Title:** "New Contact" or "Edit Contact" — weight 500, color `#1A1B21`
- **Content fields (vertical flex, gap 16px, top padding 8px):**
  1. First Name + Last Name — horizontal flex, gap `16px`, both required, first autofocus
  2. Email — TextField type="email", small
  3. Phone — TextField, small
  4. Company — TextField, small
- **Actions:**
  - "Cancel" — text, color `#49454F`
  - "Create" / "Save Changes" — contained, bg `#4A5C92`, disabled if first or last name empty

### 8.3 Confirm Delete Dialog

- **Max width:** `xs` (444px), full width
- **Title:** "Delete Event" / "Delete Contact" — weight 500, color `#1A1B21`
- **Message:** "Are you sure you want to delete [name]?" — 14px, color `#49454F`
- **Actions:**
  - "Cancel" — text, color `#49454F`
  - "Delete" — contained, bg `#BA1A1A`, hover `#930F0F`

---

## 9. Figma Page Structure (Recommended)

```
📄 Page: Simple-Client
  🖼 Frame: Email View (1440 × 900)
    ├─ Navigation Rail
    ├─ NavBar
    └─ Email Content Area
        ├─ Email List Panel
        └─ Email Content Pane (empty)

  🖼 Frame: Calendar View (1440 × 900)
    ├─ Navigation Rail (Calendar active)
    ├─ NavBar
    └─ Calendar Content Area
        ├─ Calendar Grid
        └─ Event Sidebar

  🖼 Frame: Contacts View (1440 × 900)
    ├─ Navigation Rail (Contacts active)
    ├─ NavBar
    └─ Contacts Content Area
        ├─ Contact List Panel
        └─ Contact Detail Panel

  🖼 Frame: Event Dialog — New (600 × auto)
  🖼 Frame: Event Dialog — Edit (600 × auto)
  🖼 Frame: Contact Dialog — New (600 × auto)
  🖼 Frame: Contact Dialog — Edit (600 × auto)
  🖼 Frame: Delete Confirmation (444 × auto)
```

---

## 10. Interaction / Prototype Flows (Figma Prototyping)

### Navigation
- Clicking **Email** nav item → navigate to Email View frame
- Clicking **Calendar** nav item → navigate to Calendar View frame
- Clicking **Contacts** nav item → navigate to Contacts View frame
- Active nav item gets pill highlight `#DDE1F9` and bold label

### Email View
- Filter chips are clickable (toggle selected state)
- Email rows have hover bg `rgba(0,0,0,0.04)`
- "Clear" resets filter

### Calendar View
- Left/Right chevrons change month label text
- "Today" button resets to Feb 2026
- Clicking a calendar cell highlights it with `rgba(74,92,146,0.06)` and shows events in sidebar
- "New Event" → opens Event Dialog (New)
- Edit icon on event card → opens Event Dialog (Edit, pre-filled)
- Delete icon on event card → opens Delete Confirmation dialog
- "Add Event" in empty sidebar → opens Event Dialog (New)

### Contacts View
- Typing in search filters the contact list
- Clicking a contact row highlights it and shows detail panel
- "New Contact" → opens Contact Dialog (New)
- Edit icon in detail header → opens Contact Dialog (Edit, pre-filled)
- Delete icon in detail header → opens Delete Confirmation dialog

### Dialogs
- "Cancel" closes dialog (overlay dismiss)
- "Create" / "Save Changes" closes dialog and returns to view
- "Delete" closes both confirm dialog and removes item

---

## 11. Component Library (Figma Components to Create)

| Component | Variants / Props |
|---|---|
| Nav Rail Item | `active: true/false`, `icon`, `label` |
| Compose FAB | default, hover |
| Email List Item | `has-badge: true/false` |
| Filter Chip | `selected: true/false`, `label` |
| Badge (Unread) | `count: number` |
| Calendar Day Cell | `is-today: true/false`, `is-selected: true/false`, `events: 0-3+` |
| Event Card | `color`, `title`, `time`, `description` |
| Contact List Item | `selected: true/false` |
| Contact Detail Field | `icon`, `label`, `value`, `is-link: true/false` |
| Dialog Shell | `title`, `max-width: sm/xs` |
| Event Dialog | `mode: create/edit` |
| Contact Dialog | `mode: create/edit` |
| Confirm Dialog | `entity: event/contact`, `name` |
| Search Bar | `placeholder` |
| Account Text Field | `value` |
