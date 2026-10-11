# 🍽️ Restaurant App with Backend Server & Database (Assignment 2)

This project integrates a **React Native (Expo)** app with a **Node.js + Express** backend server and a **MongoDB** database. It includes JWT authentication, role-based access control (Customer / Manager), menu management, orders, and reservations.

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile App | React Native (Expo) |
| Backend | Node.js, Express |
| Database | MongoDB (Atlas / Compass) |
| Authentication | JWT (JSON Web Token) |
| API Testing | Postman / Thunder Client |

---

## 🛠️ How to Run the Server

### 1. Install Dependencies

Navigate to the server folder and install the npm packages:

```bash
cd server
npm install
```

### 2. Set Up Environment Variables (`.env`)

Create a `.env` file in the root of the `server` directory (follow `.env.example`):

```env
PORT=5000
MONGO_URI=mongodb+srv://your_username:your_password@cluster0.mongodb.net/restaurant_app
JWT_SECRET=supersecretjwtkey123
```

> ⚠️ **Note:** Do not commit the `.env` file to GitHub.

### 3. Seed the Database

Run the seed script to populate the database with initial users, menu items, and tables:

```bash
npm run seed
```

### 4. Run the Development Server

Start the backend server with Nodemon:

```bash
npm run dev
```

The server will run at `http://localhost:5000`.

---

## 🌐 Where to Change BASE_URL

Update the backend API address in the mobile app's network request client.

**File path:** `src/api/client.js`

```javascript
// Real Device Testing (same Wi-Fi network)
export const BASE_URL = 'http://192.168.X.X:5000/api';

// Android Emulator
// export const BASE_URL = 'http://10.0.2.2:5000/api';
```

> 💡 Replace `192.168.X.X` with your computer's local IPv4 address (`ipconfig` on Windows, `ifconfig` on Mac/Linux). Your phone and computer must be on the **same Wi-Fi network**.

---

## 🔑 Seeded Credentials

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@test.com | Password1 |
| Manager | manager@test.com | Password1 |

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Access | Request Body | Response |
|--------|----------|--------|--------------|----------|
| POST | `/api/auth/register` | Public | name, email, password | User object & JWT token |
| POST | `/api/auth/login` | Public | email, password | User info & JWT token |

### Menu

| Method | Endpoint | Access | Request Body | Response |
|--------|----------|--------|--------------|----------|
| GET | `/api/menu` | Public | None | List of menu items |
| GET | `/api/menu/:id` | Public | None | Single menu item details |
| POST | `/api/menu` | Manager | name, price, category, ... | Created menu item |
| PUT | `/api/menu/:id` | Manager | price / updated fields | Updated menu item |
| DELETE | `/api/menu/:id` | Manager | None | Delete confirmation |

### Orders

| Method | Endpoint | Access | Request Body | Response |
|--------|----------|--------|--------------|----------|
| POST | `/api/orders` | Customer | items, orderType, table, ... | Placed order object |
| GET | `/api/orders/my` | Customer | None | Logged-in user's order history |
| GET | `/api/orders` | Manager | None | All orders in the system |
| PATCH | `/api/orders/:id/status` | Manager | status | Updated order status |

### Reservations

| Method | Endpoint | Access | Request Body | Response |
|--------|----------|--------|--------------|----------|
| POST | `/api/reservations` | Customer | date, time, guests, table | Reservation object |
| GET | `/api/reservations/my` | Customer | None | Logged-in user's reservations |
| GET | `/api/reservations` | Manager | None | All reservations in the system |
| PATCH | `/api/reservations/:id` | Manager | status | Updated reservation status |

### Health Check

| Method | Endpoint | Access | Response |
|--------|----------|--------|----------|
| GET | `/api/health` | Public | Server status |

---

## 📸 Screenshots Overview

All screenshots are saved in the `A2/screenshots/` folder. The following screenshots are included:

### Question 2 — Server Health Route

| File | What it shows |
|------|---------------|
| `health_postman.png` | Postman / Thunder Client health check (`GET /api/health`) |
| `health_phone.png` | Health route opened in the phone browser |

### Question 3 — MongoDB Database

| File | What it shows |
|------|---------------|
| `mongo_seed.png` | Compass / Atlas `menuitems` collection after seeding |

### Question 4 & 5 — Menu & Auth API Verification

| File | What it shows |
|------|---------------|
| `menu_200.png` | Menu items list (200 OK) |
| `menu_400.png` | Invalid menu item ID (400 Bad Request) |
| `postman_401.png` | Protected route without token (401 Unauthorized) |
| `postman_403.png` | Customer token on a manager-only route (403 Forbidden) |
| `postman_201.png` | Manager token creating a menu item (201 Created) |

### Question 6 — Dual Device Live Sync

| File | What it shows |
|------|---------------|
| `dual_device.png` | Real-time price update visible on both devices |

---

## 🎥 Question 7 — Video Demonstration

Multi-device live order tracking and reservation test:

👉 [**Click here to watch the demo video**](https://drive.google.com/file/d/1nluqLpHGCU2oscgEAG44Z_BIyk31-oYB/view?usp=drivesdk)

---

## 👩‍💻 Author

**Zainab Farhan** — BS Artificial Intelligence
