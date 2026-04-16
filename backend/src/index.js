require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const app = express();

// ─── CORS — handles both local dev and GitHub Pages ──────────
const allowedOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  // GitHub Pages — catches any username/repo combo
  /^https:\/\/[a-z0-9-]+\.github\.io$/,
  /^https:\/\/[a-z0-9-]+\.github\.io\/.*$/,
];

// Add FRONTEND_URL from env if set
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, mobile apps)
    if (!origin) return callback(null, true);
    const allowed = allowedOrigins.some((o) =>
      typeof o === "string" ? o === origin : o.test(origin)
    );
    if (allowed) return callback(null, true);
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ─── Security & Parsing ──────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

// ─── Rate Limiting ───────────────────────────────────────────
app.use("/api/", rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use("/api/auth/", rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));

// ─── Routes ──────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "🌿 ReWear API is running", version: "1.0.0", health: "/api/health" }));
app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

app.use("/api/auth",     require("./routes/auth.routes"));
app.use("/api/items",    require("./routes/item.routes"));
app.use("/api/orders",   require("./routes/order.routes"));
app.use("/api/users",    require("./routes/user.routes"));
app.use("/api/wishlist", require("./routes/wishlist.routes"));
app.use("/api/admin",    require("./routes/admin.routes"));

// ─── 404 ─────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌", err.message);
  if (err.message?.startsWith("CORS blocked")) return res.status(403).json({ error: err.message });
  if (err.code === "P2002") return res.status(409).json({ error: "A record with that value already exists." });
  if (err.code === "P2025") return res.status(404).json({ error: "Record not found." });
  if (err.code === "LIMIT_FILE_SIZE") return res.status(400).json({ error: "Image too large. Max 5MB." });
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 ReWear API on port ${PORT} [${process.env.NODE_ENV || "development"}]`));
module.exports = app;
