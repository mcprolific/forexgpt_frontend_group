ForexGPT Frontend
=================

Overview
--------
- React + Vite single‑page application for the ForexGPT platform.
- Connects to the backend AI services (Mentor, Code Generation, Signal Extraction) via REST.
- Provides authentication, theming (light/dark), routing, and feature‑oriented state management.
- This document covers the frontend. Dashboard pages are intentionally omitted.

Tech Stack
----------
- React 19 with React Router 7
- Vite 7 for fast dev and builds
- Redux Toolkit for state management
- Tailwind CSS v4 with the @tailwindcss/vite plugin
- Axios for API calls with an interceptor
- Framer Motion for animations

Quick Start
-----------
1. Install dependencies
   - npm install
2. Configure environment
   - Create .env.local at the project root with:
     - VITE_API_URL=http://127.0.0.1:8000
3. Run the app
   - npm run dev
4. Build and preview
   - npm run build
   - npm run preview

NPM Scripts
-----------
- dev: Start Vite dev server
- build: Production build
- preview: Preview production build
- lint: Run ESLint

Environment
-----------
- VITE_API_URL
  - Base URL for the backend API.
  - Fallback: http://localhost:8000 if not provided.

Architecture Overview
---------------------
- Routing
  - Public and protected routes using react-router-dom.
  - ProtectedRoute wraps the authenticated area.
  - Entry: [App.jsx](file:///c:/Users/folak/Desktop/ForexGPT/frontend/src/App.jsx)
- State Management
  - Redux Toolkit slices by feature; combined in a root reducer.
  - Store: [store.js](file:///c:/Users/folak/Desktop/ForexGPT/frontend/src/app/store.js)
  - Root reducer: [rootReducer.js](file:///c:/Users/folak/Desktop/ForexGPT/frontend/src/app/rootReducer.js)
- Networking
  - Centralized Axios instance with JSON headers and auth token interceptor.
  - Auto‑redirect to /login on 401 responses.
  - See: [axiosInstance.js](file:///c:/Users/folak/Desktop/ForexGPT/frontend/src/services/axiosInstance.js)
- Theming
  - Light/dark theme via a simple context that toggles a root class and persists to localStorage.
  - See: [ThemeContext.jsx](file:///c:/Users/folak/Desktop/ForexGPT/frontend/src/context/ThemeContext.jsx)
- UI/UX
  - Tailwind v4 utility classes and small reusable UI components (Button, Card, Modal, Spinner, Toast).
  - Toast notifications via a lightweight hook.

Project Structure
-----------------
```
src/
├─ app/
│  ├─ store.js
│  └─ rootReducer.js
├─ assets/                Static images and media
├─ components/            Reusable UI and feature widgets
│  ├─ dashboard/          (Dashboard UI — omitted here)
│  ├─ signals/            Signal result cards and panels
│  ├─ transcript/         Transcript uploader and viewer
│  └─ ui/                 Generic UI elements (Button, Card, Modal, etc.)
├─ context/
│  └─ ThemeContext.jsx    Theme provider and hook
├─ features/              Redux Toolkit features (slice + API)
│  ├─ auth/               Auth flows and localStorage integration
│  ├─ mentor/             Mentor Q&A
│  ├─ code/               Code generation
│  ├─ signals/            Signal extraction flows
│  ├─ transcript/         Transcript utilities
│  ├─ strategy/           Strategy builder
│  ├─ backtest/           Backtesting hooks
│  ├─ learning/           Learning content
│  └─ settings/           User settings
├─ hooks/                 Custom hooks (auth, debounce, toast)
├─ layout/                App shell: Layout, Navbar, Sidebar, ProtectedRoute
├─ pages/                 Route pages
├─ services/
│  └─ axiosInstance.js    Axios instance with interceptors
├─ styles/
│  └─ globals.css         Global styles and Tailwind layer hooks
├─ utils/                 Utilities and formatters
├─ App.jsx                Router and route definitions
└─ main.jsx               React entry point
```
Routing
-------
- Public routes (examples)
  - /, /why, /how-ai-helps, /how-to-use, /about, /contact, /services, /team
  - /mentor, /strategy, /transcript, /signals, /backtest
  - /login, /register
- Protected area
  - /dashboard with nested routes (details omitted)
  - Guarded by ProtectedRoute and Redux auth state

Authentication
--------------
- Local token and user persisted in localStorage by the auth slice.
- Axios attaches Authorization: Bearer <token> when present.
- On 401 responses, token is cleared and the app navigates to /login.

Theming
-------
- ThemeContext provides theme and toggleTheme.
- Persists theme in localStorage as fgpt_theme.
- Applies/removes a light class on the root element for Tailwind.

API Integration
---------------
- Use the centralized axiosInstance for all requests.
- JSON Content‑Type by default.
- Respect backend expectations:
  - Pass proper UUIDs for user_id where required.
  - Handle errors by reading error.response.data.detail when available.

UI Components and Patterns
--------------------------
- Common UI primitives live in components/ui (Button, Card, Modal, Spinner, Toast).
- Feature components are grouped by concern (e.g., components/signals, components/transcript).
- Style tokens use Tailwind and minimal inline styles where necessary.

Development Notes
-----------------
- Tailwind v4 is integrated via @tailwindcss/vite plugin.
- Linting via ESLint: npm run lint.
- For API base URL, set VITE_API_URL in a .env.local file.

Production Build
----------------
- npm run build generates a dist/ folder.
- npm run preview serves the built output locally.

Troubleshooting
---------------
- 401 unauthorized:
  - Ensure token is set in localStorage and not expired.
- CORS issues:
  - Confirm backend CORS allows the frontend origin.

License
-------
- All rights reserved. Internal use for the ForexGPT project.




