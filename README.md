# CultureSync — Cultural Management System

> Sri Parasakthi College for Women, Courtallam  
> A premium cultural event management platform built with React + Vite + Redux Toolkit.

---

## Quick Start

```bash
# 1. Unzip and enter the project
unzip culturesync-complete.zip
cd culturesync

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
# → http://localhost:5173
```

---

## Demo Credentials

| Role    | Username          | Password  |
|---------|-------------------|-----------|
| Student | `21CS001`         | `demo123` |
| Admin   | `admin@spc.edu`   | `demo123` |

> **Note:** Demo credentials are pre-filled on the login page. Just click **Sign In**.

---

## Tech Stack

| Layer       | Technology                                    |
|-------------|-----------------------------------------------|
| Framework   | React 18 + Vite 5                             |
| State Mgmt  | Redux Toolkit 2 + React-Redux 9               |
| Routing     | React Router DOM v6                           |
| Styling     | CSS Modules (zero class-name collisions)      |
| Fonts       | Cormorant Garamond (display) + DM Sans (body) |
| Build Tool  | Vite with HMR                                 |

---

## Project Structure

```
culturesync/
├── index.html                    # Entry HTML
├── vite.config.js                # Vite configuration
├── package.json
│
└── src/
    ├── main.jsx                  # Entry — Provider + BrowserRouter + ErrorBoundary
    ├── App.jsx                   # Auth guard + route definitions
    ├── index.css                 # Global CSS variables & design system
    │
    ├── hooks/
    │   ├── usePageTitle.js       # Sets browser tab title
    │   ├── useDebounce.js        # Debounces a value (used in Students search)
    │   └── useLocalStorage.js    # localStorage-backed useState
    │
    ├── store/
    │   ├── store.js              # Redux configureStore
    │   └── slices/
    │       ├── authSlice.js      # Login / logout, role, user
    │       ├── eventsSlice.js    # Events CRUD + registrations
    │       ├── studentsSlice.js  # Students list + search/filter
    │       ├── resultsSlice.js   # Winners / results per event
    │       └── uiSlice.js        # Modal, notification panel, sidebar collapse
    │
    ├── components/
    │   ├── ErrorBoundary.jsx     # Class-based React error boundary
    │   ├── Layout.jsx            # Sidebar + Topbar shell (collapsible sidebar)
    │   ├── Layout.module.css
    │   ├── NotifPanel.jsx        # Sliding notification drawer
    │   ├── NotifPanel.module.css
    │   ├── Modal.jsx             # Add Event (admin) + Register modals
    │   └── Modal.module.css
    │
    └── pages/
        ├── LoginPage.jsx         # Role-based login (Student / Admin)
        ├── Dashboard.jsx         # Stats + upcoming events + chart + recent regs
        ├── Events.jsx            # Event grid with filter & registration
        ├── MyRegistrations.jsx   # Personal registration history table
        ├── Students.jsx          # Admin student table with debounced search
        ├── Results.jsx           # Winners podium per event
        ├── Settings.jsx          # Profile + notifications + security tabs
        └── NotFound.jsx          # 404 page
```

---

## Features

### Authentication
- **Role-based login** — Student and Admin roles with different navigation items
- Auth state lives in Redux; guard in `App.jsx` keeps unauthenticated users on the login page

### Events
- Browse all events with category filters (All / Festival / Sports / Cultural / Technical)
- Per-event accent colors, emoji posters, and registration progress bars
- **Register** button opens a modal — select competition, confirm details
- Admin-only **Add Event** with full form validation, emoji picker, and accent color swatches

### Dashboard
- Summary stat cards (total events, registered students, registrations, winners)
- Upcoming events list with colored date boxes
- Custom bar chart — registrations per event
- Recent registrations feed

### Students (Admin)
- Search by name or registration number (debounced — no Redux spam on keystroke)
- Filter by department
- Status indicators (Active / Pending)

### Results
- Gold / Silver / Bronze winner rows per event, styled with appropriate metallic tones

### Settings
- Three tabs: Profile, Notifications, Security
- Toggle switches for notification preferences
- Activity summary sidebar

### UI Polish
- Collapsible sidebar (icon-only mode)
- Sliding notification panel from the right
- All modals animated with `slideUp` + overlay blur
- Page transitions with `page-enter` animation class
- Scrollbars, selection, and focus rings all themed
- Full error boundary with friendly UI

---

## Design System

All tokens are CSS custom properties in `src/index.css`:

```css
--gold        #c9a84c   /* primary accent */
--bg          #0e0e10   /* deepest background */
--surface     #1e1e22   /* card / panel background */
--text        #f0eee8   /* primary text */
--text2       #b8b4aa   /* secondary text */
--muted       #6b6760   /* muted / placeholder */
--font-display 'Cormorant Garamond'
--font-body    'DM Sans'
```

---

## Scripts

```bash
npm run dev      # Start dev server with HMR
npm run build    # Production build → /dist
npm run preview  # Preview production build locally
```

---

## Extending

**Add a new page:**
1. Create `src/pages/MyPage.jsx` and `MyPage.module.css`
2. Add a route in `src/App.jsx`
3. Add a nav entry in `src/components/Layout.jsx` (`NAV_ITEMS`)
4. Add a `PAGE_TITLES` entry in `Layout.jsx`

**Add a new Redux slice:**
1. Create `src/store/slices/mySlice.js`
2. Import and register in `src/store/store.js`

---

## License

Internal academic project — Sri Parasakthi College for Women, Courtallam, Tamil Nadu.
