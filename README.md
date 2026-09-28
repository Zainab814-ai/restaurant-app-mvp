# Restaurant App MVP

Frontend-only React Native (Expo) restaurant app for Assignment 1 (Fall 2026). Customers browse the menu, search, manage a cart, reserve tables and track orders. Managers handle incoming orders, reservations and menu items. There is no backend, external API or state management library; all data is mock data held in React state and persisted with AsyncStorage.

**Demo video (3 min):** [Watch the full flow](https://drive.google.com/file/d/1Rl0SzBMGW-FNIBGUJy4tWNOhiSVDPq5r/view?usp=drivesdk)

---

## Installation

**Requirements:** Node.js 18 or higher, npm, and the Expo Go app on your phone (or Android Studio / Xcode for an emulator).

```bash
git clone https://github.com/YOUR-USERNAME/restaurant-app-mvp.git
cd restaurant-app-mvp
npm install
npx expo start -c
```

**Run the app**
- **Expo Go (phone):** scan the QR code shown in the terminal. Android: Expo Go app scanner. iOS: default Camera app.
- **Emulator:** press `a` in the terminal for the Android emulator, or `i` for the iOS simulator.

---

## Mock Login Credentials

| Role     | Email             | Password  |
|----------|-------------------|-----------|
| Customer | customer@test.com | Password1 |
| Manager  | manager@test.com  | Password1 |

Signup is also available and lets you choose Customer or Manager as the role.

---

## Hooks Used Per Screen

| Screen / File | Hooks | Used for |
|---|---|---|
| `LoginScreen.js` | `useState`, `useForm`, `useAuth` | Login/Signup mode, show-password toggle, `isSubmitting`, validation errors, storing the user in AuthContext |
| `MenuScreen.js` | `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`, `useDebounce`, `useCart` | 1.5s simulated fetch with timer cleanup, category chips, pull to refresh, header title count, search input ref, FlatList ref, back-to-top button, render counter, recent searches, filter + search + sort as derived data |
| `MenuItemCard.js` | `React.memo` | Re-renders only when its own props change |
| `ProfileScreen.js` | `useAuth`, `useTheme` | Shows name, email, role; logout; light/dark switch |
| `CartScreen.js` | `useCart` (`useReducer`), `useState` | Quantity stepper, remove, per-item note, promo code, Dine-in/Takeaway choice |
| `OrderSummaryScreen.js` | `useMemo`, `useCart` | Subtotal, 5% service charge, 15% tax, discount, grand total |
| `ReservationScreen.js` | `useReservation`, `useForm`, `useState` | Date, time slot, party size, table, contact details, availability, confirmation modal, My Reservations |
| `OrderTrackingScreen.js` | `useEffect` (`setInterval`), `useState`, `useOrders` | Auto status change at 10s / 20s / 30s, step indicator, elapsed timer, interval cleanup |
| `ManagerDashboard.js` | `useState`, `useOrders`, `useMenu` | Incoming Orders, Reservations, Menu Management tabs |
| `AuthContext.js` | `createContext`, `useState`, `useContext` | `user`, `login`, `logout` |
| `ThemeContext.js` | `createContext`, `useState`, `useContext` | `isDark`, `toggleTheme` |
| `CartContext.js` | `createContext`, `useReducer`, `useContext` | Cart state and dispatch |
| `OrdersContext.js` | `createContext`, `useReducer`, `useEffect`, `useContext` | Orders, reservations and menu edits saved to and loaded from AsyncStorage |
| `src/hooks/` | `useForm`, `useDebounce`, `useReservation`, `useAuth`, `useTheme`, `useCart` | Reusable logic kept out of screens |

---

## Context API vs Prop Drilling (Q6)

The logged-in user and the current theme are needed on almost every screen, including deeply nested components such as cards and buttons.
Passing them as props through every navigator and screen would force intermediate components to accept props they never use.
With AuthContext and ThemeContext, any component reads them directly through `useAuth` and `useTheme`.
The whole app is wrapped in both providers, so toggling the theme or logging out updates every screen instantly.
Both hooks throw an error if used outside their provider, which catches wiring mistakes early.
**Drawback:** when a context value changes, every component that consumes that context re-renders, even if it only uses a small unchanged part of the value.

---

## useReducer vs useState for the Cart (Q7)

The cart has related fields (`items`, `promoCode`, `discountPercent`) that must change together, for example clearing the cart while removing the promo.
A reducer keeps all eight transitions in one pure function (`cartReducer.js`), so the logic is testable without rendering any UI.
With `useState`, each handler would rebuild nested item arrays by hand, and the update rules would be scattered across components.
`useState` would have been enough if the cart only stored a simple list of item ids with no quantities, notes or promo code.

### Reducer Test Cases

State shape: `{ items, promoCode, discountPercent }`. Item shape: `{ id, name, price, quantity, note }`.

| # | Action | Initial state | Expected state |
|---|---|---|---|
| 1 | `ADD_ITEM` (id 1) | `items: []` | `items: [{ id: 1, quantity: 1, note: "" }]` |
| 2 | `ADD_ITEM` (id 1, already in cart) | `items: [{ id: 1, quantity: 1 }]` | one item, `quantity: 2` |
| 3 | `INCREMENT` (id 1) | `items: [{ id: 1, quantity: 2 }]` | `quantity: 3` |
| 4 | `DECREMENT` (id 1) | `items: [{ id: 1, quantity: 2 }]` | `quantity: 1` |
| 5 | `DECREMENT` (id 1) | `items: [{ id: 1, quantity: 1 }]` | `items: []` (item removed at zero) |
| 6 | `REMOVE_ITEM` (id 1) | `items: [{ id: 1 }, { id: 2 }]` | `items: [{ id: 2 }]` |
| 7 | `UPDATE_NOTE` (id 1, "no onions") | `items: [{ id: 1, note: "" }]` | `note: "no onions"` |
| 8 | `APPLY_PROMO` ("WELCOME10") | `promoCode: null, discountPercent: 0` | `promoCode: "WELCOME10", discountPercent: 10` |
| 9 | `APPLY_PROMO` ("FAKE99") | `promoCode: null, discountPercent: 0` | state unchanged, error message shown |
| 10 | `REMOVE_PROMO` | `promoCode: "FEAST20", discountPercent: 20` | `promoCode: null, discountPercent: 0` |
| 11 | `CLEAR_CART` | two items in cart | `items: []` |

---

## Project Structure

```
restaurant-app-mvp/
├── A1/
│   ├── SRS.pdf
│   ├── UML/            (use case, class, sequence, state machine, component)
│   ├── Q4_Note.txt
│   └── screenshots/
└── src/
    ├── components/
    ├── screens/
    ├── context/
    ├── reducers/
    ├── hooks/
    ├── data/
    └── navigation/
```
