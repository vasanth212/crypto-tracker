# Crypto Tracker — Interview Preparation Guide

This document explains everything in this project so you can confidently discuss it in a junior developer interview, even if you built it with AI assistance.

---

## Table of Contents

1. [Elevator Pitch](#1-elevator-pitch)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [How the App Works (Data Flow)](#4-how-the-app-works-data-flow)
5. [File-by-File Walkthrough](#5-file-by-file-walkthrough)
6. [React Concepts Used in This Project](#6-react-concepts-used-in-this-project)
7. [The CoinGecko API Layer](#7-the-coingecko-api-layer)
8. [Styling with Tailwind CSS](#8-styling-with-tailwind-css)
9. [Routing](#9-routing)
10. [Common Interview Questions & Answers](#10-common-interview-questions--answers)
11. [Trade-offs & Improvements You Could Mention](#11-trade-offs--improvements-you-could-mention)
12. [Glossary](#12-glossary)
13. [How to Run the Project](#13-how-to-run-the-project)

---

## 1. Elevator Pitch

> **"Crypto Tracker is a single-page React app that displays live cryptocurrency prices from the CoinGecko API. Users can browse the top 100 coins, search and sort them, switch between grid and list views, and click into a detail page with a 7-day price chart and market stats."**

**What problem does it solve?**  
It gives users a clean dashboard to monitor crypto prices without signing up or paying for data.

**What you built vs. what you used:**
| You built | You used (libraries/APIs) |
|-----------|---------------------------|
| UI layout and pages | React (UI framework) |
| Search, sort, view toggle logic | React Router (navigation) |
| API wrapper functions | CoinGecko (free public API) |
| Price formatting utility | Tailwind CSS (styling) |
| Coin cards component | Recharts (price chart) |
| Loading/error states | Lucide React (icons) |
| Vite (build tool / dev server) | |

---

## 2. Tech Stack

| Technology | Role | Why it's used here |
|------------|------|--------------------|
| **React 19** | UI library | Component-based UI, state management, re-rendering when data changes |
| **Vite 8** | Build tool & dev server | Fast hot reload during development, bundles app for production |
| **React Router 7** | Client-side routing | Navigate between Home (`/`) and Coin Detail (`/coin/:id`) without full page reload |
| **Tailwind CSS 4** | Utility-first CSS | Style components with classes like `bg-slate-900` directly in JSX |
| **Recharts** | Chart library | Renders the 7-day price line chart on the detail page |
| **Lucide React** | Icon library | Bitcoin and arrow icons in the header |
| **CoinGecko API** | External data source | Free crypto market data (prices, market cap, charts) |
| **ESLint** | Code linter | Catches common JavaScript/React mistakes |

**Important distinction:** This is a **frontend-only** app. There is no backend server, no database, and no user authentication. The browser talks directly to CoinGecko's public API.

---

## 3. Project Structure

```
Crypto Tracker/
├── index.html              # HTML shell — one <div id="root"> where React mounts
├── package.json            # Dependencies and npm scripts
├── vite.config.js          # Vite + React + Tailwind plugins
├── eslint.config.js        # Linting rules
└── src/
    ├── main.jsx            # Entry point — renders <App /> into the DOM
    ├── App.jsx             # Router setup (defines routes)
    ├── index.css           # Imports Tailwind
    ├── api/
    │   └── coinGecko.js    # All HTTP calls to CoinGecko
    ├── components/
    │   └── CryptoCard.jsx  # Reusable coin card (grid + list modes)
    ├── pages/
    │   ├── Home.jsx        # Main listing page
    │   └── CoinDetail.jsx  # Single coin detail + chart
    └── utils/
        └── formatter.js    # Formats large numbers ($1.2B, etc.)
```

**Architecture pattern:** This follows a simple **separation of concerns**:
- **`api/`** — data fetching (no UI)
- **`pages/`** — full screens with state and effects
- **`components/`** — reusable UI pieces
- **`utils/`** — pure helper functions

---

## 4. How the App Works (Data Flow)

### Startup flow

```
index.html
    └── loads main.jsx
            └── renders <App /> inside #root
                    └── <BrowserRouter> wraps routes
                            ├── "/" → <Home />
                            └── "/coin/:id" → <CoinDetail />
```

### Home page flow

```
User opens "/"
    → Home mounts
    → useEffect runs once (empty dependency array [])
    → fetchCoins() called in coinGecko.js
    → fetch() hits CoinGecko /coins/markets
    → JSON returned → setCoins(data)
    → React re-renders with coin list
    → getSortedCoins() filters/sorts in memory
    → CryptoCard rendered for each coin
    → User clicks card → React Router navigates to /coin/bitcoin
```

### Coin detail page flow

```
User lands on "/coin/bitcoin"
    → useParams() extracts id = "bitcoin"
    → Two useEffects run (both depend on [id]):
        1. fetchCoinDetail(id) → coin info (price, market cap, etc.)
        2. fetchCoinMarketChart(id, 7) → 7 days of price points
    → Chart data transformed: [[timestamp, price], ...] → [{ date, price }, ...]
    → Recharts LineChart renders the series
```

### ASCII diagram

```
┌─────────────┐     fetch      ┌──────────────────┐
│   Browser   │ ──────────────►│  CoinGecko API   │
│  (React)    │ ◄──────────────│  api.coingecko   │
└─────────────┘     JSON       └──────────────────┘
       │
       ├── Home.jsx        → list of 100 coins
       ├── CoinDetail.jsx  → one coin + chart
       └── CryptoCard.jsx  → display one coin in grid/list
```

---

## 5. File-by-File Walkthrough

### `index.html`

The only HTML file. Contains `<div id="root">` and loads `/src/main.jsx` as an ES module. Vite injects the bundled JavaScript here during dev/build.

### `src/main.jsx`

```jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- **`createRoot`** — React 18+ API to mount the app (replaces old `ReactDOM.render`)
- **`StrictMode`** — Development helper that double-invokes effects to catch bugs (only in dev, not production)

### `src/App.jsx`

Defines two routes:
- `/` → Home
- `/coin/:id` → CoinDetail (`:id` is a **URL parameter**, e.g. `bitcoin`, `ethereum`)

`BrowserRouter` uses the browser's History API so navigation doesn't reload the page.

### `src/api/coinGecko.js`

Three async functions, each using the native **`fetch`** API:

| Function | Endpoint | Returns |
|----------|----------|---------|
| `fetchCoins()` | `GET /coins/markets?...` | Array of 100 coins with price, rank, etc. |
| `fetchCoinDetail(id)` | `GET /coins/{id}?market_data=true` | Full coin object with nested `market_data` |
| `fetchCoinMarketChart(id, days)` | `GET /coins/{id}/market_chart?days=7` | `{ prices: [[timestamp, price], ...] }` |

**Error handling pattern:**
1. Check `response.ok` (false for 4xx/5xx status codes)
2. Throw an `Error` with status info
3. Catch block logs to console and re-throws so the page can show the error

**Interview tip:** CoinGecko's free tier has **rate limits** (~10–30 calls/minute). This app makes 1 call on home load and 2 calls per detail page. No API key is required for basic usage.

### `src/utils/formatter.js`

```js
formatLargeNumber(1_500_000_000)  // "$1.50B"
formatLargeNumber(42_000)         // "$42,000"
```

Uses numeric separators (`1_000_000`) for readability. Thresholds: Trillion → Billion → Million → plain locale string.

### `src/components/CryptoCard.jsx`

A **presentational component** — it receives data via **props** and doesn't fetch anything itself.

**Props:**
- `coin` — object from CoinGecko markets API
- `viewMode` — `"grid"` or `"list"` (changes layout)

Wraps content in `<Link to={/coin/${coin.id}}>` for client-side navigation.

**Conditional styling:** Price change badge is green if `price_change_percentage_24h >= 0`, red otherwise.

### `src/pages/Home.jsx`

The most stateful page. Manages:

| State | Purpose |
|-------|---------|
| `coins` | Array from API |
| `loading` | Show loading screen |
| `error` | Show error message |
| `viewMode` | `"grid"` or `"list"` |
| `sortBy` | Which sort option is selected |
| `searchQuery` | Text in search input |

**Search:** Client-side filter — loops through `coins` and checks if name or symbol includes the query (case-insensitive). No extra API call.

**Sort:** `getSortedCoins()` copies the filtered array (`[...filteredCoins]` — **important:** never mutate state directly), then sorts with `.sort()` and a `switch` on `sortBy`.

**Why copy before sort?**  
`.sort()` mutates the array in place. Copying avoids accidentally mutating React state, which can cause subtle bugs.

### `src/pages/CoinDetail.jsx`

Uses **React Router hooks:**
- `useParams()` — reads `:id` from the URL
- `useNavigate()` — programmatic navigation (Back button calls `navigate("/")`)

**Two separate `useEffect` hooks** — one for coin details, one for chart data. They could be combined, but splitting them lets the page show coin info even if the chart fails (chart errors only go to `console.error`).

**Optional chaining (`?.`):**  
`coin.market_data?.current_price?.usd` safely handles missing nested properties without throwing.

**Chart data transformation:**
```js
data.prices.map(([timestamp, price]) => ({
  date: new Date(timestamp).toLocaleDateString(...),
  price,
}))
```
CoinGecko returns tuples `[milliseconds, price]`. Recharts needs objects with named keys.

---

## 6. React Concepts Used in This Project

### Components

Functions that return JSX. Every `.jsx` file exports a component.

### JSX

HTML-like syntax inside JavaScript. `className` instead of `class`, `{expression}` for dynamic values.

### Props

Data passed parent → child. Example: `<CryptoCard coin={coin} viewMode={viewMode} />`

### State (`useState`)

Data that, when changed, triggers a re-render.

```js
const [coins, setCoins] = useState([]);
setCoins(data);  // triggers re-render with new coins
```

### Effects (`useEffect`)

Runs side effects (API calls, subscriptions) after render.

```js
useEffect(() => {
  loadCoins();
}, []);  // [] = run once on mount

useEffect(() => {
  loadCoin();
}, [id]);  // re-run when id changes
```

### Conditional rendering

```jsx
if (loading) return <LoadingScreen />;
if (error) return <ErrorScreen />;
return <MainContent />;
```

Also inline: `{chartData.length > 0 ? <Chart /> : <NoData />}`

### Lists and keys

```jsx
{getSortedCoins().map((coin) => (
  <CryptoCard key={coin.id} coin={coin} />
))}
```

**Why `key={coin.id}`?** React uses keys to track which list items changed, were added, or removed. Using array index as key is discouraged when items can reorder.

### Controlled input

```jsx
<input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
```

React state is the "single source of truth" for the input value.

---

## 7. The CoinGecko API Layer

### Why a separate `api/` folder?

- Keeps fetch logic out of UI components
- Easy to swap API providers later
- Easy to mock in tests
- Single place to add API keys, base URL, or caching

### What `fetchCoins` returns (simplified shape)

```js
{
  id: "bitcoin",
  symbol: "btc",
  name: "Bitcoin",
  image: "https://...",
  current_price: 95000,
  market_cap: 1800000000000,
  market_cap_rank: 1,
  total_volume: 50000000000,
  price_change_percentage_24h: 2.5,
  // ... more fields
}
```

### What `fetchCoinDetail` returns (relevant parts)

```js
{
  id: "bitcoin",
  name: "Bitcoin",
  symbol: "btc",
  image: { large: "https://..." },
  market_cap_rank: 1,
  market_data: {
    current_price: { usd: 95000 },
    price_change_percentage_24h: 2.5,
    high_24h: { usd: 96000 },
    low_24h: { usd: 93000 },
    market_cap: { usd: 1800000000000 },
    total_volume: { usd: 50000000000 },
    circulating_supply: 19000000,
    total_supply: 21000000,
  }
}
```

### CORS

CoinGecko allows browser requests from any origin. If they didn't, you'd need a backend proxy. This app works without one because CoinGecko supports **CORS**.

---

## 8. Styling with Tailwind CSS

Tailwind is **utility-first**: small classes compose styles.

| Class | Meaning |
|-------|---------|
| `bg-gray-950` | Very dark background |
| `text-slate-400` | Muted text color |
| `rounded-2xl` | Large border radius |
| `hover:border-slate-700` | Border color on hover |
| `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4` | Responsive grid |
| `fixed top-0 z-50` | Sticky header above content |

**Responsive prefixes:** `sm:` = 640px+, `md:` = 768px+, `lg:` = 1024px+

**Dynamic classes in Home.jsx:**
```jsx
className={`px-4 py-2 ... ${viewMode === "grid" ? "bg-blue-500" : "bg-slate-800"}`}
```
Template literal switches active button styling.

---

## 9. Routing

| URL | Component | How `id` is obtained |
|-----|-----------|----------------------|
| `/` | Home | — |
| `/coin/bitcoin` | CoinDetail | `useParams().id` → `"bitcoin"` |
| `/coin/ethereum` | CoinDetail | `useParams().id` → `"ethereum"` |

**`<Link>` vs `<a>`:**  
`<Link>` prevents full page reload and preserves React state. Regular `<a href>` would reload the entire app.

**Dynamic route:** `/coin/:id` — the colon means "capture this segment as a parameter."

---

## 10. Common Interview Questions & Answers

### "Tell me about a project you've built."

Use the elevator pitch from Section 1. Mention: React, API integration, routing, charts, search/sort, loading and error states.

### "Why did you choose React?"

React's component model fits a dashboard with reusable cards and separate pages. Large ecosystem (React Router, Recharts). `useState`/`useEffect` handle async data without extra libraries.

### "How does data get from the API to the screen?"

1. Component mounts → `useEffect` fires  
2. Async function calls `fetch()` in `coinGecko.js`  
3. Response parsed as JSON  
4. `setState` updates React state  
5. React re-renders with new data  
6. JSX displays the values  

### "What happens when the API fails?"

`fetchCoins` throws an error → caught in Home's `try/catch` → `setError(err.message)` → component renders the red error message instead of the coin list.

### "Why use `useEffect` with an empty dependency array `[]`?"

It means "run this once when the component first mounts." Perfect for initial data fetch. Without `[]`, the effect would run after every render (infinite loop if it sets state).

### "What happens when you navigate from Home to a coin detail?"

React Router changes the URL and swaps `<Home />` for `<CoinDetail />`. Home unmounts (its state is lost). CoinDetail mounts fresh and fetches data for the new `id`. Going back to Home re-fetches the coin list.

### "How does search work?"

Client-side filtering. On every keystroke, `searchQuery` updates → `filteredCoins` recalculates → list re-renders. No debouncing currently (see improvements section).

### "What's the difference between state and props?"

- **State** — owned by the component, changed with `setState`, internal data  
- **Props** — passed in from parent, read-only from child's perspective  

Example: Home owns `coins` (state). CryptoCard receives `coin` (prop).

### "Why copy the array before sorting?"

```js
const sorted = [...filteredCoins];
sorted.sort(...);
```

`.sort()` mutates in place. React state should be treated as immutable. Copying creates a new array for sorting.

### "What is optional chaining (`?.`)?"

```js
coin.market_data?.current_price?.usd
```

If `market_data` or `current_price` is `undefined`, the expression returns `undefined` instead of throwing "Cannot read property of undefined."

### "What is async/await?"

Syntactic sugar over Promises. `await fetch(...)` pauses the function until the HTTP response arrives, without blocking the UI thread.

### "Do you have a backend?"

No. This is a static frontend SPA. All data comes from CoinGecko's public API directly from the browser.

### "How would you add a favorites/watchlist feature?"

Options to mention:
1. **localStorage** — persist coin IDs in the browser (no backend needed)  
2. **Context API or Zustand** — share favorites state across pages  
3. **Backend + database** — if users need accounts and sync across devices  

### "How would you improve this app?"

See Section 11 — mentioning improvements shows you think like a developer.

### "What is Vite?"

A modern build tool. In dev: serves files with instant hot module replacement (HMR). For production: `vite build` bundles and minifies into static files in `dist/`.

### "What does ESLint do?"

Static analysis tool that flags potential bugs and style issues (e.g. missing hook dependencies, unused variables).

---

## 11. Trade-offs & Improvements You Could Mention

Interviewers like hearing you understand limitations:

| Current limitation | Possible improvement |
|--------------------|----------------------|
| No API key / rate limits | Add caching, debounce, or a backend proxy |
| Search has no debounce | Add 300ms debounce so filtering doesn't run on every keystroke unnecessarily |
| Home re-fetches on every visit | Cache coins in Context, React Query, or SWR |
| No pagination (only 100 coins) | Add "Load more" with `page=2` API param |
| No TypeScript | Add types for API responses to catch bugs early |
| Duplicate header in Home and CoinDetail | Extract a shared `<Header />` component |
| Chart errors only logged | Show user-facing error for chart failure |
| No tests | Add unit tests for `formatter.js`, integration tests for API layer |
| No dark/light theme toggle | Already dark-themed; could add toggle with CSS variables |
| `getSortedCoins()` runs every render | Could use `useMemo` to memoize sorted result |

**Saying this well:**  
*"The app works well for a portfolio piece, but if I were shipping it to production I'd add React Query for caching, debounced search, and extract the shared header into a layout component."*

---

## 12. Glossary

| Term | Definition |
|------|------------|
| **SPA** | Single Page Application — one HTML page, JS handles navigation |
| **Component** | Reusable UI unit (function returning JSX) |
| **State** | Data that changes over time inside a component |
| **Props** | Inputs passed into a component from its parent |
| **Hook** | Function starting with `use` that taps into React features (`useState`, `useEffect`) |
| **JSX** | JavaScript XML — HTML-like syntax in JS files |
| **fetch** | Browser API for HTTP requests, returns a Promise |
| **async/await** | Cleaner syntax for working with Promises |
| **CORS** | Cross-Origin Resource Sharing — browser security for API calls from different domains |
| **HMR** | Hot Module Replacement — Vite updates code in browser without full reload |
| **Client-side routing** | URL changes handled by JavaScript, no server round-trip |
| **Controlled component** | Form input whose value is controlled by React state |
| **Immutable** | Not changed in place — create new copy instead |
| **Market cap** | Price × circulating supply — total value of all coins |
| **24h change** | Percentage price change over the last 24 hours |

---

## 13. How to Run the Project

```bash
# Install dependencies (first time only)
npm install

# Start development server (usually http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linter
npm run lint
```

---

## Quick Reference: State Variables Cheat Sheet

### Home.jsx
```
coins          → API response array
loading        → true while fetching
error          → error message string or null
viewMode       → "grid" | "list"
sortBy         → "rank" | "name" | "price-asc" | "price-desc" | "change" | "market-cap"
searchQuery    → search input text
```

### CoinDetail.jsx
```
coin           → full coin object from detail API
loading        → true while fetching coin
error          → error message or null
chartData      → [{ date, price }, ...] for Recharts
chartLoading   → true while fetching chart
id             → from useParams(), e.g. "bitcoin"
```

---

## Final Tips for the Interview

1. **Walk through the user journey** — "User lands on home, sees 100 coins, searches for ETH, clicks it, sees chart and stats."
2. **Know your data flow** — API → state → JSX. That's the core loop.
3. **Be honest about AI assistance** — "I used AI to scaffold and iterate, but I understand the architecture: React components, fetch to CoinGecko, client-side filter/sort, React Router for pages."
4. **Have one improvement ready** — Shows growth mindset.
5. **Run the app before the interview** — Click around so behavior matches what you describe.

Good luck!
