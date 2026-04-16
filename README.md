# ReWear — Full-Stack Sustainable Fashion Exchange
### PERN Stack · Prisma ORM · Cloudinary · Neon PostgreSQL · Render

---

## ⚡ Quick Start (5 Minutes)

### Prerequisites
- Node.js v18+
- Free accounts at: [neon.tech](https://neon.tech), [cloudinary.com](https://cloudinary.com)

```bash
# 1. Enter backend
cd rewear/backend

# 2. Install dependencies
npm install

# 3. Copy and fill env file
cp .env.example .env
# → Edit .env with your Neon DB URL, JWT secret, Cloudinary keys

# 4. Push schema to database
npm run db:push

# 5. Seed sample data
npm run db:seed

# 6. Start server
npm run dev
# ✅ API running at http://localhost:5000
```

Then open `frontend/index.html` with VS Code Live Server (port 5500).

**Default credentials after seed:**
| Role  | Email                  | Password      |
|-------|------------------------|---------------|
| Admin | admin@rewear.com       | admin123      |
| User  | sarah@rewear.com       | password123   |

---

## 📁 Project Structure

```
rewear/
├── README.md
├── frontend/                       ← Static HTML/CSS/JS (no build step)
│   ├── index.html                  ← Homepage + Auth modals
│   ├── browse.html                 ← Browse + filter items
│   ├── dashboard.html              ← User dashboard
│   ├── add-item.html               ← List new item
│   ├── admin.html                  ← Admin panel
│   ├── about.html                  ← About page
│   ├── css/
│   │   └── styles.css              ← Full design system
│   ├── js/
│   │   └── api.js                  ← API client (single source of truth)
│   └── images/
│       └── avatar-placeholder.png
│
└── backend/
    ├── .env.example
    ├── .gitignore
    ├── package.json
    ├── prisma/
    │   ├── schema.prisma           ← All DB models
    │   └── seed.js                 ← Sample data seeder
    └── src/
        ├── index.js                ← Express entry point + CORS
        ├── config/
        │   ├── prisma.js           ← Prisma singleton
        │   └── cloudinary.js       ← Multer + Cloudinary
        ├── middleware/
        │   ├── auth.middleware.js  ← JWT verify + requireAdmin
        │   └── validate.middleware.js
        ├── controllers/            ← Thin request/response handlers
        │   ├── auth.controller.js
        │   ├── item.controller.js
        │   ├── order.controller.js
        │   ├── user.controller.js
        │   ├── wishlist.controller.js
        │   └── admin.controller.js
        ├── services/               ← All business logic lives here
        │   ├── auth.service.js
        │   ├── item.service.js
        │   ├── order.service.js
        │   ├── user.service.js
        │   ├── wishlist.service.js
        │   └── admin.service.js
        └── routes/
            ├── auth.routes.js
            ├── item.routes.js
            ├── order.routes.js
            ├── user.routes.js
            ├── wishlist.routes.js
            └── admin.routes.js
```

---

## 🔧 Environment Variables

Create `backend/.env` from the example:

```env
PORT=5000
NODE_ENV=development

# Neon PostgreSQL (get from neon.tech → project → connection string)
DATABASE_URL="postgresql://USER:PASSWORD@HOST/rewear?sslmode=require"

# Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_64_char_random_secret
JWT_EXPIRES_IN=7d

# Cloudinary (from cloudinary.com → dashboard)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Your frontend origin (no trailing slash)
FRONTEND_URL=http://localhost:5500
```

---

## 🌐 API Reference

| Method | Endpoint                    | Auth     | Description              |
|--------|-----------------------------|----------|--------------------------|
| GET    | `/`                         | ❌       | Health / welcome         |
| GET    | `/api/health`               | ❌       | Status check             |
| POST   | `/api/auth/register`        | ❌       | Create account           |
| POST   | `/api/auth/login`           | ❌       | Login → JWT token        |
| GET    | `/api/auth/me`              | ✅ JWT   | Current user profile     |
| GET    | `/api/items`                | ❌       | Browse items (filterable)|
| GET    | `/api/items/:id`            | ❌       | Single item              |
| GET    | `/api/items/mine`           | ✅ JWT   | My listings              |
| POST   | `/api/items`                | ✅ JWT   | Create listing           |
| PUT    | `/api/items/:id`            | ✅ JWT   | Update listing           |
| DELETE | `/api/items/:id`            | ✅ JWT   | Delete listing           |
| GET    | `/api/orders`               | ✅ JWT   | My orders                |
| POST   | `/api/orders`               | ✅ JWT   | Request an item          |
| PATCH  | `/api/orders/:id/accept`    | ✅ JWT   | Accept (seller)          |
| PATCH  | `/api/orders/:id/reject`    | ✅ JWT   | Reject (seller)          |
| PATCH  | `/api/orders/:id/complete`  | ✅ JWT   | Mark complete            |
| GET    | `/api/wishlist`             | ✅ JWT   | My wishlist              |
| POST   | `/api/wishlist/:itemId`     | ✅ JWT   | Add to wishlist          |
| DELETE | `/api/wishlist/:itemId`     | ✅ JWT   | Remove from wishlist     |
| GET    | `/api/users/:id`            | ❌       | Public profile           |
| PUT    | `/api/users/me`             | ✅ JWT   | Update my profile        |
| PATCH  | `/api/users/me/password`    | ✅ JWT   | Change password          |
| GET    | `/api/admin/stats`          | 🔒 ADMIN | Platform stats           |
| GET    | `/api/admin/users`          | 🔒 ADMIN | All users                |
| PATCH  | `/api/admin/users/:id`      | 🔒 ADMIN | Activate/ban/promote     |
| GET    | `/api/admin/items`          | 🔒 ADMIN | All listings             |
| PATCH  | `/api/admin/items/:id`      | 🔒 ADMIN | Archive/restore          |
| GET    | `/api/admin/orders`         | 🔒 ADMIN | All orders               |

---

## 🧪 Postman Testing Guide

### Step 1 — Import these test cases

**Health check:**
```
GET http://localhost:5000/api/health
Expected: { "status": "ok" }
```

**Register:**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "password": "password123"
}
Expected: 201 + token + user object
```

**Login:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{ "email": "test@example.com", "password": "password123" }
→ Copy the token from response
```

**Browse items:**
```
GET http://localhost:5000/api/items
GET http://localhost:5000/api/items?category=DRESSES&limit=5
GET http://localhost:5000/api/items?search=denim&page=1
```

**Create a listing (multipart/form-data):**
```
POST http://localhost:5000/api/items
Authorization: Bearer <your_token>
Body → form-data:
  title       = "My Test Jacket"
  description = "Great condition, worn twice"
  category    = OUTERWEAR
  size        = M
  condition   = EXCELLENT
  points      = 65
  images      = [select any image file]
Expected: 201 + item object
```

**Check Neon DB:**  
After creating an item, go to neon.tech → Tables → Item → you should see the new row.

**Request an item:**
```
POST http://localhost:5000/api/orders
Authorization: Bearer <your_token>
Content-Type: application/json

{ "itemId": 1, "note": "Love this jacket!" }
Expected: 201 + order object
```

**Admin login + stats:**
```
POST http://localhost:5000/api/auth/login
{ "email": "admin@rewear.com", "password": "admin123" }
→ Copy admin token

GET http://localhost:5000/api/admin/stats
Authorization: Bearer <admin_token>
Expected: { totalUsers, totalItems, totalOrders, completedOrders }
```

---

## 🚀 Deployment

### Step 1 — Database (Neon — Free)
1. Go to [neon.tech](https://neon.tech) → Create project → name it `rewear`
2. Copy the **Connection String** (it looks like `postgresql://USER:PASS@HOST/rewear?sslmode=require`)
3. Save it — you'll use it as `DATABASE_URL` in Render

### Step 2 — Backend (Render — Free)
1. Push your `backend/` folder to a **new GitHub repo** (separate from frontend)
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect the repo
4. Configure:
   - **Runtime:** Node
   - **Build Command:** `npm install && npx prisma generate && npx prisma db push`
   - **Start Command:** `npm start`
5. Add Environment Variables (from your `.env`):
   - `DATABASE_URL` — your Neon connection string
   - `JWT_SECRET` — your random secret
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `FRONTEND_URL` — your GitHub Pages URL (e.g. `https://your-username.github.io`)
   - `NODE_ENV` — `production`
6. Deploy → wait ~3 minutes → copy your Render URL

### Step 3 — Seed Production DB
After first deploy succeeds, go to Render → your service → Shell tab:
```bash
node prisma/seed.js
```

### Step 4 — Frontend (GitHub Pages)
1. Open `frontend/js/api.js`
2. Change line 2:
```js
// FROM:
const API_BASE = "https://rewear-backend-9coe.onrender.com/api";
// TO:
const API_BASE = "https://YOUR-ACTUAL-RENDER-URL.onrender.com/api";
```
3. Push the `frontend/` folder to a GitHub repo
4. Go to repo → Settings → Pages → Source: `main` branch → `/root` → Save
5. Your site is live at `https://your-username.github.io/your-repo-name/`

---

## 🔐 Security Features

| Feature | Implementation |
|---------|---------------|
| Passwords | bcrypt (12 rounds) |
| Auth | JWT (7-day expiry) |
| CORS | Regex-based GitHub Pages wildcard match |
| Rate limiting | 200 req/15min global, 20 req/15min on auth |
| Headers | Helmet.js security headers |
| Input validation | express-validator on all POST/PUT routes |
| Admin protection | JWT + role double-check on every admin route |
| Points transfer | Prisma `$transaction` — atomic, all-or-nothing |

---

## 🐛 The 3 Bugs That Were Fixed

| # | Bug | Root Cause | Fix |
|---|-----|-----------|-----|
| 1 | Login silently does nothing | `API_BASE` was a placeholder URL never updated | Hardcoded real Render URL directly in `api.js` |
| 2 | Forms don't submit to backend | HTML pages never had `id="loginForm"` etc. added | New frontend has correct IDs built-in from scratch |
| 3 | CORS blocks GitHub Pages requests | Exact-string match failed for GitHub Pages paths | Regex pattern now matches all `*.github.io` origins |

---

## 📈 V2 Roadmap
- [ ] Google OAuth (Passport.js)
- [ ] Real-time notifications (Socket.io)
- [ ] Review & rating system post-exchange
- [ ] Razorpay/UPI payment integration
- [ ] PWA manifest + service worker
- [ ] Email notifications (Resend)
